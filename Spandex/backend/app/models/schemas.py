from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Merchant(BaseModel):
    id: str
    name: str
    category: str
    city: str
    joined_date: str
    phone: str
    upi_vpa: str
    is_demo_data: bool = True

class MerchantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Store or business name")
    category: str = Field(..., min_length=2, max_length=100, description="Business vertical / category")
    city: str = Field(..., min_length=2, max_length=100, description="City and State")
    phone: str = Field(..., min_length=8, max_length=20, description="Contact mobile number")
    upi_vpa: Optional[str] = Field(None, description="Paytm UPI ID / VPA handle")
    seed_sample_transactions: bool = Field(True, description="Generate realistic initial transactions for analytics")

class KPIResponse(BaseModel):
    total_revenue: float
    total_transactions: int
    average_transaction_value: float
    repeat_customer_percentage: float
    sales_growth_rate: float
    revenue_change_amount: float
    transactions_change_count: int
    best_performing_products: List[Dict[str, Any]]
    best_performing_categories: List[Dict[str, Any]]
    peak_sales_day: str
    peak_sales_hour: int
    date_range: Dict[str, str]

class SalesTrendItem(BaseModel):
    date: str
    revenue: float
    transaction_count: int
    atv: float

class SalesAnalyticsResponse(BaseModel):
    daily_trends: List[SalesTrendItem]
    day_of_week_comparison: List[Dict[str, Any]]
    hourly_distribution: List[Dict[str, Any]]
    product_performance: List[Dict[str, Any]]
    category_performance: List[Dict[str, Any]]
    payment_mode_breakdown: List[Dict[str, Any]]

class DetectedIssue(BaseModel):
    id: str
    problem_type: str
    title: str
    description: str
    current_value: float
    previous_value: float
    percentage_change: float
    severity: str
    supporting_evidence: str
    metric_name: str

class Recommendation(BaseModel):
    id: str
    priority_rank: int
    priority_level: str
    recommended_action: str
    problem_detected: str
    supporting_data: str
    target_customer_segment: str
    suggested_timing: str
    estimated_business_impact: str
    confidence_score: float
    category: str
    status: str = "active"

class PredictionPoint(BaseModel):
    date: str
    historical_revenue: Optional[float] = None
    predicted_revenue: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class PredictionResponse(BaseModel):
    points: List[PredictionPoint]
    model_name: str = "XGBoost Regressor"
    evaluation_metrics: Dict[str, float]
    top_predictive_features: List[Dict[str, Any]]
    horizon_days: int

class CustomerSegment(BaseModel):
    segment_id: int
    segment_name: str
    customer_count: int
    percentage_of_customers: float
    avg_recency_days: float
    avg_frequency: float
    avg_monetary: float
    sample_points: List[Dict[str, Any]]

class CustomerSegmentationResponse(BaseModel):
    segments: List[CustomerSegment]
    total_customers_analyzed: int
    clustering_algorithm: str = "Scikit-Learn KMeans (RFM)"

class AssistantQueryRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class AssistantQueryResponse(BaseModel):
    response: str
    referenced_metrics: List[str] = []
    suggested_followups: List[str] = []
    model_used: str
