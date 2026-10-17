# Paytm Merchant Growth AI — Alternate Tech Stack

An intelligent AI business partner for merchants that analyzes transaction data, detects operational bottlenecks, predicts sales trends using Machine Learning, and delivers personalized, ranked actions to boost revenue, customer retention, and store performance.

This version features a decoupled modern architecture using **React.js** for the frontend and **FastAPI** for the backend, replacing legacy monolithic Streamlit interfaces.

---

## 1. Tech Stack Overview

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | High-performance interactive merchant interface |
| **UI Styling** | Tailwind CSS | Modern fintech visual design and responsive layouts |
| **Data Visualization** | Plotly | Interactive revenue charts, footfall heatmaps, and RFM scatters |
| **Backend & REST API** | Python 3.11+ / FastAPI | High-concurrency async endpoints with Pydantic schemas |
| **Data Processing** | Pandas + NumPy | Time-series aggregation, rolling metrics, and KPI computation |
| **Machine Learning** | Scikit-learn | RFM customer segmentation via KMeans clustering |
| **Prediction Models** | XGBoost | Multi-feature daily sales forecasting with prediction intervals |
| **Recommendation Engine**| Python Hybrid Engine | Multi-signal ranker combining behavior, ML, and business rules |
| **Database** | PostgreSQL | Relational transactional persistence (with demo seed resilience) |
| **Generative AI** | Google Gemini API | Grounded conversational business partner with context injection |
| **Deployment** | Vercel (UI) & Render (API/DB) | Production cloud deployment configuration |

---

## 2. Core Workflow

```
Analyze Transactions → Detect Roadblocks → Predict Sales Trends → Recommend Actions → Explain via Gemini → Help Merchant Act
```

1. **Analyze**: Ingests Paytm Soundbox, Dynamic QR, and Card payments; computes real-time KPIs (Revenue, Volume, Average Transaction Value, Repeat Rate).
2. **Detect**: Employs mathematical thresholds to detect sustained revenue contraction, repeat visit erosion, underperforming SKUs, and mid-week afternoon dead zones (2 PM - 5 PM).
3. **Predict**: Leverages an **XGBoost Regressor** with lag and rolling features to forecast 14-day future revenue trends with 80% prediction intervals.
4. **Recommend**: The **Hybrid Recommendation Engine** synthesizes customer segments (Scikit-Learn RFM), XGBoost projections, and business rules into ranked, prioritized action cards.
5. **Explain**: Injects merchant facts into the **Gemini API** so merchants can converse naturally, understand why an action was recommended, and clarify strategies.
6. **Act**: Provides interactive simulation triggers to track and enact promotions in-store.

---

## 3. Project Directory Structure

```
paytm-merchant-growth-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app, CORS, routes
│   │   ├── config.py                  # Environment settings & secrets
│   │   ├── database.py                # PostgreSQL connection & demo seed data
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic request & response schemas
│   │   ├── analytics/
│   │   │   └── engine.py              # KPI calculations & problem detection
│   │   ├── ml/
│   │   │   ├── customer_segmentation.py # Scikit-Learn KMeans RFM clustering
│   │   │   └── sales_forecasting.py     # XGBoost sales trend forecasting
│   │   ├── recommendations/
│   │   │   └── engine.py              # Hybrid ranking recommendation engine
│   │   └── ai_assistant/
│   │       └── gemini_assistant.py    # Gemini API contextual assistant
│   ├── requirements.txt               # Backend dependencies
│   ├── render.yaml                    # Render blueprint for API + PostgreSQL
│   ├── Procfile                       # Render start command
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api.js                     # REST API client
│   │   ├── App.jsx                    # Root state & tab coordination
│   │   ├── components/
│   │   │   ├── Header.jsx             # Merchant selector, demo indicator & register CTA
│   │   │   ├── RegisterMerchantModal.jsx # Merchant registration modal dialog
│   │   │   ├── KPICards.jsx           # Revenue, ATV, Repeat rate & peak times
│   │   │   ├── SalesAnalytics.jsx     # Plotly daily, hourly & category charts
│   │   │   ├── BusinessInsights.jsx   # AI-detected roadblocks with proof
│   │   │   ├── RecommendationsView.jsx# Ranked action cards & simulation
│   │   │   ├── PredictionsView.jsx    # XGBoost forecast & feature drivers
│   │   │   ├── CustomerSegmentationView.jsx # RFM persona clusters & scatter
│   │   │   ├── AIAssistant.jsx        # Gemini conversational business partner
│   │   │   └── PlotlyChart.jsx        # Reusable Plotly chart wrapper
│   │   ├── index.css                  # Tailwind styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                    # Vercel SPA rewrite rules
│   └── .env.example
└── README.md
```

---

## 4. Local Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) PostgreSQL database instance

### Step 1: Run the FastAPI Backend
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your Gemini API key in environment or .env
set GEMINI_API_KEY=your_gemini_api_key_here

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The REST API will be available at `http://localhost:8000`.  
Swagger interactive docs are at `http://localhost:8000/docs`.

### Registering Merchants via API
```bash
curl -X POST "http://localhost:8000/api/merchants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gupta Medical & Wellness",
    "category": "Pharmacy & Healthcare",
    "city": "Lucknow, Uttar Pradesh",
    "phone": "+91 98390 12345",
    "upi_vpa": "guptamedical@paytm",
    "seed_sample_transactions": true
  }'
```

### Step 2: Run the React.js Frontend
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 5. Deployment Guide

### A. Deploy Backend to Render
1. Push this repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com/), choose **New > Blueprint**.
3. Point to your repository; Render will read `backend/render.yaml`.
4. It will provision:
   - A free **PostgreSQL** database (`paytm-postgres`)
   - A **FastAPI Web Service** running `uvicorn app.main:app`
5. Under Environment Variables for the web service, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
6. Note the deployed backend URL (e.g. `https://paytm-merchant-growth-backend.onrender.com`).

### B. Deploy Frontend to Vercel
1. In the [Vercel Dashboard](https://vercel.com/), select **Add New > Project** and import the repository.
2. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g. `https://paytm-merchant-growth-backend.onrender.com`)
4. Click **Deploy**. Vercel will build and route the single-page application using `vercel.json`.

---

## 6. Mathematical & Machine Learning Foundations

- **Customer Segmentation (Scikit-Learn)**:
  Uses Recency (days since last purchase), Frequency (visit count), and Monetary (total spend). Normalizes via `StandardScaler` and clusters via `KMeans(n_clusters=4, random_state=42)`. Identifies **Champions**, **Potential Loyalists**, **At-Risk/Lapsing**, and **One-Time Visitors**.
- **Sales Forecasting (XGBoost)**:
  Engineers time-series features (`day_of_week`, `day_of_month`, `is_weekend`, `lag_1`, `lag_7`, `lag_14`, `rolling_mean_7`, `rolling_std_7`). Generates a 14-day projection with 80% prediction intervals. Reports backtested MAPE, MAE, and RMSE metrics.
- **Priority Ranking Formula**:
  $$\text{Priority Score} = (\text{Severity Weight} \times 0.40) + (\text{Impact Weight} \times 0.35) + (\text{Data Confidence} \times 0.25)$$
- **Ethical AI & Guardrails**:
  - Sample transaction data is clearly labeled as **Demo Data**.
  - Historical facts are explicitly separated from ML predictions.
  - Confidence scores and estimated impacts are bounded and never promise guaranteed revenue.
