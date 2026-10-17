import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from app.models.schemas import CustomerSegment, CustomerSegmentationResponse

# In-memory cache for trained segmentation models and results
_SEGMENTATION_CACHE: Dict[str, Dict[str, Any]] = {}

def perform_rfm_segmentation(df: pd.DataFrame, merchant_id: str, n_clusters: int = 4) -> CustomerSegmentationResponse:
    """
    Performs RFM (Recency, Frequency, Monetary) customer segmentation using Scikit-learn KMeans.
    Caches model and results to avoid redundant calculations.
    """
    if df.empty or len(df) < 15:
        return CustomerSegmentationResponse(
            segments=[],
            total_customers_analyzed=0,
            clustering_algorithm="Scikit-Learn KMeans (RFM)"
        )

    # Check cache
    cache_key = f"{merchant_id}_{len(df)}_{df['timestamp'].max()}"
    if cache_key in _SEGMENTATION_CACHE:
        return _SEGMENTATION_CACHE[cache_key]

    max_date = df["timestamp"].max()
    
    # Compute RFM per customer
    rfm = df.groupby("customer_id").agg(
        recency=("timestamp", lambda x: (max_date - x.max()).days),
        frequency=("id", "count"),
        monetary=("amount", "sum")
    ).reset_index()

    # Preprocessing
    rfm_features = rfm[["recency", "frequency", "monetary"]].copy()
    
    # Handle log scaling to smooth skewness
    rfm_log = np.log1p(rfm_features)
    
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm_log)

    # Scikit-learn KMeans Clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    rfm["cluster"] = kmeans.fit_predict(rfm_scaled)

    # Map clusters to intuitive business personas based on cluster centroids
    cluster_profiles = []
    for c in range(n_clusters):
        c_subset = rfm[rfm["cluster"] == c]
        cluster_profiles.append({
            "cluster_id": c,
            "count": len(c_subset),
            "avg_recency": c_subset["recency"].mean(),
            "avg_frequency": c_subset["frequency"].mean(),
            "avg_monetary": c_subset["monetary"].mean()
        })

    # Sort and label clusters logically
    # 1. High frequency & high monetary & low recency -> Champions / Loyalists
    # 2. High past spend / frequency, but high recency (haven't visited lately) -> At-Risk / Lapsing
    # 3. Low recency, moderate frequency/monetary -> Potential Loyalists / Growing
    # 4. Low frequency (1 visit), high recency, low monetary -> One-Time / Low Value
    sorted_by_monetary = sorted(cluster_profiles, key=lambda x: x["avg_monetary"], reverse=True)
    
    label_map = {}
    used_labels = set()
    
    # Highest monetary with low/moderate recency is Champions
    champ_candidate = sorted_by_monetary[0]
    label_map[champ_candidate["cluster_id"]] = "Champions & Loyalists"
    used_labels.add("Champions & Loyalists")
    
    # Look for cluster with higher recency among top spenders -> At-Risk
    remaining = [c for c in cluster_profiles if c["cluster_id"] not in label_map]
    remaining_sorted_recency = sorted(remaining, key=lambda x: x["avg_recency"], reverse=True)
    if remaining_sorted_recency:
        at_risk_candidate = remaining_sorted_recency[0]
        label_map[at_risk_candidate["cluster_id"]] = "At-Risk & Lapsing Customers"
        used_labels.add("At-Risk & Lapsing Customers")
        
    remaining = [c for c in cluster_profiles if c["cluster_id"] not in label_map]
    if len(remaining) >= 2:
        rem_by_freq = sorted(remaining, key=lambda x: x["avg_frequency"], reverse=True)
        label_map[rem_by_freq[0]["cluster_id"]] = "Potential Loyalists & Regulars"
        label_map[rem_by_freq[1]["cluster_id"]] = "One-Time & Occasional Visitors"
    elif len(remaining) == 1:
        label_map[remaining[0]["cluster_id"]] = "Occasional Buyers"

    rfm["segment_name"] = rfm["cluster"].map(label_map)

    total_customers = len(rfm)
    segments_result: List[CustomerSegment] = []

    for c_id, s_name in label_map.items():
        sub = rfm[rfm["cluster"] == c_id]
        c_count = len(sub)
        pct = round((c_count / total_customers) * 100, 1)
        
        # Sample points for 2D/3D visualization
        sample_pts = sub.head(40)[["customer_id", "recency", "frequency", "monetary", "segment_name"]].to_dict(orient="records")
        for p in sample_pts:
            p["recency"] = int(p["recency"])
            p["frequency"] = int(p["frequency"])
            p["monetary"] = round(float(p["monetary"]), 2)

        segments_result.append(CustomerSegment(
            segment_id=c_id,
            segment_name=s_name,
            customer_count=c_count,
            percentage_of_customers=pct,
            avg_recency_days=round(float(sub["recency"].mean()), 1),
            avg_frequency=round(float(sub["frequency"].mean()), 1),
            avg_monetary=round(float(sub["monetary"].mean()), 2),
            sample_points=sample_pts
        ))

    # Sort segments by monetary value
    segments_result.sort(key=lambda s: s.avg_monetary, reverse=True)

    response = CustomerSegmentationResponse(
        segments=segments_result,
        total_customers_analyzed=total_customers,
        clustering_algorithm="Scikit-Learn KMeans (RFM)"
    )

    # Save in cache
    _SEGMENTATION_CACHE[cache_key] = response
    return response
