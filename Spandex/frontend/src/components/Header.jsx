import React from 'react';
import { 
  TrendingUp, 
  LayoutDashboard, 
  BarChart2, 
  Lightbulb, 
  Users, 
  AlertTriangle, 
  Bell, 
  PlusCircle, 
  ChevronDown,
  Store
} from 'lucide-react';

export default function Header({
  activeTab,
  onSelectTab,
  merchants = [],
  selectedMerchantId,
  onSelectMerchant,
  onOpenRegisterModal,
  issuesCount = 4,
  recommendationsCount = 3,
}) {
  const selectedMerchant = merchants.find(m => m.id === selectedMerchantId) || merchants[0] || {
    id: 'MID987654',
    name: 'Super Mart',
    category: 'Grocery & Daily Needs',
    upi_vpa: 'supermart@paytm'
  };

  const getInitials = (name) => {
    if (!name) return 'SM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/60 z-30 sticky top-0 flex items-center px-4 sm:px-6 lg:px-10 shrink-0 shadow-sm backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-bold text-xl tracking-tight">Growth AI</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-[#002970] px-2 py-0.5 rounded-full border border-sky-200">
                Paytm
              </span>
            </div>
          </div>
        </div>

        {/* Center Horizontal Nav (Pill Container) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200/60 shadow-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-600' : ''}`} />
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart2 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-indigo-600' : ''}`} />
            Sales Analytics
          </button>

          <button
            onClick={() => onSelectTab('issues')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === 'issues'
                ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'issues' ? 'text-rose-600' : ''}`} />
            AI Issues
            {issuesCount > 0 && (
              <span className="ml-0.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {issuesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === 'recommendations'
                ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${activeTab === 'recommendations' ? 'text-indigo-600' : ''}`} />
            Recommendations
            <span className="ml-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {recommendationsCount}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('customers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              activeTab === 'customers'
                ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'customers' ? 'text-indigo-600' : ''}`} />
            Customers
          </button>
        </nav>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Register Merchant CTA Button */}
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-full shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Register Merchant</span>
            <span className="sm:hidden">Register</span>
          </button>

          {/* Merchant Dropdown Switcher */}
          <div className="relative">
            <select
              value={selectedMerchantId || ''}
              onChange={(e) => onSelectMerchant(e.target.value)}
              className="pl-3 pr-7 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer shadow-2xs max-w-[130px] sm:max-w-[180px] truncate transition-colors"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Bell Notification */}
          <button 
            onClick={() => onSelectTab('issues')}
            title="AI Alert Notifications"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-slate-200/60 text-slate-500 hover:bg-slate-50 transition-colors relative shrink-0"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>

          <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[120px]">
                {selectedMerchant?.name}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">
                {selectedMerchant?.id}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs sm:text-sm border border-indigo-200/50 group-hover:shadow-glow transition-all">
              {getInitials(selectedMerchant?.name)}
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-40 shadow-lg">
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'issues', label: 'Issues', icon: AlertTriangle, badge: issuesCount },
          { id: 'recommendations', label: 'Actions', icon: Lightbulb, badge: recommendationsCount },
          { id: 'customers', label: 'Customers', icon: Users },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 relative ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}
