import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error
from app.models.schemas import PredictionPoint, PredictionResponse

# Model & forecast cache
_FORECAST_CACHE: Dict[str, Dict[str, Any]] = {}

def build_time_series_features(daily_df: pd.DataFrame) -> pd.DataFrame:
    """
    Constructs lag, rolling window, and temporal features for daily sales data.
    """
    df = daily_df.copy().sort_values("date").reset_index(drop=True)
    df["date_dt"] = pd.to_datetime(df["date"])
    
    # Calendar features
    df["day_of_week"] = df["date_dt"].dt.dayofweek
    df["day_of_month"] = df["date_dt"].dt.day
    df["is_weekend"] = df["day_of_week"].apply(lambda x: 1 if x in [5, 6] else 0)
    
    # Lag features
    df["lag_1"] = df["revenue"].shift(1)
    df["lag_2"] = df["revenue"].shift(2)
    df["lag_7"] = df["revenue"].shift(7)
    df["lag_14"] = df["revenue"].shift(14)
    
    # Rolling window stats
    df["rolling_mean_7"] = df["revenue"].shift(1).rolling(window=7, min_periods=1).mean()
    df["rolling_std_7"] = df["revenue"].shift(1).rolling(window=7, min_periods=1).std().fillna(0)
    df["rolling_mean_14"] = df["revenue"].shift(1).rolling(window=14, min_periods=1).mean()
    
    return df

def generate_sales_predictions(
    df: pd.DataFrame, 
    merchant_id: str, 
    horizon_days: int = 14
) -> PredictionResponse:
    """
    Trains an XGBoost Regressor on merchant transaction trends and forecasts the next 14 days.
    Caches model predictions by merchant ID and transaction dataset state.
    """
    if df.empty or len(df) < 30:
        return PredictionResponse(
            points=[],
            model_name="XGBoost Regressor",
            evaluation_metrics={"rmse": 0.0, "mae": 0.0, "mape": 0.0},
            top_predictive_features=[],
            horizon_days=horizon_days
        )

    cache_key = f"{merchant_id}_{len(df)}_{df['timestamp'].max()}_{horizon_days}"
    if cache_key in _FORECAST_CACHE:
        return _FORECAST_CACHE[cache_key]

    # Daily aggregation
    df_copy = df.copy()
    df_copy["date"] = df_copy["timestamp"].dt.strftime("%Y-%m-%d")
    daily_sales = df_copy.groupby("date")["amount"].sum().reset_index()
    daily_sales.rename(columns={"amount": "revenue"}, inplace=True)
    daily_sales = daily_sales.sort_values("date").reset_index(drop=True)

    # Feature engineering
    featured_df = build_time_series_features(daily_sales)
    clean_df = featured_df.dropna().reset_index(drop=True)

    feature_cols = [
        "day_of_week", "day_of_month", "is_weekend",
        "lag_1", "lag_2", "lag_7", "lag_14",
        "rolling_mean_7", "rolling_std_7", "rolling_mean_14"
    ]

    if len(clean_df) < 20:
        # Fallback if too few rows after lagging
        feature_cols = ["day_of_week", "day_of_month", "is_weekend"]
        clean_df = featured_df.copy()

    X = clean_df[feature_cols]
    y = clean_df["revenue"]

    # Honest train/test validation split (last 10% or minimum 7 days)
    test_size = max(7, min(14, int(len(clean_df) * 0.15)))
    X_train, X_test = X.iloc[:-test_size], X.iloc[-test_size:]
    y_train, y_test = y.iloc[:-test_size], y.iloc[-test_size:]

    # XGBoost Regressor model configuration
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        objective="reg:squarederror"
    )

    model.fit(X_train, y_train)

    # Validation evaluation
    y_pred_test = model.predict(X_test)
    y_pred_test = np.clip(y_pred_test, a_min=0, a_max=None)
    
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))
    mae = float(mean_absolute_error(y_test, y_pred_test))
    
    # MAPE calculation handling zeros
    non_zero = y_test > 0
    if non_zero.sum() > 0:
        mape = float(np.mean(np.abs((y_test[non_zero] - y_pred_test[non_zero]) / y_test[non_zero])) * 100)
    else:
        mape = 0.0

    # Fit on all available data for final future forecasting
    model.fit(X, y)

    # Feature importances
    importances = model.feature_importances_
    feat_imp = [
        {"feature": col, "importance": round(float(imp), 4)}
        for col, imp in zip(feature_cols, importances)
    ]
    feat_imp.sort(key=lambda x: x["importance"], reverse=True)

    # Autoregressive future forecasting for horizon_days
    future_points: List[PredictionPoint] = []
    
    # First, append historical points (last 30 days for visual context)
    recent_history = daily_sales.tail(30).copy()
    for _, row in recent_history.iterrows():
        future_points.append(PredictionPoint(
            date=row["date"],
            historical_revenue=round(float(row["revenue"]), 2),
            predicted_revenue=None,
            lower_bound=None,
            upper_bound=None
        ))

    # Forecast loop
    last_known_date = pd.to_datetime(daily_sales["date"].iloc[-1])
    current_series = list(daily_sales["revenue"].values)
    residual_std = max(float(np.std(y.values - model.predict(X))), mae * 0.8)

    for step in range(1, horizon_days + 1):
        future_date = last_known_date + timedelta(days=step)
        f_dow = future_date.dayofweek
        f_dom = future_date.day
        f_is_weekend = 1 if f_dow in [5, 6] else 0

        # Construct feature vector for future step
        lag_1 = current_series[-1]
        lag_2 = current_series[-2] if len(current_series) >= 2 else lag_1
        lag_7 = current_series[-7] if len(current_series) >= 7 else lag_1
        lag_14 = current_series[-14] if len(current_series) >= 14 else lag_7
        
        roll_7 = float(np.mean(current_series[-7:]))
        roll_std_7 = float(np.std(current_series[-7:]))
        roll_14 = float(np.mean(current_series[-14:])) if len(current_series) >= 14 else roll_7

        feat_dict = {
            "day_of_week": f_dow,
            "day_of_month": f_dom,
            "is_weekend": f_is_weekend,
            "lag_1": lag_1,
            "lag_2": lag_2,
            "lag_7": lag_7,
            "lag_14": lag_14,
            "rolling_mean_7": roll_7,
            "rolling_std_7": roll_std_7,
            "rolling_mean_14": roll_14
        }

        X_future = pd.DataFrame([[feat_dict[c] for c in feature_cols]], columns=feature_cols)
        pred_val = float(model.predict(X_future)[0])
        pred_val = max(pred_val, 100.0) # non-negative bounded sales
        
        # 80% prediction interval
        ci_margin = 1.28 * residual_std * (1.0 + (step * 0.03)) # uncertainty grows slightly with horizon
        lower_b = max(round(pred_val - ci_margin, 2), 0.0)
        upper_b = round(pred_val + ci_margin, 2)

        future_points.append(PredictionPoint(
            date=future_date.strftime("%Y-%m-%d"),
            historical_revenue=None,
            predicted_revenue=round(pred_val, 2),
            lower_bound=lower_b,
            upper_bound=upper_b
        ))

        current_series.append(pred_val)

    response = PredictionResponse(
        points=future_points,
        model_name="XGBoost Regressor",
        evaluation_metrics={
            "rmse": round(rmse, 2),
            "mae": round(mae, 2),
            "mape": round(mape, 2)
        },
        top_predictive_features=feat_imp[:5],
        horizon_days=horizon_days
    )

    _FORECAST_CACHE[cache_key] = response
    return response
