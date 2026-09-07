import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


# ============================================================
# 1. PATHS
# ============================================================

DATA_PATH = os.path.join("data", "employee_attrition.csv")
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "employee_attrition_model.pkl")


# ============================================================
# 2. LOAD DATASET
# ============================================================

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}"
    )

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("EMPLOYEE ATTRITION MODEL TRAINING")
print("=" * 60)

print(f"Dataset shape: {df.shape}")


# ============================================================
# 3. CHECK TARGET
# ============================================================

TARGET = "Attrition"

if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found in dataset."
    )


# ============================================================
# 4. REMOVE COLUMNS THAT SHOULD NOT BE USED
# ============================================================

# EmployeeNumber is only an identifier.
# EmployeeCount and StandardHours are constant in the common
# IBM HR dataset and are not useful for prediction.

DROP_COLUMNS = [
    "EmployeeNumber",
    "EmployeeCount",
    "StandardHours",
    "Over18"
]

existing_drop_columns = [
    col for col in DROP_COLUMNS
    if col in df.columns
]

X = df.drop(columns=[TARGET] + existing_drop_columns)
y = df[TARGET].map({
    "Yes": 1,
    "No": 0
})


# ============================================================
# 5. VALIDATE TARGET
# ============================================================

if y.isna().any():
    raise ValueError(
        "Attrition column must contain Yes/No values."
    )

print("\nTarget distribution:")
print(df[TARGET].value_counts())


# ============================================================
# 6. IDENTIFY NUMERIC AND CATEGORICAL FEATURES
# ============================================================

numeric_features = X.select_dtypes(
    include=["int64", "float64", "int32", "float32"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["object", "category", "bool"]
).columns.tolist()

print("\nNumeric features:")
print(numeric_features)

print("\nCategorical features:")
print(categorical_features)


# ============================================================
# 7. PREPROCESSING
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        )
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# ============================================================
# 8. MODEL
# ============================================================

classifier = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced",
    max_depth=8,
    min_samples_split=2
)


model = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "classifier",
            classifier
        )
    ]
)


# ============================================================
# 9. TRAIN / TEST SPLIT
# ============================================================

# With a very small dataset, stratification may fail if one class
# has only one sample. Therefore we handle it safely.

class_counts = y.value_counts()

if len(class_counts) >= 2 and class_counts.min() >= 2:
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y
    )
else:
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42
    )


# ============================================================
# 10. TRAIN
# ============================================================

print("\nTraining model...")

model.fit(X_train, y_train)

print("Training completed.")


# ============================================================
# 11. EVALUATION
# ============================================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)
recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)
f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

print("\nMODEL PERFORMANCE")
print("-" * 40)
print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")


# ============================================================
# 12. CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# 13. SAVE MODEL
# ============================================================

joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully!")
print(f"Model path: {MODEL_PATH}")


# ============================================================
# 14. VERIFY SAVED MODEL
# ============================================================

if os.path.exists(MODEL_PATH):

    file_size = os.path.getsize(MODEL_PATH)

    print(f"Model file size: {file_size} bytes")

    if file_size == 0:
        raise RuntimeError(
            "Model file was created but is empty."
        )

    print("Model verification: SUCCESS")

else:
    raise FileNotFoundError(
        "Model file was not created."
    )


print("=" * 60)
print("DONE")
print("=" * 60)