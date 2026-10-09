"""
StockSense AI - Python Analytics & PDF Microservice (FastAPI)
Provides high-performance calculations and ReportLab PDF report generation.
"""
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

import analytics_engine as engine
import pdf_generator as pdf_gen

app = FastAPI(
    title="StockSense AI Python Analytics & PDF Engine",
    version="1.0.0",
    description="Dedicated microservice for supermarket stock math, demand velocity, and ReportLab PDF generation.",
)

# Allow CORS from Node.js server & frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InventoryPayload(BaseModel):
    store_name: Optional[str] = "StockSense Supermarket"
    products: List[Dict[str, Any]] = []
    categories: Optional[List[Dict[str, Any]]] = []

class PdfReportPayload(BaseModel):
    report_type: str = "inventory" # "inventory", "low_stock", "reorder", "sales"
    store_name: Optional[str] = "StockSense Supermarket"
    products: Optional[List[Dict[str, Any]]] = []
    categories: Optional[List[Dict[str, Any]]] = []
    summary: Optional[Dict[str, Any]] = None
    low_stock: Optional[Dict[str, Any]] = None
    reorders: Optional[Dict[str, Any]] = None
    sales_summary: Optional[Dict[str, Any]] = None
    transactions: Optional[List[Dict[str, Any]]] = []
    period: Optional[str] = "Today"

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "StockSense AI Python Analytics & PDF Engine",
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/api/analytics/inventory-summary")
def get_inventory_summary(payload: InventoryPayload):
    summary = engine.calculate_inventory_summary(payload.products, payload.categories)
    category_dist = engine.analyze_category_distribution(payload.products)
    return {
        "success": True,
        "data": {
            "summary": summary,
            "category_distribution": category_dist,
        }
    }

@app.post("/api/analytics/low-stock")
def get_low_stock(payload: InventoryPayload):
    result = engine.detect_low_stock(payload.products)
    return {
        "success": True,
        "data": result,
    }

@app.post("/api/analytics/reorders")
def get_reorders(payload: InventoryPayload):
    result = engine.calculate_reorder_recommendations(payload.products)
    return {
        "success": True,
        "data": result,
    }

@app.post("/api/pdf/generate")
def generate_pdf_report(payload: PdfReportPayload):
    report_type = payload.report_type.lower()
    store_name = payload.store_name or "StockSense Supermarket"
    products = payload.products or []

    # If summary or calculations not provided, compute with Python engine
    summary = payload.summary or engine.calculate_inventory_summary(products)
    category_dist = engine.analyze_category_distribution(products)
    low_stock = payload.low_stock or engine.detect_low_stock(products)
    reorders = payload.reorders or engine.calculate_reorder_recommendations(products)

    data = {
        "store_name": store_name,
        "summary": summary,
        "category_distribution": category_dist,
        "products": products,
        "low_stock": low_stock,
        "reorders": reorders,
        "sales_summary": payload.sales_summary or {},
        "transactions": payload.transactions or [],
        "period": payload.period or "Today",
    }

    filename_date = datetime.now().strftime("%Y-%m-%d")

    if report_type in ["low_stock", "lowstock", "shortage"]:
        pdf_buffer = pdf_gen.generate_low_stock_pdf(data)
        filename = f"StockSense_Low_Stock_Report_{filename_date}.pdf"
    elif report_type in ["reorder", "purchase", "procurement"]:
        pdf_buffer = pdf_gen.generate_reorder_pdf(data)
        filename = f"StockSense_Reorder_Analysis_{filename_date}.pdf"
    elif report_type in ["sales", "revenue", "pos", "billing"]:
        pdf_buffer = pdf_gen.generate_sales_pdf(data)
        filename = f"StockSense_Sales_Report_{filename_date}.pdf"
    else: # Default master inventory report
        pdf_buffer = pdf_gen.generate_inventory_pdf(data)
        filename = f"StockSense_Inventory_Report_{filename_date}.pdf"

    pdf_bytes = pdf_buffer.getvalue()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
