import os
import logging
from typing import Dict, Any, List, Optional
from app.config import settings
from app.models.schemas import AssistantQueryResponse

logger = logging.getLogger(__name__)

GEMINI_CLIENT_AVAILABLE = False
try:
    from google import genai
    from google.genai import types
    GEMINI_CLIENT_AVAILABLE = True
except ImportError:
    logger.warning("google-genai library not found. Running in offline analytical assistant mode.")

def format_merchant_context(
    merchant: Dict[str, Any],
    kpis: Dict[str, Any],
    issues: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]],
    segments: List[Dict[str, Any]],
    forecast: Dict[str, Any]
) -> str:
    """
    Constructs grounded, highly structured factual context from actual analytics.
    """
    context_lines = [
        f"--- MERCHANT IDENTITY ---",
        f"Name: {merchant.get('name')}",
        f"Category: {merchant.get('category')}",
        f"Location: {merchant.get('city')}",
        f"UPI VPA: {merchant.get('upi_vpa')}",
        f"Data Classification: Demo Transaction Dataset (Simulated authentic data)",
        "",
        f"--- KEY PERFORMANCE INDICATORS (Trailing 30 Days) ---",
        f"Total Revenue: ₹{kpis.get('total_revenue', 0):,.2f}",
        f"Total Transactions: {kpis.get('total_transactions', 0)}",
        f"Average Transaction Value (ATV): ₹{kpis.get('average_transaction_value', 0):,.2f}",
        f"Repeat Customer Rate: {kpis.get('repeat_customer_percentage', 0)}%",
        f"Sales Growth vs Prior 30 Days: {kpis.get('sales_growth_rate', 0)}%",
        f"Peak Day of Week: {kpis.get('peak_sales_day')}",
        f"Peak Trading Hour: {kpis.get('peak_sales_hour')}:00 IST",
        "",
        f"--- AI-DETECTED BUSINESS ISSUES (Backed by data calculations) ---"
    ]

    if issues:
        for idx, issue in enumerate(issues, start=1):
            context_lines.append(
                f"{idx}. [{issue.get('severity')}] {issue.get('title')}: {issue.get('description')} "
                f"(Evidence: {issue.get('supporting_evidence')})"
            )
    else:
        context_lines.append("No critical issues detected. Business is operating within baseline parameters.")

    context_lines.append("")
    context_lines.append("--- RANKED HYBRID RECOMMENDATIONS ---")
    if recommendations:
        for rec in recommendations:
            context_lines.append(
                f"Rank #{rec.get('priority_rank')} [{rec.get('priority_level')} | Category: {rec.get('category')}]:\n"
                f"  - Action: {rec.get('recommended_action')}\n"
                f"  - Trigger Problem: {rec.get('problem_detected')}\n"
                f"  - Target Audience: {rec.get('target_customer_segment')}\n"
                f"  - Timing: {rec.get('suggested_timing')}\n"
                f"  - Impact Estimate: {rec.get('estimated_business_impact')}\n"
                f"  - Confidence: {rec.get('confidence_score') * 100:.0f}%\n"
            )
    else:
        context_lines.append("No active recommendations at this time.")

    context_lines.append("")
    context_lines.append("--- CUSTOMER SEGMENTATION (Scikit-Learn RFM) ---")
    for s in segments:
        context_lines.append(
            f"- {s.get('segment_name')}: {s.get('customer_count')} customers ({s.get('percentage_of_customers')}%), "
            f"Avg Recency: {s.get('avg_recency_days')} days, Avg Freq: {s.get('avg_frequency')}, Avg Spend: ₹{s.get('avg_monetary', 0):,.2f}"
        )

    context_lines.append("")
    context_lines.append("--- ML SALES FORECAST (XGBoost) ---")
    metrics = forecast.get('evaluation_metrics', {})
    context_lines.append(
        f"Model: {forecast.get('model_name', 'XGBoost')} | Test MAPE: {metrics.get('mape', 0)}% | Test RMSE: ₹{metrics.get('rmse', 0):,.2f}"
    )
    points = forecast.get('points', [])
    pred_pts = [p for p in points if p.get('predicted_revenue') is not None]
    if pred_pts:
        next_week = pred_pts[:7]
        avg_next_7d = sum(p['predicted_revenue'] for p in next_week) / len(next_week)
        context_lines.append(f"Forecasted Avg Daily Revenue for Next 7 Days: ₹{avg_next_7d:,.2f}")

    return "\n".join(context_lines)

SYSTEM_PROMPT = """You are the 'Paytm Merchant Growth AI Business Partner', an intelligent, pragmatic advisory assistant built for Indian merchants.
Your role is to help shopkeepers, cafe owners, and retailers understand their transaction analytics, diagnose revenue roadblocks, and take high-impact actions using Paytm tools (Paytm Soundbox, Dynamic QR, Paytm Cashback, Loyalty Stamp Cards).

CORE RULES & GUARDRAILS:
1. Base all answers strictly on the verified data in the merchant context provided below.
2. Never fabricate transaction figures, revenue amounts, or customer counts.
3. Clearly distinguish historical facts (what has happened) from machine learning predictions (what XGBoost models project will happen).
4. Never promise guaranteed revenue growth or give false certainty; frame potential outcomes as estimated model ranges.
5. Do not claim to have physically executed promotions or automated bank transfers—advise the merchant how they can implement the recommendation.
6. Speak in a respectful, practical, and motivating tone appropriate for an Indian merchant business partner. If relevant, mention Paytm products like Soundbox, UPI QR, or merchant app offers.
"""

def query_gemini_assistant(
    query: str,
    merchant_data: Dict[str, Any],
    kpi_data: Dict[str, Any],
    issues_data: List[Dict[str, Any]],
    recommendations_data: List[Dict[str, Any]],
    segments_data: List[Dict[str, Any]],
    forecast_data: Dict[str, Any],
    history: Optional[List[Dict[str, str]]] = None
) -> AssistantQueryResponse:
    """
    Queries Gemini API with the comprehensive context of the active merchant.
    Falls back gracefully if the API key is not configured or in case of network issues.
    """
    context_block = format_merchant_context(
        merchant_data,
        kpi_data,
        issues_data,
        recommendations_data,
        segments_data,
        forecast_data
    )

    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    # If Gemini API key is configured and client is available, call Gemini
    if api_key and GEMINI_CLIENT_AVAILABLE:
        try:
            client = genai.Client(api_key=api_key)
            prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"### CURRENT MERCHANT DATA CONTEXT ###\n{context_block}\n\n"
                f"### MERCHANT'S QUESTION ###\n{query}\n\n"
                f"Please provide an actionable, grounded response."
            )
            
            # Using standard gemini-2.5-flash or gemini-2.0-flash
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            
            response_text = response.text if hasattr(response, "text") and response.text else "I have analyzed your merchant data, but could not retrieve a detailed response."
            
            return AssistantQueryResponse(
                response=response_text,
                referenced_metrics=["total_revenue", "repeat_customer_rate", "atv", "xgboost_forecast"],
                suggested_followups=[
                    "How can I boost footfall during the 2 PM - 5 PM slump?",
                    "What specific discount should I set for at-risk customers?",
                    "Can you explain the XGBoost forecast for next week?"
                ],
                model_used=settings.GEMINI_MODEL
            )
        except Exception as e:
            logger.error(f"Error querying Gemini API: {e}")
            # Fall through to analytical response below

    # Grounded rule-based analytical assistant fallback
    # Fully dynamic based on current merchant data
    merchant_name = merchant_data.get("name", "Merchant")
    revenue = kpi_data.get("total_revenue", 0)
    repeat_rate = kpi_data.get("repeat_customer_percentage", 0)
    atv = kpi_data.get("average_transaction_value", 0)
    growth = kpi_data.get("sales_growth_rate", 0)
    top_issue = issues_data[0] if issues_data else None
    top_rec = recommendations_data[0] if recommendations_data else None

    # Construct intelligent fallback response referencing real calculations
    query_lower = query.lower()
    
    if "why" in query_lower and "recommend" in query_lower and top_rec:
        body = (
            f"**Recommendation Explanation for {merchant_name}:**\n\n"
            f"The recommendation **'{top_rec.get('recommended_action')}'** was triggered because:\n\n"
            f"1. **Underlying Problem:** {top_rec.get('problem_detected')}\n"
            f"2. **Calculated Evidence:** {top_rec.get('supporting_data')}\n"
            f"3. **Audience Focus:** Geared towards *{top_rec.get('target_customer_segment')}* to maximize return on promotional spend.\n"
            f"4. **Estimated Impact:** {top_rec.get('estimated_business_impact')} with a statistical confidence score of {top_rec.get('confidence_score')*100:.0f}%.\n\n"
            f"*Note: Add your GEMINI_API_KEY in the environment settings to unlock full interactive conversational reasoning.*"
        )
    elif "trend" in query_lower or "performance" in query_lower or "summary" in query_lower:
        growth_indicator = "grown" if growth >= 0 else "declined"
        body = (
            f"**Performance Summary for {merchant_name}:**\n\n"
            f"- **Net Revenue:** ₹{revenue:,.2f} over the last 30 days ({growth_indicator} by {abs(growth):.1f}% vs previous cycle).\n"
            f"- **Transaction Volume:** {kpi_data.get('total_transactions', 0)} total payments recorded.\n"
            f"- **Average Ticket Size:** ₹{atv:,.2f} per transaction.\n"
            f"- **Customer Loyalty:** {repeat_rate:.1f}% repeat customer rate.\n"
            f"- **Peak Trading Window:** {kpi_data.get('peak_sales_day')} at {kpi_data.get('peak_sales_hour')}:00 IST.\n\n"
            + (f"**Top Action Required:** {top_rec.get('recommended_action')}" if top_rec else "Everything is operating steadily.")
            + "\n\n*(Connect your GEMINI_API_KEY to ask custom freeform questions!)*"
        )
    else:
        body = (
            f"Hello! I am your **Paytm Merchant Growth AI Partner** analyzing **{merchant_name}**.\n\n"
            f"Based on your real store data:\n"
            f"- **Recent Sales:** ₹{revenue:,.2f} with an Average Transaction Value of ₹{atv:,.2f}.\n"
            f"- **Key Opportunity:** {top_issue.get('title') if top_issue else 'Growth Optimization'}.\n"
            f"- **Top Recommendation:** {top_rec.get('recommended_action') if top_rec else 'Continue regular store monitoring'}.\n"
            f"- **Target Customer Group:** {top_rec.get('target_customer_segment') if top_rec else 'All Customers'}.\n\n"
            f"💡 **Tip:** To enable full generative conversational capabilities with live LLM multi-turn dialogue, ensure `GEMINI_API_KEY` is configured in your backend environment variables."
        )

    return AssistantQueryResponse(
        response=body,
        referenced_metrics=["total_revenue", "repeat_customer_rate", "atv", "top_recommendation"],
        suggested_followups=[
            "Explain the top recommendation in detail",
            "Summarize my recent sales performance",
            "How can I improve my repeat customer rate?"
        ],
        model_used="Analytical Rule Engine (Set GEMINI_API_KEY for Gemini LLM)"
    )
