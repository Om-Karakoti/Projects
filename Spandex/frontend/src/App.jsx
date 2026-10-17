import React, { useState, useEffect } from 'react';
import { api } from './api';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import SalesAnalyticsView from './components/SalesAnalyticsView';
import IssuesView from './components/IssuesView';
import RankedActionsView from './components/RankedActionsView';
import CustomersView from './components/CustomersView';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import RegisterMerchantModal from './components/RegisterMerchantModal';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('MERCH_001');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [customerSegments, setCustomerSegments] = useState(null);
  
  // Status states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const merchantsRes = await api.getMerchants();
        setMerchants(merchantsRes || []);
        if (merchantsRes && merchantsRes.length > 0) {
          setSelectedMerchantId(merchantsRes[0].id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Could not connect to FastAPI backend. Ensure the backend server is running on http://localhost:8000.");
      }
    }
    init();
  }, []);

  // Fetch all live merchant data whenever selectedMerchantId changes
  useEffect(() => {
    if (!selectedMerchantId) return;

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [
          overviewRes,
          analyticsRes,
          issuesRes,
          recsRes,
          predsRes,
          segmentsRes
        ] = await Promise.all([
          api.getOverview(selectedMerchantId, 30),
          api.getSalesAnalytics(selectedMerchantId),
          api.getIssues(selectedMerchantId, 14),
          api.getRecommendations(selectedMerchantId),
          api.getPredictions(selectedMerchantId, 14),
          api.getCustomerSegments(selectedMerchantId),
        ]);

        if (isMounted) {
          setOverview(overviewRes);
          setAnalytics(analyticsRes);
          setIssues(issuesRes || []);
          setRecommendations(recsRes || []);
          setPredictions(predsRes);
          setCustomerSegments(segmentsRes);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading merchant details:", err);
          setError(err.message || "Failed to load merchant data.");
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedMerchantId]);

  const selectedMerchant = merchants.find(m => m.id === selectedMerchantId) || {
    id: selectedMerchantId,
    name: 'Super Mart',
    category: 'Grocery & Daily Needs'
  };

  const handleMerchantRegistered = (newMerchant) => {
    setMerchants(prev => [...prev, newMerchant]);
    setSelectedMerchantId(newMerchant.id);
    setActiveTab('dashboard');
    showNotification(
      "Merchant Registered Successfully!",
      `Onboarded '${newMerchant.name}' (${newMerchant.category}). Generated 60 days of transactional activity, XGBoost predictions, and AI business recommendations.`
    );
  };

  const handleApplyAction = async (rec) => {
    showNotification(
      "Action Implementation Triggered",
      `Offer setup successfully initialized for "${rec.action}". Targeted segment will receive app notifications.`
    );
    try {
      if (rec.id) {
        await api.simulateAction(selectedMerchantId, rec.id, 'apply');
      }
    } catch (err) {
      console.warn("Could not record simulation action on backend:", err);
    }
  };

  const showNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Bar from SuperDesign */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        merchants={merchants}
        selectedMerchantId={selectedMerchantId}
        onSelectMerchant={setSelectedMerchantId}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        issuesCount={issues.length || 4}
        recommendationsCount={recommendations.length || 3}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto relative pb-28">
        
        {/* Success / Alert Toast Notification */}
        {notification && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-soft animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <strong className="block font-bold text-sm text-emerald-950">{notification.title}</strong>
                <span className="text-emerald-800">{notification.message}</span>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-3 py-1.5 rounded-full hover:bg-emerald-100/50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between gap-3 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <strong className="block font-bold text-sm text-rose-950">Backend Connection Error</strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedMerchantId(prev => prev)}
              className="px-4 py-2 bg-rose-600 text-white rounded-full text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Analyzing transactions, calculating issues &amp; generating hybrid AI recommendations...
            </p>
          </div>
        )}

        {/* Active View */}
        {!loading && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                overview={overview}
                predictions={predictions}
                issues={issues}
                recommendations={recommendations}
                onNavigateTab={setActiveTab}
                onApplyAction={handleApplyAction}
              />
            )}

            {activeTab === 'analytics' && (
              <SalesAnalyticsView
                analytics={analytics}
                overview={overview}
              />
            )}

            {activeTab === 'issues' && (
              <IssuesView
                issues={issues}
                onNavigateTab={setActiveTab}
                onSelectRecommendation={(rec) => {
                  setActiveTab('recommendations');
                }}
              />
            )}

            {activeTab === 'recommendations' && (
              <RankedActionsView
                recommendations={recommendations}
                onApplyAction={handleApplyAction}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersView
                customerSegments={customerSegments}
                overview={overview}
              />
            )}
          </>
        )}

        {/* Floating Spandex Gemini AI Assistant */}
        <FloatingAIAssistant
          merchantId={selectedMerchantId}
          merchantName={selectedMerchant?.name}
        />

      </main>

      {/* Register Merchant Modal */}
      <RegisterMerchantModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onMerchantRegistered={handleMerchantRegistered}
      />

    </div>
  );
}
