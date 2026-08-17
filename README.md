# Healthcare Queue Optimization

## Statistical Analysis, Machine Learning and Queue Optimization for Patient Waiting Time

A data-driven healthcare queue optimization system developed as part of an **M.Sc. Data Science Capstone Project at Osmania University**. The project combines statistical analysis, machine learning, queueing theory, simulation, external validation using HMIS data, and FastAPI deployment to study and reduce patient waiting time in healthcare queue systems.

---

## 📌 Project Overview

Patient waiting time is an important measure of healthcare service efficiency. Long waiting times can occur because of high patient demand, differences in patient urgency, staffing levels, service capacity, and operational conditions.

This project focuses on understanding the factors associated with patient waiting time and developing a practical system that can both **predict waiting time** and **evaluate queue management strategies**.

The project follows a complete data science workflow:

**Data → Statistical Analysis → Exploratory Analysis → Machine Learning → Queue Optimization → Validation → Deployment**

The final system provides an interactive web dashboard where users can:

- Predict patient waiting time
- View the predicted risk level
- Examine queue-stage waiting times
- Analyse M/M/c queue performance
- Change the number of servers and demand conditions
- Perform what-if staffing analysis
- View model performance and feature importance
- Review statistical findings
- Examine HMIS-based external validation
- View practical recommendations

---

## 🎯 Problem Statement

Healthcare facilities need to manage patient queues efficiently while maintaining timely access to medical services.

Traditional analysis can describe existing waiting times, but it may not provide a complete solution for:

- Predicting the waiting time of a patient
- Identifying the major factors influencing waiting time
- Understanding differences between urgency groups
- Measuring the effect of peak demand
- Evaluating staffing requirements
- Studying the effect of additional servers
- Testing alternative operational scenarios

Therefore, this project develops a statistical and machine-learning-based framework that combines **patient waiting-time prediction with queue optimization** to support healthcare queue management.

---

## 🎯 Objectives

The main objectives of the project are:

1. To analyse patient waiting-time patterns using descriptive and exploratory statistical techniques.
2. To identify important factors associated with patient waiting time, including urgency level, time of day, day of week, season, region, staffing-related variables, and facility characteristics.
3. To statistically examine whether waiting times differ across important patient and operational groups.
4. To develop machine learning models for predicting patient waiting time.
5. To identify important predictors of waiting time using feature importance analysis.
6. To apply the M/M/c queueing model to study queue performance and server utilization.
7. To perform what-if simulations under different staffing and demand scenarios.
8. To validate the simulated healthcare demand pattern using Government of India HMIS data.
9. To implement the final prediction and queue optimization framework through a FastAPI-based interactive dashboard.

---

# 📊 Data

## 1. ER Wait Time Dataset

The ER Wait Time Dataset is the primary dataset used for the analysis and prediction component of the project.

The project uses patient and operational variables such as:

- Urgency Level
- Time of Day
- Day of Week
- Season
- Region
- Nurse-to-Patient Ratio
- Specialist Availability
- Facility Size
- Patient waiting-time information
- Queue-stage timing information

The dataset was cleaned and prepared before performing statistical analysis and model development.

---

## 2. HMIS Dataset

The **Health Management Information System (HMIS)** dataset was used as an **external validation dataset**.

The dashboard identifies the source as:

**Government of India HMIS, 2018–19**

The project dashboard states that the HMIS dataset contains:

- 160 rows
- 11 columns
- Outpatient attendance information
- Data covering Indian states

The purpose of using HMIS was not to directly replace the primary ER dataset, but to check whether the simulated patient arrival rate was reasonably consistent with real-world healthcare attendance patterns.

The dashboard reports that the simulated arrival rate was consistent with the PHC-to-CHC HMIS attendance figures.

---

# 🔬 Statistical Analysis

The project uses descriptive statistics to obtain an overall understanding of the waiting-time data before applying advanced statistical and machine-learning methods.

## Descriptive Statistical Techniques

### Central Tendency

- Mean
- Median
- Mode

These measures describe the typical or central waiting time in the dataset.

### Measures of Variability

- Standard Deviation
- Variance
- Coefficient of Variation

These measures describe how much patient waiting times vary around their average.

### Distribution Analysis

- Skewness
- Kurtosis
- Percentiles
- Quartiles
- Interquartile Range (IQR)

These techniques were used to understand the shape and spread of the waiting-time distribution and identify possible outliers.

### Frequency Analysis

Frequency distributions and cross-tabulations were used to understand categorical variables such as:

- Urgency level
- Time of day
- Region
- Season
- Patient outcome

### Correlation Analysis

Pearson correlation was used to examine relationships between continuous variables.

---

# 📈 Advanced Statistical Methods

Several statistical methods were applied to investigate important relationships and differences in patient waiting time.

## Welch's t-test

Welch's t-test was used to compare patient waiting times between:

**Peak hours vs Non-peak hours**

It is useful when comparing two groups without assuming that their variances are equal.

The project found a statistically significant difference between peak and non-peak waiting times:

**p < 0.05**

This indicates that peak hours are associated with significantly different waiting times.

---

## One-Way ANOVA

One-Way ANOVA was used to compare mean waiting times across the four urgency groups:

- Critical
- High
- Medium
- Low

The result was statistically significant:

**p < 0.001**

This indicates that waiting times are not the same across all urgency groups.

---

## Tukey HSD

Tukey's Honestly Significant Difference (HSD) test was applied after ANOVA to determine which specific urgency groups differed from one another.

The dashboard reports that the pairwise comparisons were statistically significant.

ANOVA establishes that a difference exists among the groups, while Tukey HSD identifies which pairs of groups differ.

---

## Chi-Square Test

The Chi-Square test was used to examine the association between:

**Urgency Level and Patient Outcome**

The dashboard reports:

**p < 0.001**

This indicates a statistically significant association between patient urgency and patient outcome.

---

## Kruskal-Wallis H Test

The Kruskal-Wallis test was used to examine seasonal differences in waiting-time distributions.

It provides a non-parametric alternative when the assumptions required for parametric group comparisons may not be appropriate.

The project particularly examined whether seasons such as Winter and Fall were associated with higher waiting times.

---

## OLS Regression

Ordinary Least Squares (OLS) regression was used to study the relationship between waiting time and explanatory variables.

The model provides:

- Regression coefficients
- Statistical significance
- R²
- Relationship between predictors and waiting time

OLS regression provides an interpretable statistical baseline for comparison with machine learning models.

---

# 🤖 Machine Learning

Machine learning was used to predict patient waiting time based on patient and operational characteristics.

The project evaluated regression-based prediction models and selected a **Random Forest model for the deployed application**.

## Random Forest Regression

Random Forest Regression combines multiple decision trees to produce a final prediction.

The deployed Random Forest model was trained using the cleaned dataset.

The dashboard reports the following test-set performance:

| Metric | Result |
|---|---:|
| R² | 0.9196 |
| RMSE | 17.5126 minutes |
| MAE | 12.2964 minutes |

### Interpretation

An **R² of 0.9196** indicates that the model explains approximately 91.96% of the variation in the test-set waiting-time values.

The **MAE of 12.2964 minutes** means that the model's predictions differ from the actual waiting times by about 12.3 minutes on average in absolute terms.

The **RMSE of 17.5126 minutes** gives greater weight to larger prediction errors.

---

# 🏆 Feature Importance

Random Forest feature importance was used to identify which variables contributed most to the prediction.

The dashboard's Top 10 Feature Importance visualization shows:

1. Urgency: Low
2. Urgency: Medium
3. Time: Evening
4. Season: Winter
5. Day: Monday
6. Season: Summer
7. Nurse-to-Patient Ratio
8. Facility Size
9. Time: Early Morning
10. Day: Sunday

The feature-importance visualization shows that **urgency-related variables have the strongest contribution among the displayed model features**.

Feature importance indicates model contribution and should not be interpreted as direct causal evidence.

---

# 🚑 Waiting Time by Urgency

The dashboard compares mean waiting time across urgency levels.

The visualization shows a clear difference between the groups:

- Critical patients have the lowest mean waiting time.
- High urgency patients have higher waiting time.
- Medium urgency patients have still higher waiting time.
- Low urgency patients have the highest mean waiting time.

This pattern is consistent with the purpose of clinical triage, where more urgent patients receive higher priority.

The statistical analysis supports this difference through:

**One-Way ANOVA + Tukey HSD**

with:

**p < 0.001**

---

# ⏰ Peak vs Non-Peak Analysis

The dashboard compares waiting time during:

- Peak Hours
- Non-Peak Hours

Peak hours show a higher mean waiting time than non-peak hours.

The project defines peak periods using:

- Late Morning
- Afternoon
- Evening

Welch's t-test was used to statistically evaluate the difference.

The dashboard reports:

**p < 0.05**

Therefore, the analysis indicates that peak periods are significantly associated with increased patient waiting time.

---

# 📊 Patient Wait Time Prediction Dashboard

The first page of the deployed application is the **Patient Wait Time Prediction** module.

Users can provide:

- Urgency Level
- Time of Day
- Day of Week
- Season
- Region
- Nurse-to-Patient Ratio
- Specialist Availability
- Facility Size

The system then predicts the total ER waiting time.

The dashboard also displays a risk level and a queue-stage breakdown.

### Queue-stage Breakdown

The deployed dashboard displays dataset-average values for:

- Registration
- Triage
- Medical Professional

This helps users understand how the overall patient journey is distributed across different stages.

### Dashboard Screenshot

![Patient Wait Time Prediction](https://raw.githubusercontent.com/kunarasagnya/Healthcare-Queue-Optimization/main/screenshots/wait-time-prediction.png)

---

# ⚙️ M/M/c Queue Optimization

The project applies the **M/M/c queueing model** to study healthcare queue performance.

Here:

- **M** = Markovian/random arrivals
- **M** = Markovian/random service times
- **c** = Number of parallel servers

The model considers:

- Arrival rate (λ)
- Service rate per server (μ)
- Number of servers (c)

The dashboard calculates queue-performance measures such as:

- Server utilization (ρ)
- Probability of waiting
- Queue waiting time (Wq)
- Total time in system (W)
- Queue length (Lq)

### Example Dashboard Values

The dashboard example shows:

- Arrival rate λ = 0.5627 patients/hour
- Service rate μ = 1.3784 patients/hour/server
- Number of servers c = 2
- Utilization ρ = 20.4%
- Probability of waiting = 6.9%
- Queue wait Wq = 1.9 minutes
- Total system time W = 45.4 minutes
- Queue length Lq = 0.018

These values change when the scenario controls are adjusted.

### Queue Optimization Screenshot

![M/M/c Queue Optimization](https://raw.githubusercontent.com/kunarasagnya/Healthcare-Queue-Optimization/main/screenshots/mmc-queue-optimization.png)

---

# 🔄 What-If Scenario Simulation

The project uses what-if simulation to understand how operational changes affect queue performance.

The dashboard compares scenarios such as:

- Baseline staffing
- Adding one server
- Peak demand
- Peak demand with an additional server
- 20% faster service
- 20% faster service with an additional server

This allows healthcare decision-makers to compare different staffing and service strategies before implementing them.

### What-If Scenario Screenshot

![What-If Scenario Comparison](https://raw.githubusercontent.com/kunarasagnya/Healthcare-Queue-Optimization/main/screenshots/what-if-scenarios.png)

---

# 📉 Queue Wait vs Number of Servers

The system also examines how expected queue waiting time changes as the number of servers increases.

The dashboard shows a strong reduction in queue waiting time when additional servers are introduced.

A 30-minute target line is included in the visualization as a reference for non-emergency patients.

### Visualization

![Queue Wait vs Number of Servers](https://raw.githubusercontent.com/kunarasagnya/Healthcare-Queue-Optimization/main/screenshots/queue-wait-vs-servers.png)

---

# 💡 Insights and Findings Dashboard

The third dashboard page summarizes the major findings from the complete project.

It includes:

- Model performance
- Feature importance
- Peak vs non-peak analysis
- Mean waiting time by urgency
- Statistical findings
- HMIS external validation
- Project recommendations

### Insights Dashboard

![Insights and Findings](https://raw.githubusercontent.com/kunarasagnya/Healthcare-Queue-Optimization/main/screenshots/insights-findings.png)

---

# 📋 Key Statistical Findings

| Finding | Statistical Method | Result | Interpretation |
|---|---|---|---|
| Peak vs Non-Peak Wait | Welch's t-test | p < 0.05 | Peak hours significantly increase wait time |
| Wait across urgency levels | One-Way ANOVA + Tukey HSD | p < 0.001 | Urgency groups have significantly different mean wait times |
| Urgency vs Patient Outcome | Chi-Square Test | p < 0.001 | Urgency and patient outcome are significantly associated |
| Seasonal effect | Kruskal-Wallis Test | Conditional | Seasonal differences were examined non-parametrically |
| Additional server | M/M/c Queue Theory | Wq decreases | Additional staffing can reduce queue waiting |
| HMIS validation | Comparative analysis | λ consistent | Simulated demand is consistent with HMIS attendance patterns |

---

# 🇮🇳 HMIS External Validation

External validation was performed using Government of India HMIS data from 2018–19.

The purpose was to determine whether the simulated arrival rate used in the queueing model was reasonably consistent with real-world healthcare attendance.

The dashboard reports:

**Simulated arrival rate (λ): 0.5627 patients/hour**

The validation finding indicates that the simulated λ is consistent with PHC-to-CHC HMIS attendance figures.

This provides an additional validation step beyond the primary ER dataset.

### Important Limitation

HMIS data is used as an external validation source for healthcare attendance patterns. It is not the same dataset as the ER waiting-time dataset and therefore should not be interpreted as direct patient-level validation of the waiting-time prediction model.

---

# 💡 Project Recommendations

Based on the statistical analysis, machine learning results, and queueing analysis, the dashboard provides the following recommendations:

### High Priority

- Deploy one additional doctor or consultation room during 12:00–20:00 daily.
- Introduce fast-track lanes for Low and Medium urgency patients to reduce queue mixing.

### Medium Priority

- Implement digital pre-registration to reduce registration-stage time.
- Use the trained Random Forest model for real-time wait-time estimation at triage.

### Lower Priority

- Develop an M/M/c monitoring dashboard to track arrival rate and utilization.
- Revisit staffing models seasonally, particularly during Winter.

These recommendations connect the analytical findings with practical healthcare queue-management actions.

---

# 🌐 FastAPI Deployment

The trained prediction model is integrated into a **FastAPI** application.

FastAPI acts as the backend API layer between the trained machine learning model and the web dashboard.

The application loads the trained Random Forest model and supporting feature information, accepts user inputs, processes the input features, generates a waiting-time prediction, and returns the result to the dashboard.

The frontend is implemented using:

- HTML
- CSS
- JavaScript
- Chart.js

The backend uses:

- FastAPI
- Uvicorn
- Joblib
- Pandas
- NumPy
- Scikit-learn
- XGBoost

---

# 🏗️ System Workflow

```text
Healthcare Queue Data
        │
        ▼
Data Preprocessing
        │
        ▼
Exploratory Data Analysis
        │
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
Descriptive      Statistical     Correlation
Statistics       Testing         Analysis
        │              │
        └──────────────┴──────────────┐
                                      ▼
                              Machine Learning
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                 Wait Time Prediction       Feature Importance
                         │
                         ▼
                  Random Forest
                         │
                         ▼
                  FastAPI Backend
                         │
                         ▼
                Interactive Dashboard
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          Prediction    M/M/c     Insights
                        Queue
                         │
                         ▼
                  What-If Simulation
                         │
                         ▼
                Staffing Recommendations
                         │
                         ▼
                  HMIS Validation
```

---

# 🛠️ Technologies Used

## Programming

- Python

## Data Analysis

- Pandas
- NumPy
- SciPy

## Visualization

- Matplotlib
- Seaborn
- Chart.js

## Statistical Analysis

- Descriptive Statistics
- Pearson Correlation
- Welch's t-test
- One-Way ANOVA
- Tukey HSD
- Chi-Square Test
- Kruskal-Wallis H Test
- OLS Regression

## Machine Learning

- Scikit-learn
- Random Forest Regression
- XGBoost Regression

## Queue Optimization

- M/M/c Queueing Model
- Erlang-C Queue Metrics
- What-If Simulation

## Deployment

- FastAPI
- Uvicorn
- Joblib
- HTML
- CSS
- JavaScript

## Development Tools

- Jupyter Notebook
- Visual Studio Code
- Git
- GitHub

---

# 📁 Project Structure

```text
Healthcare-Queue-Optimization/
│
├── data/
│   ├── ER Wait Time Dataset.csv
│   └── hmis-ayush_-_outpatient_attendance-2018-19-mn-feb.csv
│
├── deployment/
│   ├── app.py
│   ├── feature_names.pkl
│   ├── features.json
│   ├── meta.json
│   ├── requirements.txt
│   ├── rf_wait_time_model.pkl
│   │
│   └── static/
│       ├── index.html
│       ├── script.js
│       └── style.css
│
├── notebooks/
│   └── Healthcare_Queue_Optimization_Code.ipynb
│
├── results/
│   └── project_summary.json
│
├── screenshots/
│   ├── wait-time-prediction.png
│   ├── mmc-queue-optimization.png
│   ├── what-if-scenarios.png
│   ├── queue-wait-vs-servers.png
│   └── insights-findings.png
│
└── .gitignore
```

---

# ▶️ How to Run the Project

Follow these steps to run the FastAPI-based healthcare queue optimization dashboard locally.

## 1. Clone the Repository

```bash
git clone https://github.com/kunarasagnya/Healthcare-Queue-Optimization.git
```

## 2. Move into the Project

```bash
cd Healthcare-Queue-Optimization
```

## 3. Move into the Deployment Folder

```bash
cd deployment
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Start the FastAPI Application

```bash
uvicorn app:app --reload
```

## 6. Open the Dashboard

Open the following address in your browser:

```text
http://127.0.0.1:8000
```

The application provides the interactive healthcare queue optimization dashboard with patient wait-time prediction, M/M/c queue analysis, what-if simulation, statistical insights, and recommendations.

---

# 📊 Main Results

The final deployed Random Forest model reports:

| Evaluation Metric | Value |
|---|---:|
| R² | 0.9196 |
| RMSE | 17.5126 minutes |
| MAE | 12.2964 minutes |

The statistical analysis found significant differences in waiting time between peak and non-peak periods and across urgency groups.

The queueing analysis demonstrated that increasing the number of servers can reduce expected queue waiting time.

The HMIS comparison provided an external validation of the simulated healthcare arrival rate.

Together, these findings demonstrate how statistical analysis, predictive modelling, and queueing theory can be combined to support healthcare queue management.

---

# ⭐ Significance of the Project

The main strength of this project is that it does not stop at predicting patient waiting time.

It connects several stages of healthcare decision-making:

**What is happening?**  
→ Descriptive statistics and EDA

**Why is it happening?**  
→ Statistical tests and regression analysis

**Can we predict it?**  
→ Machine learning

**How can we reduce it?**  
→ M/M/c queueing theory and what-if simulation

**Does the demand pattern look realistic?**  
→ HMIS external validation

**Can the analysis be used practically?**  
→ FastAPI-based interactive dashboard

This creates an end-to-end analytical framework for healthcare queue optimization.

---

# ⚠️ Limitations

The project has several limitations:

- The primary analysis is based on the available ER wait-time dataset.
- The simulated queue environment may not represent every operational condition of a real hospital.
- HMIS data is used for external validation of healthcare attendance patterns rather than direct patient-level validation of the waiting-time prediction model.
- M/M/c queueing theory assumes simplified arrival and service processes compared with the complexity of real hospital operations.
- Feature importance indicates model contribution and should not be interpreted as direct causal evidence.
- The current deployment is designed as a decision-support prototype rather than a replacement for clinical or administrative decision-making.
- Real-time hospital integration would require live data sources and additional infrastructure.

---

# 🔮 Future Scope

The system can be further extended by:

- Integrating real-time hospital data
- Providing real-time waiting-time prediction
- Extending the model to multiple hospital departments
- Integrating live staffing and resource information
- Incorporating real-time queue monitoring
- Developing more advanced queue optimization methods
- Adding cloud deployment
- Integrating hospital information systems
- Evaluating the model on larger real-world datasets

---

# 👩‍💻 Author

**Kuna Rasagnya**

M.Sc. Data Science  
Osmania University

---

## 📌 Project Type

**M.Sc. Data Science – Major Project**

**Domain:** Healthcare Analytics

**Focus Areas:** Statistical Analysis | Machine Learning | Queue Optimization | Healthcare Analytics | FastAPI Deployment
