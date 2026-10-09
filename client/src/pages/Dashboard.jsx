import React, { useState, useEffect, useCallback } from 'react';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import KpiCards from '../components/dashboard/KpiCards';
import StockStatusOverview from '../components/dashboard/StockStatusOverview';
import SalesStockTrendChart from '../components/dashboard/SalesStockTrendChart';
import AiReorderInsights from '../components/dashboard/AiReorderInsights';
import SuggestedReorderTable from '../components/dashboard/SuggestedReorderTable';
import TopFastMovingProducts from '../components/dashboard/TopFastMovingProducts';
import CategoryWiseStockStatus from '../components/dashboard/CategoryWiseStockStatus';
import AiReorderPromoBanner from '../components/dashboard/AiReorderPromoBanner';
import BatchOrderModal from '../components/modals/BatchOrderModal';
import AddProductModal from '../components/modals/AddProductModal';
import StockInModal from '../components/modals/StockInModal';
import StockOutModal from '../components/modals/StockOutModal';
import ProductDetailsModal from '../components/modals/ProductDetailsModal';
import { useStore } from '../context/StoreContext';
import api from '../services/api';

const Dashboard = () => {
  const { refreshKey, triggerRefresh, globalSearch } = useStore();

  const [loading, setLoading] = useState(true);
  const [generatingReorder, setGeneratingReorder] = useState(false);
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [topFastMoving, setTopFastMoving] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Modals state
  const [batchOrderModalOpen, setBatchOrderModalOpen] = useState(false);
  const [selectedReorderItems, setSelectedReorderItems] = useState([]);
  const [notificationBanner, setNotificationBanner] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        summaryRes,
        trendRes,
        insightsRes,
        reorderRes,
        fastMovingRes,
        catStatusRes,
        categoriesRes,
        suppliersRes,
      ] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/sales-stock-trend'),
        api.get('/dashboard/ai-insights'),
        api.get('/reorder/suggestions'),
        api.get('/dashboard/top-fast-moving'),
        api.get('/dashboard/category-stock'),
        api.get('/categories'),
        api.get('/suppliers'),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (trendRes.success) setTrendData(trendRes.data);
      if (insightsRes.success) setAiInsights(insightsRes.data);
      if (reorderRes.success) setReorderSuggestions(reorderRes.data);
      if (fastMovingRes.success) setTopFastMoving(fastMovingRes.data);
      if (catStatusRes.success) setCategoryStatus(catStatusRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  // Generate Reorder List action
  const handleGenerateReorderList = async () => {
    try {
      setGeneratingReorder(true);
      const res = await api.get('/reorder/suggestions');
      if (res.success) {
        setReorderSuggestions(res.data);
        setNotificationBanner({
          type: 'success',
          message: `✨ AI Reorder Engine analyzed inventory and generated recommendations for ${res.data?.length || 18} eligible items.`,
        });
        setTimeout(() => setNotificationBanner(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReorder(false);
    }
  };

  // Add Single Item to PO
  const handleAddToPo = (item) => {
    setSelectedReorderItems([item]);
    setBatchOrderModalOpen(true);
  };

  // Bulk Add Items to PO
  const handleBulkAddToPo = (items) => {
    if (!items || items.length === 0) return;
    setSelectedReorderItems(items);
    setBatchOrderModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {notificationBanner && (
        <div className="p-3 bg-[#E8F8EE] border border-[#BDE8CC] text-[#047857] rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <span>{notificationBanner.message}</span>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-[#047857] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Welcome Section & Banner */}
      <WelcomeBanner />

      {/* 2. Four KPI Summary Cards */}
      <KpiCards summary={summary} />

      {/* 3. Middle Grid: Stock Status Donut (4 cols), Sales & Stock Trend (4 cols), AI Reorder Insights (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4 h-full">
          <StockStatusOverview stockStatus={summary?.stockStatus} />
        </div>
        <div className="lg:col-span-4 h-full">
          <SalesStockTrendChart data={trendData} />
        </div>
        <div className="lg:col-span-4 h-full">
          <AiReorderInsights
            insights={aiInsights}
            onGenerateList={handleGenerateReorderList}
            loading={generatingReorder}
          />
        </div>
      </div>

      {/* 4. Middle-Bottom Row: Suggested Reorder List (8 cols) & Top Fast-Moving Products (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 h-full">
          <SuggestedReorderTable
            suggestions={reorderSuggestions}
            categories={categories}
            onAddToPo={handleAddToPo}
            onBulkAddToPo={handleBulkAddToPo}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-4 h-full">
          <TopFastMovingProducts products={topFastMoving} />
        </div>
      </div>

      {/* 5. Bottom Row: Category Wise Stock Status (8 cols) & AI Reorder Promotional Banner (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 h-full">
          <CategoryWiseStockStatus categories={categoryStatus} />
        </div>
        <div className="lg:col-span-4 h-full">
          <AiReorderPromoBanner
            onGenerateList={handleGenerateReorderList}
            loading={generatingReorder}
          />
        </div>
      </div>

      {/* Purchase Order Batch Creation Dialog */}
      <BatchOrderModal
        isOpen={batchOrderModalOpen}
        onClose={() => setBatchOrderModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
          setNotificationBanner({
            type: 'success',
            message: '🎉 Purchase Order created successfully in the database!',
          });
          setTimeout(() => setNotificationBanner(null), 5000);
        }}
        selectedItems={selectedReorderItems}
      />
    </div>
  );
};

export default Dashboard;
