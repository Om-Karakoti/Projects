import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from app.models.schemas import KPIResponse, SalesAnalyticsResponse, SalesTrendItem, DetectedIssue

def compute_kpis(df: pd.DataFrame, window_days: int = 30) -> KPIResponse:
    """
    Computes key performance indicators for a merchant over the active window
    compared to the previous window of identical duration.
    """
    if df.empty:
        return KPIResponse(
            total_revenue=0.0,
            total_transactions=0,
            average_transaction_value=0.0,
            repeat_customer_percentage=0.0,
            sales_growth_rate=0.0,
            revenue_change_amount=0.0,
            transactions_change_count=0,
            best_performing_products=[],
            best_performing_categories=[],
            peak_sales_day="N/A",
            peak_sales_hour=12,
            date_range={"start_date": "", "end_date": ""}
        )

    max_date = df["timestamp"].max()
    current_start = max_date - timedelta(days=window_days)
    previous_start = current_start - timedelta(days=window_days)

    curr_df = df[df["timestamp"] >= current_start]
    prev_df = df[(df["timestamp"] >= previous_start) & (df["timestamp"] < current_start)]

    # Current window metrics
    curr_revenue = float(curr_df["amount"].sum())
    curr_tx_count = int(len(curr_df))
    curr_atv = float(curr_revenue / curr_tx_count) if curr_tx_count > 0 else 0.0

    # Repeat customer rate
    if not curr_df.empty:
        cust_counts = curr_df["customer_id"].value_counts()
        repeat_customers = (cust_counts > 1).sum()
        total_unique_cust = len(cust_counts)
        repeat_pct = round(float((repeat_customers / total_unique_cust) * 100), 1) if total_unique_cust > 0 else 0.0
    else:
        repeat_pct = 0.0

    # Previous window metrics
    prev_revenue = float(prev_df["amount"].sum()) if not prev_df.empty else 0.0
    prev_tx_count = int(len(prev_df))

    # Growth calculations
    if prev_revenue > 0:
        growth_rate = round(float(((curr_revenue - prev_revenue) / prev_revenue) * 100), 2)
    else:
        growth_rate = 0.0

    revenue_change = round(curr_revenue - prev_revenue, 2)
    tx_change = curr_tx_count - prev_tx_count

    # Best-performing products
    top_products = []
    if not curr_df.empty and "product_name" in curr_df.columns:
        prod_grp = curr_df.groupby("product_name").agg(
            revenue=("amount", "sum"),
            units=("quantity", "sum")
        ).reset_index().sort_values(by="revenue", ascending=False).head(5)
        top_products = prod_grp.to_dict(orient="records")
        for p in top_products:
            p["revenue"] = round(float(p["revenue"]), 2)
            p["units"] = int(p["units"])

    # Best-performing categories
    top_categories = []
    if not curr_df.empty and "category" in curr_df.columns:
        cat_grp = curr_df.groupby("category").agg(
            revenue=("amount", "sum"),
            units=("quantity", "sum")
        ).reset_index().sort_values(by="revenue", ascending=False).head(5)
        top_categories = cat_grp.to_dict(orient="records")
        for c in top_categories:
            c["revenue"] = round(float(c["revenue"]), 2)
            c["units"] = int(c["units"])

    # Peak sales day
    peak_day = "N/A"
    if not curr_df.empty:
        curr_df_copy = curr_df.copy()
        curr_df_copy["day_name"] = curr_df_copy["timestamp"].dt.day_name()
        day_rev = curr_df_copy.groupby("day_name")["amount"].sum()
        if not day_rev.empty:
            peak_day = str(day_rev.idxmax())

    # Peak sales hour
    peak_hour = 18
    if not curr_df.empty:
        curr_df_copy = curr_df.copy()
        curr_df_copy["hour"] = curr_df_copy["timestamp"].dt.hour
        hour_rev = curr_df_copy.groupby("hour")["amount"].sum()
        if not hour_rev.empty:
            peak_hour = int(hour_rev.idxmax())

    return KPIResponse(
        total_revenue=round(curr_revenue, 2),
        total_transactions=curr_tx_count,
        average_transaction_value=round(curr_atv, 2),
        repeat_customer_percentage=repeat_pct,
        sales_growth_rate=growth_rate,
        revenue_change_amount=revenue_change,
        transactions_change_count=tx_change,
        best_performing_products=top_products,
        best_performing_categories=top_categories,
        peak_sales_day=peak_day,
        peak_sales_hour=peak_hour,
        date_range={
            "start_date": current_start.strftime("%Y-%m-%d"),
            "end_date": max_date.strftime("%Y-%m-%d")
        }
    )

def compute_sales_analytics(df: pd.DataFrame) -> SalesAnalyticsResponse:
    """
    Computes daily trends, day-of-week sales comparisons, hourly distributions,
    product performance, category shares, and payment mode splits.
    """
    if df.empty:
        return SalesAnalyticsResponse(
            daily_trends=[],
            day_of_week_comparison=[],
            hourly_distribution=[],
            product_performance=[],
            category_performance=[],
            payment_mode_breakdown=[]
        )

    df = df.copy()
    df["date"] = df["timestamp"].dt.strftime("%Y-%m-%d")
    df["day_name"] = df["timestamp"].dt.day_name()
    df["hour"] = df["timestamp"].dt.hour

    # Daily Trends
    daily_grp = df.groupby("date").agg(
        revenue=("amount", "sum"),
        transaction_count=("id", "count")
    ).reset_index()
    daily_grp["atv"] = daily_grp["revenue"] / daily_grp["transaction_count"]
    daily_trends = [
        SalesTrendItem(
            date=row["date"],
            revenue=round(float(row["revenue"]), 2),
            transaction_count=int(row["transaction_count"]),
            atv=round(float(row["atv"]), 2)
        )
        for _, row in daily_grp.iterrows()
    ]

    # Day of Week Comparison
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_grp = df.groupby("day_name").agg(
        revenue=("amount", "sum"),
        transaction_count=("id", "count")
    ).reindex(days_order).fillna(0).reset_index()
    dow_comparison = [
        {
            "day": row["day_name"],
            "revenue": round(float(row["revenue"]), 2),
            "avg_revenue": round(float(row["revenue"] / (len(daily_grp) / 7 if len(daily_grp) >= 7 else 1)), 2),
            "transaction_count": int(row["transaction_count"])
        }
        for _, row in dow_grp.iterrows()
    ]

    # Hourly Distribution
    all_hours = pd.DataFrame({"hour": range(24)})
    hourly_grp = df.groupby("hour").agg(
        revenue=("amount", "sum"),
        transaction_count=("id", "count")
    ).reset_index()
    hourly_merged = pd.merge(all_hours, hourly_grp, on="hour", how="left").fillna(0)
    hourly_distribution = [
        {
            "hour": int(row["hour"]),
            "hour_label": f"{int(row['hour']):02d}:00",
            "revenue": round(float(row["revenue"]), 2),
            "transaction_count": int(row["transaction_count"])
        }
        for _, row in hourly_merged.iterrows()
    ]

    # Product Performance
    prod_grp = df.groupby(["product_name", "category"]).agg(
        revenue=("amount", "sum"),
        units_sold=("quantity", "sum")
    ).reset_index().sort_values(by="revenue", ascending=False)
    prod_grp["avg_price"] = prod_grp["revenue"] / prod_grp["units_sold"]
    product_performance = [
        {
            "product_name": row["product_name"],
            "category": row["category"],
            "revenue": round(float(row["revenue"]), 2),
            "units_sold": int(row["units_sold"]),
            "avg_price": round(float(row["avg_price"]), 2)
        }
        for _, row in prod_grp.iterrows()
    ]

    # Category Performance
    cat_grp = df.groupby("category").agg(
        revenue=("amount", "sum"),
        units_sold=("quantity", "sum")
    ).reset_index().sort_values(by="revenue", ascending=False)
    total_rev = cat_grp["revenue"].sum()
    category_performance = [
        {
            "category": row["category"],
            "revenue": round(float(row["revenue"]), 2),
            "units_sold": int(row["units_sold"]),
            "share_percentage": round(float((row["revenue"] / total_rev) * 100), 1) if total_rev > 0 else 0.0
        }
        for _, row in cat_grp.iterrows()
    ]

    # Payment Mode Breakdown
    pay_grp = df.groupby("payment_mode").agg(
        revenue=("amount", "sum"),
        count=("id", "count")
    ).reset_index().sort_values(by="revenue", ascending=False)
    payment_mode_breakdown = [
        {
            "mode": row["payment_mode"],
            "revenue": round(float(row["revenue"]), 2),
            "count": int(row["count"]),
            "percentage": round(float((row["revenue"] / total_rev) * 100), 1) if total_rev > 0 else 0.0
        }
        for _, row in pay_grp.iterrows()
    ]

    return SalesAnalyticsResponse(
        daily_trends=daily_trends,
        day_of_week_comparison=dow_comparison,
        hourly_distribution=hourly_distribution,
        product_performance=product_performance,
        category_performance=category_performance,
        payment_mode_breakdown=payment_mode_breakdown
    )

def detect_business_issues(df: pd.DataFrame, window_days: int = 14) -> List[DetectedIssue]:
    """
    Identifies potential business problems backed by real calculated transaction data:
    1. Declining sales
    2. Decreasing repeat purchases
    3. Underperforming products
    4. Low-performing sales periods
    5. Changes in customer purchasing behavior (e.g. basket size shrinking)
    """
    if df.empty or len(df) < 20:
        return []

    issues: List[DetectedIssue] = []
    max_date = df["timestamp"].max()
    curr_start = max_date - timedelta(days=window_days)
    prev_start = curr_start - timedelta(days=window_days)

    curr_df = df[df["timestamp"] >= curr_start].copy()
    prev_df = df[(df["timestamp"] >= prev_start) & (df["timestamp"] < curr_start)].copy()

    if curr_df.empty or prev_df.empty:
        return issues

    # 1. Check for Declining Sales
    curr_revenue = curr_df["amount"].sum()
    prev_revenue = prev_df["amount"].sum()
    revenue_pct_change = ((curr_revenue - prev_revenue) / prev_revenue) * 100 if prev_revenue > 0 else 0.0

    if revenue_pct_change < -5.0:
        severity = "CRITICAL" if revenue_pct_change < -15.0 else "HIGH"
        issues.append(DetectedIssue(
            id="ISSUE_DECLINING_SALES",
            problem_type="DECLINING_SALES",
            title="Sustained Revenue Contraction",
            description=f"Net transaction revenue dropped by {abs(revenue_pct_change):.1f}% over the last {window_days} days compared to the prior window.",
            current_value=round(curr_revenue, 2),
            previous_value=round(prev_revenue, 2),
            percentage_change=round(revenue_pct_change, 1),
            severity=severity,
            supporting_evidence=f"Revenue fell from ₹{prev_revenue:,.2f} to ₹{curr_revenue:,.2f} across the last {window_days} days. Daily run-rate dropped by ₹{abs(curr_revenue - prev_revenue)/window_days:,.2f}/day.",
            metric_name="Total Revenue"
        ))

    # 2. Check for Decreasing Repeat Purchases
    curr_cust_counts = curr_df["customer_id"].value_counts()
    curr_repeat_pct = (curr_cust_counts > 1).sum() / len(curr_cust_counts) * 100 if len(curr_cust_counts) > 0 else 0

    prev_cust_counts = prev_df["customer_id"].value_counts()
    prev_repeat_pct = (prev_cust_counts > 1).sum() / len(prev_cust_counts) * 100 if len(prev_cust_counts) > 0 else 0

    repeat_change = curr_repeat_pct - prev_repeat_pct
    if repeat_change < -4.0:
        severity = "CRITICAL" if repeat_change < -10.0 else "HIGH"
        issues.append(DetectedIssue(
            id="ISSUE_REPEAT_RETENTION_DROP",
            problem_type="DECREASING_REPEAT_PURCHASES",
            title="Customer Retention & Repeat Visit Erosion",
            description=f"Repeat-customer conversion decreased by {abs(repeat_change):.1f} percentage points (from {prev_repeat_pct:.1f}% to {curr_repeat_pct:.1f}%).",
            current_value=round(curr_repeat_pct, 1),
            previous_value=round(prev_repeat_pct, 1),
            percentage_change=round(repeat_change, 1),
            severity=severity,
            supporting_evidence=f"Only {(curr_cust_counts > 1).sum()} of {len(curr_cust_counts)} recent buyers returned multiple times, down from {(prev_cust_counts > 1).sum()} of {len(prev_cust_counts)} in the previous cycle.",
            metric_name="Repeat Customer Rate (%)"
        ))

    # 3. Check for Underperforming Products
    prod_curr = curr_df.groupby("product_name").agg(revenue=("amount", "sum"), units=("quantity", "sum")).reset_index()
    prod_prev = prev_df.groupby("product_name").agg(revenue=("amount", "sum"), units=("quantity", "sum")).reset_index()
    merged_prods = pd.merge(prod_curr, prod_prev, on="product_name", suffixes=("_curr", "_prev"))
    merged_prods["growth"] = ((merged_prods["revenue_curr"] - merged_prods["revenue_prev"]) / merged_prods["revenue_prev"]) * 100

    underperforming = merged_prods[merged_prods["growth"] < -20.0].sort_values(by="revenue_prev", ascending=False)
    if not underperforming.empty:
        worst_prod = underperforming.iloc[0]
        worst_name = worst_prod["product_name"]
        worst_growth = worst_prod["growth"]
        issues.append(DetectedIssue(
            id="ISSUE_UNDERPERFORMING_PRODUCTS",
            problem_type="UNDERPERFORMING_PRODUCTS",
            title=f"Sharp Drop in Sales Velocity for '{worst_name}'",
            description=f"Sales for '{worst_name}' decreased by {abs(worst_growth):.1f}%, causing inventory turnaround lag.",
            current_value=round(float(worst_prod["revenue_curr"]), 2),
            previous_value=round(float(worst_prod["revenue_prev"]), 2),
            percentage_change=round(float(worst_growth), 1),
            severity="MEDIUM",
            supporting_evidence=f"Revenue for '{worst_name}' fell from ₹{worst_prod['revenue_prev']:,.2f} to ₹{worst_prod['revenue_curr']:,.2f} ({int(worst_prod['units_prev'])} units down to {int(worst_prod['units_curr'])} units).",
            metric_name="Product Revenue"
        ))

    # 4. Check for Low-Performing Sales Periods (Slump Hours / Days)
    curr_df["hour"] = curr_df["timestamp"].dt.hour
    curr_df["day_name"] = curr_df["timestamp"].dt.day_name()
    
    # Mid-week afternoon slump test (Tue/Wed between 14:00 and 17:00)
    slump_window = curr_df[(curr_df["hour"] >= 14) & (curr_df["hour"] <= 17) & (curr_df["day_name"].isin(["Tuesday", "Wednesday"]))]
    avg_hourly_rev = curr_df["amount"].sum() / (window_days * 14) # operational hours
    slump_hourly_rev = slump_window["amount"].sum() / max(len(slump_window["hour"].unique()) * (window_days // 7 * 2), 1)

    if slump_hourly_rev < avg_hourly_rev * 0.5:
        slump_pct_below = round(((avg_hourly_rev - slump_hourly_rev) / avg_hourly_rev) * 100, 1)
        issues.append(DetectedIssue(
            id="ISSUE_OFFPEAK_SLUMP",
            problem_type="LOW_PERFORMING_PERIODS",
            title="Mid-Week Afternoon Dead Zone (2 PM - 5 PM)",
            description=f"Tuesday and Wednesday afternoons generate {slump_pct_below}% less revenue per hour than standard trading hours.",
            current_value=round(slump_hourly_rev, 2),
            previous_value=round(avg_hourly_rev, 2),
            percentage_change=-slump_pct_below,
            severity="MEDIUM",
            supporting_evidence=f"Average revenue during 2 PM - 5 PM mid-week is only ₹{slump_hourly_rev:,.2f}/hr compared to the daily average of ₹{avg_hourly_rev:,.2f}/hr.",
            metric_name="Hourly Revenue (Slump Hours)"
        ))

    # 5. Check for Changes in Customer Purchasing Behavior (Average Basket Size / ATV)
    curr_atv = curr_revenue / len(curr_df) if len(curr_df) > 0 else 0
    prev_atv = prev_revenue / len(prev_df) if len(prev_df) > 0 else 0
    atv_change = ((curr_atv - prev_atv) / prev_atv) * 100 if prev_atv > 0 else 0

    if atv_change < -6.0:
        severity = "HIGH" if atv_change < -12.0 else "MEDIUM"
        issues.append(DetectedIssue(
            id="ISSUE_ATV_SHRINKAGE",
            problem_type="PURCHASING_BEHAVIOR_CHANGE",
            title="Average Ticket Value (ATV) Compression",
            description=f"Customers are spending {abs(atv_change):.1f}% less per transaction, reflecting smaller basket sizes or trading down.",
            current_value=round(curr_atv, 2),
            previous_value=round(prev_atv, 2),
            percentage_change=round(atv_change, 1),
            severity=severity,
            supporting_evidence=f"Average bill size shrank from ₹{prev_atv:,.2f} to ₹{curr_atv:,.2f} across the last {len(curr_df)} transactions.",
            metric_name="Average Transaction Value"
        ))

    return issues
