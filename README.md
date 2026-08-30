# Employee Attrition Prediction

Machine Learning Mini Project

## Project Description

This project predicts whether an employee is likely to leave an organization.

The system contains:

- Machine Learning model
- Flask backend
- HTML frontend
- CSS styling
- JavaScript
- Chart.js
- Dataset information
- Model performance dashboard
- Prediction interface

---

# Folder Structure

employee_attrition/

│

├── app.py

├── requirements.txt

├── README.md

│

├── model/

│   └── employee_attrition_model.pkl

│

├── data/

│   └── employee_attrition.csv

│

└── frontend/

    ├── index.html

    ├── style.css

    └── script.js


---

# Step 1 - Install Python

Install Python 3.10 or newer.

Check Python:

python --version


---

# Step 2 - Open Terminal

Open VS Code terminal inside the project folder.

Example:

cd Employee_attrition


---

# Step 3 - Create Virtual Environment

Windows:

python -m venv venv

Activate:

venv\Scripts\activate


Mac/Linux:

python3 -m venv venv

source venv/bin/activate


---

# Step 4 - Install Libraries

Run:

pip install -r requirements.txt


---

# Step 5 - Add Dataset

Put your dataset here:

data/employee_attrition.csv


---

# Step 6 - Add ML Model

Put your trained model here:

model/employee_attrition_model.pkl


---

# Step 7 - Match Model Features

Open:

app.py

Find:

FEATURE_SCHEMA


The feature names must match the columns used while training your model.

Example:

Age

MonthlyIncome

JobSatisfaction

YearsAtCompany

OverTime

JobLevel


If your model uses different columns, change FEATURE_SCHEMA.

---

# Step 8 - Run Project

Run:

python app.py


You should see:

EMPLOYEE ATTRITION PREDICTION

Server:
http://127.0.0.1:5000


---

# Step 9 - Open Browser

Open:

http://127.0.0.1:5000


---

# Important

The performance values inside app.py are example values.

Replace:

Accuracy

Precision

Recall

F1 Score

ROC/AUC

Confusion Matrix

Feature Importance

with values calculated from your actual trained model.


---

# Recommended Model Saving Method

If using scikit-learn, save the complete preprocessing pipeline together with the model.

Example:

import pickle

with open(
    "employee_attrition_model.pkl",
    "wb"
) as file:

    pickle.dump(
        trained_pipeline,
        file
    )


This allows Flask to perform preprocessing and prediction consistently.


---

# Production Checklist

Before deployment:

1. Turn off Flask debug mode.
2. Validate all user inputs.
3. Protect employee information.
4. Do not expose confidential employee data.
5. Use HTTPS.
6. Use authentication for private APIs.
7. Test the model with real test data.
8. Replace example performance values.
9. Match FEATURE_SCHEMA with model features.
10. Use a production WSGI server.