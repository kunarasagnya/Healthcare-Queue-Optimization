# app.py — Healthcare Queue Wait Time Prediction API
# MSc Data Science — Osmania University — Objective 5
# Model: Random Forest Regressor (n_estimators=150, max_depth=10, random_state=42)
# Run:   uvicorn app:app --reload
# Docs:  http://127.0.0.1:8000/docs

import math
import json
import pickle

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ── Load model artefacts ─────────────────────────────────────────────────────
with open("rf_wait_time_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("feature_names.pkl", "rb") as f:
    feature_names = pickle.load(f)

with open("meta.json", "r") as f:
    META = json.load(f)

# ── FastAPI setup ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Healthcare Queue Optimisation API",
    description=(
        "Predicts ER patient wait time using a trained Random Forest model. "
        "Built for Osmania University MSc Data Science — Capstone Project II."
    ),
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory="static"), name="static")


# ── Pydantic models ───────────────────────────────────────────────────────────
class PatientVisit(BaseModel):
    nurse_to_patient_ratio: int
    specialist_availability: int
    facility_size_beds: int
    urgency_level: str       # Critical / High / Medium / Low
    time_of_day: str         # Early Morning / Late Morning / Afternoon / Evening / Night
    day_of_week: str         # Monday ... Sunday
    season: str              # Spring / Summer / Fall / Winter
    region: str              # Urban / Rural


class PredictionResponse(BaseModel):
    predicted_wait_time_minutes: float
    risk_level: str
    recommendation: str


class QueueRequest(BaseModel):
    servers: int
    lam_factor: float = 1.0
    service_reduction: float = 0.0


class QueueResponse(BaseModel):
    servers: int
    utilization: float
    prob_wait: float
    queue_length: float
    wq_min: float
    w_min: float
    lambda_rate: float
    mu_rate: float
    mean_service_min: float
    status: str


# ── Helper: encode input to model feature vector ─────────────────────────────
def encode_input(visit: PatientVisit) -> pd.DataFrame:
    row = {feat: 0 for feat in feature_names}
    row["Nurse-to-Patient Ratio"]  = visit.nurse_to_patient_ratio
    row["Specialist Availability"] = visit.specialist_availability
    row["Facility Size (Beds)"]    = visit.facility_size_beds

    cat_map = {
        "Urgency Level_": visit.urgency_level,
        "Time of Day_":   visit.time_of_day,
        "Day of Week_":   visit.day_of_week,
        "Season_":        visit.season,
        "Region_":        visit.region,
    }
    for feat in feature_names:
        for prefix, value in cat_map.items():
            if feat == prefix + value:
                row[feat] = 1

    return pd.DataFrame([row])[feature_names]


# ── Helper: M/M/c queue metrics — exact notebook implementation (Section 8) ──
def mmc_metrics(lam: float, mu: float, c: int):
    rho = lam / (c * mu)
    if rho >= 1:
        return None

    a             = lam / mu
    sum_terms     = sum((a ** n) / math.factorial(n) for n in range(c))
    erlang_c_term = (a ** c) / (math.factorial(c) * (1 - rho))
    P0  = 1 / (sum_terms + erlang_c_term)
    Pq  = erlang_c_term * P0
    Lq  = Pq * rho / (1 - rho)
    Wq  = Lq / lam
    W   = Wq + 1 / mu
    L   = lam * W

    return {
        "servers":      c,
        "utilization":  round(rho, 4),
        "prob_wait":    round(Pq, 4),
        "queue_length": round(Lq, 4),
        "wq_min":       round(Wq * 60, 2),
        "w_min":        round(W  * 60, 2),
        "l_in_system":  round(L, 4),
    }


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def serve_frontend():
    return FileResponse("static/index.html")


@app.get("/health")
def health_check():
    return {"status": "ok", "model": "RandomForestRegressor", "features": len(feature_names)}


@app.get("/meta")
def get_meta():
    return META


@app.post("/predict", response_model=PredictionResponse)
def predict_wait_time(visit: PatientVisit):
    """
    Predicts total ER wait time using the trained Random Forest model.
    Risk thresholds: Low < 60 min | Medium 60–120 min | High > 120 min
    """
    X_input   = encode_input(visit)
    pred_time = max(0.0, round(float(model.predict(X_input)[0]), 2))

    if pred_time < 60:
        risk = "Low"
    elif pred_time <= 120:
        risk = "Medium"
    else:
        risk = "High"

    if visit.urgency_level == "Critical":
        rec = "CRITICAL urgency — patient must be seen immediately regardless of queue."
    elif pred_time > 120:
        rec = "High wait time predicted. Open an additional consultation room or fast-track triage."
    elif pred_time > 90:
        rec = "Elevated wait time. Consider reassigning triage nurses or adding a server during peak hours."
    elif pred_time > 60:
        rec = "Moderate wait time. Monitor queue; maintain current staffing or pre-register patients digitally."
    else:
        rec = "Wait time within acceptable range. Current staffing level is adequate."

    return PredictionResponse(
        predicted_wait_time_minutes=pred_time,
        risk_level=risk,
        recommendation=rec
    )


@app.post("/queue", response_model=QueueResponse)
def queue_optimisation(req: QueueRequest):
    """
    Computes M/M/c queue metrics.
    lam_factor=2.0 simulates peak-surge demand.
    service_reduction=0.2 simulates 20% faster service.
    """
    lam_base         = META["lambda_rate"]
    mean_service_min = META["mean_service_min"]

    lam = lam_base * req.lam_factor
    mu  = 60 / (mean_service_min * (1 - req.service_reduction))

    result = mmc_metrics(lam, mu, req.servers)

    if result is None:
        rho = lam / (req.servers * mu)
        return QueueResponse(
            servers=req.servers,
            utilization=round(rho, 4),
            prob_wait=1.0,
            queue_length=9999.0,
            wq_min=9999.0,
            w_min=9999.0,
            lambda_rate=round(lam, 4),
            mu_rate=round(mu, 4),
            mean_service_min=round(mean_service_min, 2),
            status="Unstable — rho >= 1, system overloaded. Add more servers."
        )

    return QueueResponse(
        servers=result["servers"],
        utilization=result["utilization"],
        prob_wait=result["prob_wait"],
        queue_length=result["queue_length"],
        wq_min=result["wq_min"],
        w_min=result["w_min"],
        lambda_rate=round(lam, 4),
        mu_rate=round(mu, 4),
        mean_service_min=round(mean_service_min, 2),
        status="Stable"
    )
