"""
StockSense AI - Python Analytics & Calculation Engine
High-performance inventory calculations, sales velocity, demand forecasting, and stock health.
"""
from typing import List, Dict, Any, Optional
import math
from datetime import datetime

def calculate_inventory_summary(products: List[Dict[str, Any]], categories: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Calculates comprehensive store inventory metrics and valuation."""
    total_products = len(products)
    if total_products == 0:
        return {
            "total_products": 0,
            "in_stock_count": 0,
            "low_stock_count": 0,
            "out_of_stock_count": 0,
            "total_units": 0,
            "purchase_valuation": 0.0,
            "retail_valuation": 0.0,
            "potential_margin": 0.0,
            "health_score": 100.0,
        }

    in_stock = 0
    low_stock = 0
    out_of_stock = 0
    total_units = 0.0
    purchase_val = 0.0
    retail_val = 0.0

    for p in products:
        stock = float(p.get("currentStock", 0) or 0)
        reorder_lvl = float(p.get("reorderLevel", 20) or 20)
        buy_price = float(p.get("purchasePrice", 0) or 0)
        sell_price = float(p.get("sellingPrice", 0) or 0)

        total_units += stock
        purchase_val += stock * buy_price
        retail_val += stock * sell_price

        if stock <= 0:
            out_of_stock += 1
            low_stock += 1
        elif stock <= reorder_lvl:
            low_stock += 1
        else:
            in_stock += 1

    health_score = round(((total_products - low_stock) / total_products) * 100.0, 1)

    return {
        "total_products": total_products,
        "in_stock_count": in_stock,
        "low_stock_count": low_stock,
        "out_of_stock_count": out_of_stock,
        "total_units": round(total_units, 2),
        "purchase_valuation": round(purchase_val, 2),
        "retail_valuation": round(retail_val, 2),
        "potential_margin": round(retail_val - purchase_val, 2),
        "health_score": health_score,
    }

def detect_low_stock(products: List[Dict[str, Any]], limit: int = 20) -> Dict[str, Any]:
    """Filters and ranks critical items at or below their reorder point."""
    low_stock_items = []
    total_replenishment_cost = 0.0

    for p in products:
        stock = float(p.get("currentStock", 0) or 0)
        reorder_lvl = float(p.get("reorderLevel", 20) or 20)
        target_stock = float(p.get("targetStockLevel", 100) or 100)
        buy_price = float(p.get("purchasePrice", 0) or 0)

        if stock <= reorder_lvl:
            deficit = max(0.0, reorder_lvl - stock)
            order_qty = max(0.0, target_stock - stock)
            item_cost = round(order_qty * buy_price, 2)
            total_replenishment_cost += item_cost

            urgency = "CRITICAL (Stockout)" if stock <= 0 else ("URGENT" if stock <= reorder_lvl * 0.3 else "HIGH")

            low_stock_items.append({
                "id": p.get("id"),
                "name": p.get("name", "Unknown Item"),
                "sku": p.get("sku", "N/A"),
                "category": p.get("category", {}).get("name") if isinstance(p.get("category"), dict) else (p.get("category") or "General"),
                "current_stock": stock,
                "reorder_level": reorder_lvl,
                "target_stock": target_stock,
                "unit": p.get("unitOfMeasure", "units"),
                "purchase_price": buy_price,
                "selling_price": float(p.get("sellingPrice", 0) or 0),
                "deficit": round(deficit, 2),
                "suggested_order_qty": round(order_qty, 2),
                "estimated_cost": item_cost,
                "urgency": urgency,
                "supplier": p.get("preferredSupplier", {}).get("name") if isinstance(p.get("preferredSupplier"), dict) else (p.get("supplier") or "Local Supplier"),
            })

    # Sort by stock ascending (out of stock first)
    low_stock_items.sort(key=lambda x: (x["current_stock"], -x["deficit"]))

    return {
        "total_low_stock": len(low_stock_items),
        "total_replenishment_cost": round(total_replenishment_cost, 2),
        "items": low_stock_items[:limit],
    }

def calculate_reorder_recommendations(products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generates supplier-grouped replenishment packages."""
    supplier_groups: Dict[str, Dict[str, Any]] = {}
    total_cost = 0.0

    for p in products:
        stock = float(p.get("currentStock", 0) or 0)
        reorder_lvl = float(p.get("reorderLevel", 20) or 20)
        target_stock = float(p.get("targetStockLevel", 100) or 100)
        buy_price = float(p.get("purchasePrice", 0) or 0)

        if stock <= reorder_lvl:
            supp = p.get("preferredSupplier") or {}
            supp_id = supp.get("id") if isinstance(supp, dict) else "unassigned"
            supp_name = supp.get("name") if isinstance(supp, dict) else (p.get("supplier") or "Direct / Local Supplier")
            lead_time = supp.get("leadTimeDays", 3) if isinstance(supp, dict) else 3

            if supp_id not in supplier_groups:
                supplier_groups[supp_id] = {
                    "supplier_id": supp_id,
                    "supplier_name": supp_name,
                    "lead_time_days": lead_time,
                    "total_items": 0,
                    "total_cost": 0.0,
                    "items": [],
                }

            order_qty = max(0.0, target_stock - stock)
            cost = round(order_qty * buy_price, 2)
            total_cost += cost

            supplier_groups[supp_id]["total_items"] += 1
            supplier_groups[supp_id]["total_cost"] = round(supplier_groups[supp_id]["total_cost"] + cost, 2)
            supplier_groups[supp_id]["items"].append({
                "product_id": p.get("id"),
                "name": p.get("name"),
                "sku": p.get("sku"),
                "current_stock": stock,
                "reorder_level": reorder_lvl,
                "target_stock": target_stock,
                "recommended_order_qty": round(order_qty, 2),
                "unit": p.get("unitOfMeasure", "units"),
                "purchase_price": buy_price,
                "estimated_cost": cost,
            })

    packages = list(supplier_groups.values())
    packages.sort(key=lambda x: x["total_cost"], reverse=True)

    return {
        "total_suppliers": len(packages),
        "total_estimated_cost": round(total_cost, 2),
        "packages": packages,
    }

def analyze_category_distribution(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Calculates category-wise stock counts, valuation, and deficits."""
    cat_map: Dict[str, Dict[str, Any]] = {}

    for p in products:
        cat = p.get("category")
        cat_name = cat.get("name") if isinstance(cat, dict) else (cat or "General FMCG")
        stock = float(p.get("currentStock", 0) or 0)
        reorder_lvl = float(p.get("reorderLevel", 20) or 20)
        buy_price = float(p.get("purchasePrice", 0) or 0)
        sell_price = float(p.get("sellingPrice", 0) or 0)

        if cat_name not in cat_map:
            cat_map[cat_name] = {
                "category_name": cat_name,
                "total_products": 0,
                "total_units": 0.0,
                "low_stock_count": 0,
                "purchase_value": 0.0,
                "retail_value": 0.0,
            }

        cat_map[cat_name]["total_products"] += 1
        cat_map[cat_name]["total_units"] += stock
        cat_map[cat_name]["purchase_value"] += stock * buy_price
        cat_map[cat_name]["retail_value"] += stock * sell_price
        if stock <= reorder_lvl:
            cat_map[cat_name]["low_stock_count"] += 1

    result = list(cat_map.values())
    for r in result:
        r["total_units"] = round(r["total_units"], 1)
        r["purchase_value"] = round(r["purchase_value"], 2)
        r["retail_value"] = round(r["retail_value"], 2)

    result.sort(key=lambda x: x["retail_value"], reverse=True)
    return result
