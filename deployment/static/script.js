// script.js — Healthcare Queue Optimisation Dashboard
// MSc Data Science · Osmania University · Capstone Project II
//
// Responsibilities:
//   1. Fetch /meta on page load → populate all charts and static metrics
//   2. Page 1: call /predict on form submit → display result + benchmark chart
//   3. Page 2: call /queue on slider change → update metric tiles
//   4. All charts use Chart.js (CDN loaded in index.html)

"use strict";

// ── Global state ─────────────────────────────────────────────────────────────
let META        = null;   // data from /meta endpoint
let benchChart  = null;   // Page 1 benchmark chart instance
let scenChart   = null;   // Page 2 scenario chart instance
let wqChart     = null;   // Page 2 Wq-vs-servers chart instance
let featChart   = null;   // Page 3 feature importance chart instance
let peakChart   = null;   // Page 3 peak/non-peak chart instance
let urgChart    = null;   // Page 3 urgency chart instance

// Average queue-stage times from the dataset (used in breakdown bars, Page 1)
const STAGE_AVGS = {
  registration: 11.21,
  triage:       23.37,
  medical:      43.53
};

// ── Page navigation ───────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");

  // Mark the clicked button active
  document.querySelectorAll(".tab-btn").forEach(b => {
    if (b.textContent.toLowerCase().includes(name === "predict" ? "prediction"
          : name === "queue" ? "queue" : "insights")) {
      b.classList.add("active");
    }
  });

  // Initialise charts the first time each page is visited
  if (name === "queue"    && META && !scenChart) buildQueuePageCharts();
  if (name === "insights" && META && !featChart)  buildInsightCharts();
}

// ── On page load: fetch metadata and initialise everything ───────────────────
window.addEventListener("DOMContentLoaded", () => {
  fetch("/meta")
    .then(r => r.json())
    .then(data => {
      META = data;
      populateStaticMetrics();
      runQueue();     // compute default queue state (c=2, baseline)
    })
    .catch(err => console.error("Failed to load /meta:", err));
});

// ── Populate static metrics (header values, insight tiles) ───────────────────
function populateStaticMetrics() {
  // Page 1 header
  setText("r2-val",   META.r2);
  setText("rmse-val", META.rmse);

  // Page 3 model metrics
  setText("ins-r2",   META.r2);
  setText("ins-rmse", META.rmse);
  setText("ins-mae",  META.mae);

  // Page 3 HMIS tile
  setText("hmis-lam", META.lambda_rate);
}

// ── Page 1: Submit prediction ─────────────────────────────────────────────────
function submitPrediction() {
  const body = {
    nurse_to_patient_ratio:  parseInt(v("nurse_ratio")),
    specialist_availability: parseInt(v("specialist")),
    facility_size_beds:      parseInt(v("facility_beds")),
    urgency_level:           v("urgency_level"),
    time_of_day:             v("time_of_day"),
    day_of_week:             v("day_of_week"),
    season:                  v("season"),
    region:                  v("region")
  };

  hide("pred-error");

  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(data => {
    if (data.detail) {
      showError("pred-error", "API error: " + JSON.stringify(data.detail));
      return;
    }
    showPredictionResult(data, body);
  })
  .catch(err => showError("pred-error", "Request failed: " + err.message));
}

function showPredictionResult(data, body) {
  const wt = data.predicted_wait_time_minutes;

  // Numeric result
  setText("wait-num", Math.round(wt));

  // Risk badge
  const badge = document.getElementById("risk-badge");
  badge.textContent = data.risk_level;
  badge.className   = "risk-badge risk-" + data.risk_level.toLowerCase();

  // Recommendation
  setText("rec-text", data.recommendation);

  // Stage breakdown bars (proportional to dataset averages)
  const total = STAGE_AVGS.registration + STAGE_AVGS.triage + STAGE_AVGS.medical;
  setBar("bar-reg", "val-reg", STAGE_AVGS.registration, total);
  setBar("bar-tri", "val-tri", STAGE_AVGS.triage,        total);
  setBar("bar-med", "val-med", STAGE_AVGS.medical,       total);

  show("result-panel");

  // Build/update benchmark chart
  buildBenchmarkChart(wt, body.urgency_level);
  show("gauge-card");
}

function buildBenchmarkChart(predicted, urgencyLevel) {
  const um = META.urgency_means;
  const labels   = ["Your Prediction", "Critical", "High", "Medium", "Low"];
  const values   = [predicted, um.Critical, um.High, um.Medium, um.Low];
  const colours  = [
    "#2b6cb0",
    "#e53e3e", "#f6882f", "#1f77b4", "#38a169"
  ];

  const ctx = document.getElementById("benchmarkChart").getContext("2d");
  if (benchChart) benchChart.destroy();
  benchChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Wait Time (min)",
        data: values,
        backgroundColor: colours,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.parsed.y.toFixed(1) + " min"
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Total Wait Time (min)" }
        }
      }
    }
  });
}

// ── Page 2: Queue optimisation ────────────────────────────────────────────────
function runQueue() {
  const servers   = parseInt(v("servers"));
  const lamFactor = parseFloat(v("lam_factor"));
  const svcRedn   = parseFloat(v("service_reduction"));

  const body = {
    servers:           servers,
    lam_factor:        lamFactor,
    service_reduction: svcRedn
  };

  fetch("/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(data => updateQueueMetrics(data))
  .catch(err => console.error("Queue API error:", err));
}

function updateQueueMetrics(data) {
  const isUnstable = data.status.toLowerCase().startsWith("unstable");

  // Status badge
  const badge = document.getElementById("queue-status-badge");
  badge.textContent = isUnstable ? "⚠️ Unstable" : "✓ Stable";
  badge.className   = "status-badge " + (isUnstable ? "status-unstable" : "status-stable");

  setText("m-rho",     (data.utilization * 100).toFixed(1) + "%");
  setText("m-pq",      (data.prob_wait   * 100).toFixed(1) + "%");
  setText("m-wq",      isUnstable ? "∞" : data.wq_min.toFixed(1) + " min");
  setText("m-w",       isUnstable ? "∞" : data.w_min.toFixed(1)  + " min");
  setText("m-lq",      isUnstable ? "∞" : data.queue_length.toFixed(3));
  setText("m-servers", data.servers);

  setText("q-lam", data.lambda_rate.toFixed(4) + " patients/hr");
  setText("q-mu",  data.mu_rate.toFixed(4)     + " patients/hr/server");
  setText("q-svc", data.mean_service_min.toFixed(2) + " min");
}

function buildQueuePageCharts() {
  buildScenarioChart();
  buildWqChart();
}

function buildScenarioChart() {
  // Data from notebook Section 9 (pre-computed in meta.json)
  const scenarios = META.scenarios;
  const labels    = scenarios.map(s => s.scenario);
  const wqs       = scenarios.map(s => typeof s.wq_min === "number" ? s.wq_min : 0);
  const colours   = wqs.map(w => w <= 30 ? "#38a169" : w <= 60 ? "#d69e2e" : "#e53e3e");

  const ctx = document.getElementById("scenarioChart").getContext("2d");
  if (scenChart) scenChart.destroy();
  scenChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Queue Wait Wq (min)",
        data: wqs,
        backgroundColor: colours,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(2) + " min" } },
        annotation: { /* no plugin needed, we use a dataset line */ }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: "Expected Queue Wait (min)" },
          grid: { color: "#e2e8f0" }
        }
      }
    }
  });
}

function buildWqChart() {
  const qr      = META.queue_results;
  const servers = qr.map(r => r.servers);
  const wqs     = qr.map(r => r.wq_min);

  const ctx = document.getElementById("wqChart").getContext("2d");
  if (wqChart) wqChart.destroy();
  wqChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: servers,
      datasets: [
        {
          label: "Wq (min)",
          data: wqs,
          borderColor: "#e53e3e",
          backgroundColor: "rgba(229,62,62,0.1)",
          borderWidth: 2.5,
          pointRadius: 5,
          fill: true,
          tension: 0.3
        },
        {
          label: "30-min Target",
          data: servers.map(() => 30),
          borderColor: "#718096",
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(2) + " min" } }
      },
      scales: {
        x: { title: { display: true, text: "Number of Servers (c)" } },
        y: { beginAtZero: true, title: { display: true, text: "Queue Wait (min)" } }
      }
    }
  });
}

// ── Page 3: Insight charts ────────────────────────────────────────────────────
function buildInsightCharts() {
  buildFeatureChart();
  buildPeakChart();
  buildUrgencyChart();
}

function buildFeatureChart() {
  const top10   = META.top10_features;
  const labels  = top10.map(([f]) => f.replace("Urgency Level_", "Urgency: ")
                                       .replace("Time of Day_",   "Time: ")
                                       .replace("Day of Week_",   "Day: ")
                                       .replace("Season_",        "Season: ")
                                       .replace("Region_",        "Region: "));
  const values  = top10.map(([, v]) => parseFloat((v * 100).toFixed(2)));
  const colours = values.map((_, i) => i === 0 ? "#e53e3e"
                                     : i  < 3  ? "#f6882f"
                                     : "#2b6cb0");

  const ctx = document.getElementById("featureChart").getContext("2d");
  if (featChart) featChart.destroy();
  featChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Importance (%)",
        data: values,
        backgroundColor: colours,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(2) + "%" } }
      },
      scales: {
        x: { title: { display: true, text: "Feature Importance (%)" } }
      }
    }
  });
}

function buildPeakChart() {
  const ctx = document.getElementById("peakChart").getContext("2d");
  if (peakChart) peakChart.destroy();
  peakChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Peak Hours", "Non-Peak Hours"],
      datasets: [{
        label: "Mean Wait Time (min)",
        data: [META.peak_mean, META.nonpeak_mean],
        backgroundColor: ["#e53e3e", "#2b6cb0"],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + " min" } }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: Math.min(META.peak_mean, META.nonpeak_mean) - 10,
          title: { display: true, text: "Mean Wait Time (min)" }
        }
      }
    }
  });
}

function buildUrgencyChart() {
  const um      = META.urgency_means;
  const order   = ["Critical", "High", "Medium", "Low"];
  const values  = order.map(k => um[k]);
  const colours = ["#e53e3e", "#f6882f", "#2b6cb0", "#38a169"];

  const ctx = document.getElementById("urgencyChart").getContext("2d");
  if (urgChart) urgChart.destroy();
  urgChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: order,
      datasets: [{
        label: "Mean Wait Time (min)",
        data: values,
        backgroundColor: colours,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + " min" } }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Mean Wait Time (min)" } }
      }
    }
  });
}

// ── Utility helpers ───────────────────────────────────────────────────────────
function v(id)    { return document.getElementById(id).value; }
function setText(id, val)  { const el = document.getElementById(id); if (el) el.textContent = val; }
function show(id)          { document.getElementById(id).style.display = ""; }
function hide(id)          { document.getElementById(id).style.display = "none"; }
function showError(id, msg){ const el = document.getElementById(id); el.textContent = msg; el.style.display = ""; }

function setBar(barId, valId, value, total) {
  const pct = (value / total * 100).toFixed(0);
  document.getElementById(barId).style.width = pct + "%";
  setText(valId, value.toFixed(1) + " min");
}
