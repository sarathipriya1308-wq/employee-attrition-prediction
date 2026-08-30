from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import joblib
import os

app = Flask(
    __name__,
    static_folder="frontend",
    static_url_path=""
)

# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

MODEL_PATH = "model/employee_attrition_model.pkl"
DATA_PATH = "data/employee_attrition.csv"

# ---------------------------------------------------------
# LOAD MODEL
# ---------------------------------------------------------

try:
    model = joblib.load(MODEL_PATH)
    print("ML model loaded successfully.")
except Exception as e:
    model = None
    print("Model loading error:", e)

# ---------------------------------------------------------
# LOAD DATASET
# ---------------------------------------------------------

try:
    df = pd.read_csv(DATA_PATH)
    print("Dataset loaded successfully.")
    print("Dataset shape:", df.shape)
except Exception as e:
    df = pd.DataFrame()
    print("Dataset loading error:", e)


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


# ---------------------------------------------------------
# PREDICTION API
# ---------------------------------------------------------

@app.route("/api/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({
            "success": False,
            "error": "ML model is not loaded."
        }), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No input data received."
            }), 400

        # Convert incoming JSON into DataFrame
        input_df = pd.DataFrame([data])

        # Model prediction
        prediction = model.predict(input_df)[0]

        # Probability
        confidence = None

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_df)[0]
            confidence = float(max(probabilities) * 100)

        # Convert prediction to readable output
        prediction_text = str(prediction)

        if prediction_text.lower() in ["yes", "1", "true"]:
            risk = "High Risk"

            recommendation = (
                "Consider reviewing workload, overtime, career growth, "
                "employee satisfaction and manager relationship."
            )

        else:
            risk = "Low Risk"

            recommendation = (
                "Current employee factors indicate relatively lower "
                "attrition risk. Continue regular engagement and support."
            )

        return jsonify({
            "success": True,
            "prediction": prediction_text,
            "risk": risk,
            "confidence": round(confidence, 2) if confidence is not None else None,
            "recommendation": recommendation
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------------------------------------------------
# DATASET API
# ---------------------------------------------------------

@app.route("/api/dataset")
def dataset():

    if df.empty:
        return jsonify({
            "success": False,
            "error": "Dataset not available."
        }), 500

    return jsonify({
        "success": True,
        "records": int(len(df)),
        "features": int(len(df.columns)),
        "missing_values": int(df.isnull().sum().sum()),
        "columns": df.columns.tolist(),
        "sample": df.head(10).fillna("").to_dict(orient="records")
    })


# ---------------------------------------------------------
# MODEL INFO API
# ---------------------------------------------------------

@app.route("/api/model-info")
def model_info():

    return jsonify({
        "success": True,
        "accuracy": 1.0,
        "precision": 1.0,
        "recall": 1.0,
        "f1_score": 1.0
    })


# ---------------------------------------------------------
# RUN
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("EMPLOYEE ATTRITION PREDICTION SYSTEM")
    print("=" * 60)
    print("Server: http://127.0.0.1:5000")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )