import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ReorderSuggestionsCard = ({
  suggestions = [],
  onGenerateList,
  onPlacePurchaseOrder,
  loading = false,
}) => {
  const defaultSuggestions = [
    {
      id: '1',
      productId: '1',
      name: 'Aashirvaad Atta (5kg)',
      suggestedQty: 50,
      estimatedCost: 16500,
      unitCost: 330,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      productId: '2',
      name: 'Thums Up (1L)',
      suggestedQty: 100,
      estimatedCost: 9000,
      unitCost: 90,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      productId: '3',
      name: 'Maggi Noodles (70g)',
      suggestedQty: 80,
      estimatedCost: 4800,
      unitCost: 60,
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      productId: '4',
      name: 'Dove Soap (100g)',
      suggestedQty: 60,
      estimatedCost: 9600,
      unitCost: 160,
      imageUrl: 'https://images.unsplash.com/photo-1608248597358-1e4268e3d0e2?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      productId: '5',
      name: 'Tide Detergent (1kg)',
      suggestedQty: 70,
      estimatedCost: 14000,
      unitCost: 200,
      imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const initialItems = suggestions.length > 0 ? suggestions : defaultSuggestions;
  const [selectedIds, setSelectedIds] = useState(new Set(initialItems.map((i) => i.productId || i.id)));

  useEffect(() => {
    if (suggestions.length > 0) {
      setSelectedIds(new Set(suggestions.map((i) => i.productId || i.id)));
    }
  }, [suggestions]);

  const items = initialItems;

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.productId || i.id)));
    }
  };

  const toggleItem = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedItems = items.filter((i) => selectedIds.has(i.productId || i.id));
  const totalCost = selectedItems.reduce((sum, i) => sum + (i.estimatedCost || i.suggestedQty * (i.unitCost || 0)), 0);

  const handleOrder = () => {
    if (onPlacePurchaseOrder) {
      onPlacePurchaseOrder(selectedItems);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#00966B] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-slate-900 text-[15px]">
              Reorder Suggestions
            </h3>
          </div>

          <button
            onClick={onGenerateList}
            className="px-3 py-1 bg-[#00966B] hover:bg-[#007A56] text-white text-[11.5px] font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate List</span>
          </button>
        </div>

        {/* Select All Checkbox */}
        <div className="flex items-center gap-2 px-1 mb-2 text-xs font-semibold text-slate-500">
          <input
            type="checkbox"
            checked={items.length > 0 && selectedIds.size === items.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-[#00966B] rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-[#00966B]"
          />
          <span>Select all eligible products</span>
        </div>

        {/* Suggestion list */}
        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
          {items.map((item) => {
            const itemId = item.productId || item.id;
            const isChecked = selectedIds.has(itemId);
            return (
              <div
                key={itemId}
                className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-slate-50 rounded-xl px-1.5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(itemId)}
                    className="w-4 h-4 text-[#00966B] rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-[#00966B]"
                  />
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs">📦</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[12.5px] font-bold text-slate-900 truncate leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Suggested: <span className="font-bold text-slate-700">{item.suggestedQty} units</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-extrabold text-[13px] text-slate-900">
                  {formatCurrency(item.estimatedCost || item.suggestedQty * (item.unitCost || 0))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Total and Order Button */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm font-bold mb-3 px-1">
          <span className="text-slate-500">Total Estimated Cost</span>
          <span className="text-slate-900 text-base font-extrabold">
            {formatCurrency(totalCost || 53900)}
          </span>
        </div>

        <button
          onClick={handleOrder}
          disabled={selectedIds.size === 0}
          className="w-full py-2.5 px-4 bg-[#00966B] hover:bg-[#007A56] disabled:opacity-50 text-white text-[13.5px] font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
          <span>Place Purchase Order</span>
        </button>
      </div>
    </div>
  );
};

export default ReorderSuggestionsCard;
