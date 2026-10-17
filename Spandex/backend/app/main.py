import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import db
from app.models.schemas import (
    Merchant,
    MerchantCreate,
    KPIResponse,
    SalesAnalyticsResponse,
    DetectedIssue,
    Recommendation,
    PredictionResponse,
    CustomerSegmentationResponse,
    AssistantQueryRequest,
    AssistantQueryResponse
)
from app.analytics.engine import compute_kpis, compute_sales_analytics, detect_business_issues
from app.ml.customer_segmentation import perform_rfm_segmentation
from app.ml.sales_forecasting import generate_sales_predictions
from app.recommendations.engine import generate_hybrid_recommendations
from app.ai_assistant.gemini_assistant import query_gemini_assistant

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Paytm Merchant Growth AI - REST API backend with ML-driven insights, hybrid recommendations, and Gemini business partner."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows Vite dev and deployed Vercel frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Health check endpoint for Render/Vercel and monitoring."""
    return {
        "status": "ok",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_backend": "PostgreSQL" if db.using_postgres else "Resilient In-Memory Demo Store",
        "gemini_configured": bool(settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")),
        "demo_data_loaded": True
    }

@app.get("/api/merchants", response_model=List[Merchant])
def get_merchants():
    """Retrieves list of all merchants with their metadata."""
    merchants = db.get_all_merchants()
    return merchants

@app.post("/api/merchants", response_model=Merchant, status_code=201)
def register_merchant(body: MerchantCreate):
    """
    Registers a new merchant with necessary business profile details.
    Optionally seeds realistic initial transactions so the merchant can immediately
    explore analytics, ML predictions, and AI recommendations.
    """
    try:
        new_merchant = db.create_merchant(
            data=body.model_dump(),
            seed_sample_transactions=body.seed_sample_transactions
        )
        return new_merchant
    except Exception as e:
        logger.error(f"Error registering new merchant: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to register merchant: {str(e)}")

@app.get("/api/merchants/{merchant_id}", response_model=Merchant)
def get_merchant(merchant_id: str = Path(..., description="Unique Merchant ID")):
    """Retrieves specific merchant metadata."""
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant with ID '{merchant_id}' not found.")
    return merchant

@app.get("/api/merchants/{merchant_id}/overview", response_model=KPIResponse)
def get_merchant_overview(
    merchant_id: str,
    window_days: int = Query(30, description="Window size in days for KPI computation"),
    start_date: Optional[str] = Query(None, description="Optional start date filter YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Optional end date filter YYYY-MM-DD")
):
    """
    Computes core merchant KPIs (revenue, transactions, ATV, repeat rate, growth rate, peak days/hours).
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id, start_date=start_date, end_date=end_date)
    return compute_kpis(df, window_days=window_days)

@app.get("/api/merchants/{merchant_id}/sales-analytics", response_model=SalesAnalyticsResponse)
def get_sales_analytics(
    merchant_id: str,
    start_date: Optional[str] = Query(None, description="Optional start date filter YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Optional end date filter YYYY-MM-DD")
):
    """
    Returns granular sales analytics: daily trends, day-of-week comparison, hourly breakdown,
    and product/category performance.
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id, start_date=start_date, end_date=end_date)
    return compute_sales_analytics(df)

@app.get("/api/merchants/{merchant_id}/issues", response_model=List[DetectedIssue])
def get_detected_issues(
    merchant_id: str,
    window_days: int = Query(14, description="Comparison window in days for detecting trends")
):
    """
    Detects concrete business issues supported by actual calculations from transaction data:
    declining sales, retention drops, underperforming products, slump periods, basket size changes.
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id)
    return detect_business_issues(df, window_days=window_days)

@app.get("/api/merchants/{merchant_id}/recommendations", response_model=List[Recommendation])
def get_recommendations(merchant_id: str):
    """
    Executes the Hybrid Recommendation Engine combining:
    1. Customer behavior analysis (Scikit-Learn RFM segmentation)
    2. ML sales predictions (XGBoost)
    3. Business rules (targeting detected issues)
    Returns prioritized, ranked business recommendations.
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id)
    return generate_hybrid_recommendations(df, merchant_id, merchant)

@app.get("/api/merchants/{merchant_id}/predictions", response_model=PredictionResponse)
def get_predictions(
    merchant_id: str,
    horizon_days: int = Query(14, ge=7, le=30, description="Future forecast horizon in days")
):
    """
    Generates sales forecasts using an XGBoost Regressor trained on historical merchant sales trends.
    Clearly distinguishes historical results from predictions.
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id)
    return generate_sales_predictions(df, merchant_id, horizon_days=horizon_days)

@app.get("/api/merchants/{merchant_id}/customer-segments", response_model=CustomerSegmentationResponse)
def get_customer_segments(merchant_id: str):
    """
    Performs RFM segmentation using Scikit-Learn KMeans clustering on merchant patrons.
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id)
    return perform_rfm_segmentation(df, merchant_id)

@app.post("/api/merchants/{merchant_id}/assistant/query", response_model=AssistantQueryResponse)
def query_assistant(
    merchant_id: str,
    body: AssistantQueryRequest
):
    """
    Conversational AI Business Assistant powered by the Gemini API.
    Injects verified merchant analytics, recommendations, and predictions as ground-truth context.
    """
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")

    df = db.get_merchant_transactions_df(merchant_id)
    kpis = compute_kpis(df, window_days=30).model_dump()
    issues = [i.model_dump() for i in detect_business_issues(df, window_days=14)]
    recs = [r.model_dump() for r in generate_hybrid_recommendations(df, merchant_id, merchant)]
    segments = perform_rfm_segmentation(df, merchant_id).model_dump()["segments"]
    forecast = generate_sales_predictions(df, merchant_id, horizon_days=14).model_dump()

    return query_gemini_assistant(
        query=body.query,
        merchant_data=merchant,
        kpi_data=kpis,
        issues_data=issues,
        recommendations_data=recs,
        segments_data=segments,
        forecast_data=forecast,
        history=body.conversation_history
    )

@app.post("/api/merchants/{merchant_id}/recommendations/{rec_id}/simulate-action")
def simulate_recommendation_action(merchant_id: str, rec_id: str, action: str = "apply"):
    """Logs or simulates merchant applying a recommended action."""
    merchant = db.get_merchant_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail=f"Merchant '{merchant_id}' not found.")
        
    result = db.log_recommendation_action(merchant_id, rec_id, action)
    return {
        "status": "success",
        "message": f"Action for recommendation '{rec_id}' recorded successfully.",
        "log_entry": result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
