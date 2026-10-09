import React from 'react';
import { Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupplierInsightsCard = ({ suppliers = [] }) => {
  const navigate = useNavigate();

  const defaultSuppliers = [
    { id: '1', name: 'Reliance Distributor', company: 'Reliance Consumer Products', leadTimeDays: 2, fulfillmentRate: 99, status: 'Active' },
    { id: '2', name: 'Coca-Cola India', company: 'Hindustan Coca-Cola Beverages', leadTimeDays: 3, fulfillmentRate: 98, status: 'Active' },
    { id: '3', name: 'Nestle Distributor', company: 'Nestlé India Distribution', leadTimeDays: 2, fulfillmentRate: 96, status: 'Active' },
    { id: '4', name: 'HUL Distributor', company: 'Hindustan Unilever Ltd', leadTimeDays: 4, fulfillmentRate: 97, status: 'Active' },
  ];

  const items = suppliers && suppliers.length > 0 ? suppliers.slice(0, 4) : defaultSuppliers;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00966B] flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
              Supplier Network & Insights
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Lead times & order fulfillment performance
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/suppliers')}
          className="text-[11.5px] text-[#00966B] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Suppliers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Supplier List */}
      <div className="divide-y divide-slate-100">
        {items.map((sup) => (
          <div key={sup.id} className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/70 px-1 rounded-xl transition-colors">
            <div className="min-w-0">
              <h4 className="text-[12.5px] font-bold text-slate-800 leading-tight truncate">
                {sup.name}
              </h4>
              <p className="text-[10.5px] text-slate-400 truncate">
                {sup.company || 'Distributor Agency'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 text-right">
              <div>
                <span className="text-[11.5px] font-bold text-slate-800 block leading-tight">
                  {sup.leadTimeDays || 2} Days
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Avg Lead Time</span>
              </div>
              <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10.5px] rounded-lg border border-emerald-200 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{sup.fulfillmentRate || 98}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierInsightsCard;
