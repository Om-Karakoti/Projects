const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => fetchJSON("/api/health"),
  getMerchants: () => fetchJSON("/api/merchants"),
  registerMerchant: (merchantData) =>
    fetchJSON("/api/merchants", {
      method: "POST",
      body: JSON.stringify(merchantData),
    }),
  getMerchant: (merchantId) => fetchJSON(`/api/merchants/${merchantId}`),
  getOverview: (merchantId, windowDays = 30) => fetchJSON(`/api/merchants/${merchantId}/overview?window_days=${windowDays}`),
  getSalesAnalytics: (merchantId, startDate, endDate) => {
    let q = "";
    if (startDate && endDate) q = `?start_date=${startDate}&end_date=${endDate}`;
    return fetchJSON(`/api/merchants/${merchantId}/sales-analytics${q}`);
  },
  getIssues: (merchantId, windowDays = 14) => fetchJSON(`/api/merchants/${merchantId}/issues?window_days=${windowDays}`),
  getRecommendations: (merchantId) => fetchJSON(`/api/merchants/${merchantId}/recommendations`),
  getPredictions: (merchantId, horizonDays = 14) => fetchJSON(`/api/merchants/${merchantId}/predictions?horizon_days=${horizonDays}`),
  getCustomerSegments: (merchantId) => fetchJSON(`/api/merchants/${merchantId}/customer-segments`),
  queryAssistant: (merchantId, query, conversationHistory = []) => 
    fetchJSON(`/api/merchants/${merchantId}/assistant/query`, {
      method: "POST",
      body: JSON.stringify({ query, conversation_history: conversationHistory }),
    }),
  simulateAction: (merchantId, recId, action = "apply") =>
    fetchJSON(`/api/merchants/${merchantId}/recommendations/${recId}/simulate-action?action=${action}`, {
      method: "POST",
    }),
};
