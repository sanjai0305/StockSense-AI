"""
StockSense AI - High-Resolution PDF Report Generator
Generates professionally branded supermarket inventory, low-stock, and reorder reports using ReportLab & Matplotlib.
"""
import io
import os
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Brand Colors (StockSense Emerald Palette)
PRIMARY_GREEN = colors.HexColor("#00966B")
DARK_GREEN = colors.HexColor("#007A56")
MINT_BG = colors.HexColor("#E8F8EE")
DARK_NAVY = colors.HexColor("#0F172A")
SUBTITLE_GRAY = colors.HexColor("#64748B")
BORDER_GREEN = colors.HexColor("#CDE9D6")
ALERT_RED = colors.HexColor("#EF4444")
LIGHT_GRAY_BG = colors.HexColor("#F8FAF9")

class NumberedCanvas(canvas.Canvas):
    """Adds professional running header and footer with dynamic page numbering."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(SUBTITLE_GRAY)

        # Top running header
        self.drawString(40, 810, "StockSense AI — Supermarket Inventory Intelligence")
        self.setStrokeColor(BORDER_GREEN)
        self.setLineWidth(0.5)
        self.line(40, 804, 570, 804)

        # Bottom footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(570, 30, page_text)
        self.drawString(40, 30, f"Confidential • Generated on {datetime.now().strftime('%d %b %Y, %I:%M %p')}")
        self.line(40, 42, 570, 42)
        self.restoreState()

def create_pie_chart_image(labels: List[str], values: List[float], title: str) -> io.BytesIO:
    """Generates a clean doughnut chart image using Matplotlib."""
    fig, ax = plt.subplots(figsize=(4.2, 2.2), dpi=200)
    chart_colors = ['#00966B', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#06B6D4'][:len(values)]
    
    # Avoid zero division
    if sum(values) == 0:
        values = [1]
        labels = ["No Data"]

    wedges, texts, autotexts = ax.pie(
        values,
        labels=labels,
        autopct='%1.0f%%',
        startangle=140,
        colors=chart_colors,
        textprops=dict(color="#0F172A", size=8, weight='bold'),
        wedgeprops=dict(width=0.45, edgecolor='white', linewidth=1.5)
    )
    for at in autotexts:
        at.set_color('white')
        at.set_fontsize(7)

    ax.set_title(title, fontsize=9, fontweight='bold', color="#0F172A", pad=10)
    plt.tight_layout()

    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png', bbox_inches='tight', transparent=True)
    plt.close(fig)
    img_buf.seek(0)
    return img_buf

def get_report_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=DARK_NAVY,
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=SUBTITLE_GRAY,
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=DARK_GREEN,
        spaceBefore=12,
        spaceAfter=6,
    )
    
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=DARK_NAVY,
    )
    
    cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=DARK_NAVY,
    )

    cell_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )

    kpi_num_style = ParagraphStyle(
        'KpiNumber',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        textColor=DARK_GREEN,
        alignment=1, # Center
    )

    kpi_label_style = ParagraphStyle(
        'KpiLabel',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9,
        textColor=SUBTITLE_GRAY,
        alignment=1, # Center
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'h2': h2_style,
        'cell': cell_style,
        'cell_bold': cell_bold,
        'header': cell_header,
        'kpi_num': kpi_num_style,
        'kpi_label': kpi_label_style,
    }

def build_pdf_document(report_title: str, store_name: str, elements: list) -> io.BytesIO:
    """Compiles elements into a clean A4 PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50,
    )
    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer

def generate_inventory_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generates comprehensive Inventory Status & Valuation PDF Report."""
    styles = get_report_styles()
    elements = []

    store_name = data.get("store_name", "StockSense Supermarket")
    summary = data.get("summary", {})
    products = data.get("products", [])
    categories = data.get("category_distribution", [])

    # Title & Metadata Banner
    elements.append(Paragraph("StockSense AI — Master Inventory Status Report", styles['title']))
    elements.append(Spacer(1, 3))
    meta_text = f"<b>Store:</b> {store_name} &nbsp;|&nbsp; <b>Report Date:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')} &nbsp;|&nbsp; <b>Scope:</b> All Active Product SKUs"
    elements.append(Paragraph(meta_text, styles['subtitle']))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_GREEN, spaceBefore=2, spaceAfter=10))

    # 4 KPI Summary Cards Table
    kpi_data = [
        [
            Paragraph(f"{summary.get('total_products', 0)}", styles['kpi_num']),
            Paragraph(f"{summary.get('in_stock_count', 0)}", styles['kpi_num']),
            Paragraph(f"{summary.get('low_stock_count', 0)}", styles['kpi_num']),
            Paragraph(f"₹{summary.get('retail_valuation', 0):,.0f}", styles['kpi_num']),
        ],
        [
            Paragraph("TOTAL ACTIVE SKUS", styles['kpi_label']),
            Paragraph("HEALTHY IN-STOCK", styles['kpi_label']),
            Paragraph("LOW / OUT OF STOCK", styles['kpi_label']),
            Paragraph("RETAIL VALUATION", styles['kpi_label']),
        ],
    ]
    kpi_table = Table(kpi_data, colWidths=[125, 125, 125, 140])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 15))

    # Visual Category Chart + Category Breakdown
    if categories:
        elements.append(Paragraph("Category-wise Inventory Distribution", styles['h2']))
        cat_names = [c.get('category_name', 'Other') for c in categories[:5]]
        cat_units = [float(c.get('total_units', 0)) for c in categories[:5]]
        
        chart_buf = create_pie_chart_image(cat_names, cat_units, "Units by Category")
        chart_img = Image(chart_buf, width=220, height=110)

        # Mini summary table beside chart
        cat_table_data = [[
            Paragraph("Category", styles['header']),
            Paragraph("SKUs", styles['header']),
            Paragraph("Units", styles['header']),
            Paragraph("Valuation (₹)", styles['header']),
        ]]
        for c in categories[:5]:
            cat_table_data.append([
                Paragraph(c.get('category_name', 'General'), styles['cell_bold']),
                Paragraph(str(c.get('total_products', 0)), styles['cell']),
                Paragraph(f"{c.get('total_units', 0):,.0f}", styles['cell']),
                Paragraph(f"₹{c.get('retail_value', 0):,.0f}", styles['cell']),
            ])
        cat_table = Table(cat_table_data, colWidths=[95, 45, 60, 80])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), DARK_GREEN),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY_BG]),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))

        combined_table = Table([[chart_img, cat_table]], colWidths=[230, 285])
        combined_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        elements.append(combined_table)
        elements.append(Spacer(1, 12))

    # Product Details Table (Paginated)
    elements.append(Paragraph(f"Live Product Catalog & Stock Status ({len(products)} Items)", styles['h2']))
    table_data = [[
        Paragraph("Product Name", styles['header']),
        Paragraph("SKU", styles['header']),
        Paragraph("Category", styles['header']),
        Paragraph("Stock", styles['header']),
        Paragraph("Min ROP", styles['header']),
        Paragraph("Selling Price", styles['header']),
        Paragraph("Status", styles['header']),
    ]]

    for p in products[:100]: # Top 100 in PDF
        stock = float(p.get("currentStock", 0) or 0)
        reorder = float(p.get("reorderLevel", 20) or 20)
        is_low = stock <= reorder
        status_text = "OUT OF STOCK" if stock <= 0 else ("LOW STOCK" if is_low else "IN STOCK")
        status_color = ALERT_RED if stock <= 0 else (PRIMARY_GREEN if not is_low else colors.HexColor("#D97706"))

        table_data.append([
            Paragraph(p.get("name", "Product"), styles['cell_bold']),
            Paragraph(p.get("sku", "N/A"), styles['cell']),
            Paragraph(p.get("category", {}).get("name") if isinstance(p.get("category"), dict) else (p.get("category") or "General"), styles['cell']),
            Paragraph(f"{stock:,.0f} {p.get('unitOfMeasure', '')}", styles['cell_bold']),
            Paragraph(f"{reorder:,.0f}", styles['cell']),
            Paragraph(f"₹{float(p.get('sellingPrice', 0)):,.2f}", styles['cell']),
            Paragraph(f"<b>{status_text}</b>", ParagraphStyle('St', parent=styles['cell'], textColor=status_color)),
        ])

    prod_table = Table(table_data, colWidths=[135, 65, 85, 65, 45, 60, 60])
    prod_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_GREEN),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(prod_table)

    return build_pdf_document("Inventory Report", store_name, elements)

def generate_low_stock_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generates Low Stock & Urgent Replenishment Alert PDF Report."""
    styles = get_report_styles()
    elements = []

    store_name = data.get("store_name", "StockSense Supermarket")
    low_stock = data.get("low_stock", {})
    items = low_stock.get("items", [])

    elements.append(Paragraph("StockSense AI — Low Stock & Replenishment Alert", styles['title']))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph(f"<b>Store:</b> {store_name} &nbsp;|&nbsp; <b>Report Date:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')} &nbsp;|&nbsp; <b>Status:</b> Immediate Replenishment Required", styles['subtitle']))
    elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_GREEN, spaceBefore=2, spaceAfter=10))

    # KPI Banner
    kpi_data = [
        [
            Paragraph(f"{low_stock.get('total_low_stock', len(items))}", styles['kpi_num']),
            Paragraph(f"₹{low_stock.get('total_replenishment_cost', 0):,.0f}", styles['kpi_num']),
            Paragraph(f"{datetime.now().strftime('%d %b %Y')}", styles['kpi_num']),
        ],
        [
            Paragraph("CRITICAL ITEMS BELOW REORDER POINT", styles['kpi_label']),
            Paragraph("ESTIMATED REPLENISHMENT COST", styles['kpi_label']),
            Paragraph("AUDIT DATE", styles['kpi_label']),
        ],
    ]
    kpi_table = Table(kpi_data, colWidths=[170, 170, 175])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 15))

    # Low stock items table
    elements.append(Paragraph(f"Urgent Replenishment Priority List ({len(items)} Items)", styles['h2']))
    table_data = [[
        Paragraph("Product", styles['header']),
        Paragraph("SKU", styles['header']),
        Paragraph("Current", styles['header']),
        Paragraph("ROP", styles['header']),
        Paragraph("Deficit", styles['header']),
        Paragraph("Order Qty", styles['header']),
        Paragraph("Est. Cost", styles['header']),
        Paragraph("Supplier", styles['header']),
    ]]

    for it in items:
        table_data.append([
            Paragraph(it.get("name", "Product"), styles['cell_bold']),
            Paragraph(it.get("sku", "N/A"), styles['cell']),
            Paragraph(f"{it.get('current_stock', 0):,.0f} {it.get('unit', '')}", styles['cell_bold']),
            Paragraph(f"{it.get('reorder_level', 0):,.0f}", styles['cell']),
            Paragraph(f"{it.get('deficit', 0):,.0f}", ParagraphStyle('Def', parent=styles['cell_bold'], textColor=ALERT_RED)),
            Paragraph(f"{it.get('suggested_order_qty', 0):,.0f}", styles['cell_bold']),
            Paragraph(f"₹{it.get('estimated_cost', 0):,.0f}", styles['cell']),
            Paragraph(it.get("supplier", "Supplier"), styles['cell']),
        ])

    table = Table(table_data, colWidths=[120, 55, 55, 40, 45, 50, 60, 90])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_GREEN),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(table)

    return build_pdf_document("Low Stock Alert Report", store_name, elements)

def generate_reorder_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generates Smart Reorder & Procurement Package PDF Report."""
    styles = get_report_styles()
    elements = []

    store_name = data.get("store_name", "StockSense Supermarket")
    reorders = data.get("reorders", {})
    packages = reorders.get("packages", [])

    elements.append(Paragraph("StockSense AI — Smart Reorder & Procurement Report", styles['title']))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph(f"<b>Store:</b> {store_name} &nbsp;|&nbsp; <b>Generated:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')} &nbsp;|&nbsp; <b>Model:</b> Supplier Consolidated Purchase Orders", styles['subtitle']))
    elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_GREEN, spaceBefore=2, spaceAfter=10))

    # Overall Summary
    kpi_data = [
        [
            Paragraph(f"{reorders.get('total_suppliers', len(packages))}", styles['kpi_num']),
            Paragraph(f"₹{reorders.get('total_estimated_cost', 0):,.0f}", styles['kpi_num']),
            Paragraph(f"Net 15 / COD", styles['kpi_num']),
        ],
        [
            Paragraph("SUPPLIERS TO DISPATCH", styles['kpi_label']),
            Paragraph("TOTAL ESTIMATED PROCUREMENT COST", styles['kpi_label']),
            Paragraph("PAYMENT TERMS", styles['kpi_label']),
        ],
    ]
    kpi_table = Table(kpi_data, colWidths=[170, 170, 175])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 15))

    # Supplier Packages
    for pkg in packages:
        elements.append(Paragraph(f"📦 Supplier Package: {pkg.get('supplier_name')} (Lead Time: ~{pkg.get('lead_time_days', 3)} Days | Total: ₹{pkg.get('total_cost', 0):,.0f})", styles['h2']))
        
        pkg_table_data = [[
            Paragraph("Item Name", styles['header']),
            Paragraph("SKU", styles['header']),
            Paragraph("Current Stock", styles['header']),
            Paragraph("Target Stock", styles['header']),
            Paragraph("Recommended Order", styles['header']),
            Paragraph("Purchase Cost (₹)", styles['header']),
        ]]

        for it in pkg.get("items", []):
            pkg_table_data.append([
                Paragraph(it.get("name", "Product"), styles['cell_bold']),
                Paragraph(it.get("sku", "N/A"), styles['cell']),
                Paragraph(f"{it.get('current_stock', 0):,.0f} {it.get('unit', '')}", styles['cell']),
                Paragraph(f"{it.get('target_stock', 0):,.0f}", styles['cell']),
                Paragraph(f"<b>{it.get('recommended_order_qty', 0):,.0f}</b> {it.get('unit', '')}", styles['cell_bold']),
                Paragraph(f"₹{it.get('estimated_cost', 0):,.0f}", styles['cell_bold']),
            ])

        t = Table(pkg_table_data, colWidths=[155, 65, 75, 65, 85, 70])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_GREEN),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY_BG]),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

    return build_pdf_document("Smart Reorder Report", store_name, elements)

def generate_sales_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generates POS Counter Sales & Revenue Analytics PDF Report."""
    styles = get_report_styles()
    elements = []

    store_name = data.get("store_name", "StockSense Supermarket")
    sales_summary = data.get("sales_summary", {})
    transactions = data.get("transactions", [])
    period = data.get("period", "Today")

    elements.append(Paragraph("StockSense AI — Sales & Revenue Performance Report", styles['title']))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph(f"<b>Store:</b> {store_name} &nbsp;|&nbsp; <b>Report Period:</b> {period} &nbsp;|&nbsp; <b>Generated:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')}", styles['subtitle']))
    elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_GREEN, spaceBefore=2, spaceAfter=10))

    # KPI Banner
    total_sales = sales_summary.get('total_sales', 0)
    total_bills = sales_summary.get('total_bills', len(transactions))
    avg_bill = sales_summary.get('average_bill_value', total_sales / max(total_bills, 1))

    kpi_data = [
        [
            Paragraph(f"₹{total_sales:,.0f}", styles['kpi_num']),
            Paragraph(f"{total_bills}", styles['kpi_num']),
            Paragraph(f"₹{avg_bill:,.0f}", styles['kpi_num']),
            Paragraph(f"₹{sales_summary.get('total_discount', 0):,.0f}", styles['kpi_num']),
        ],
        [
            Paragraph("TOTAL GROSS REVENUE", styles['kpi_label']),
            Paragraph("COMPLETED TRANSACTIONS", styles['kpi_label']),
            Paragraph("AVERAGE BILL VALUE", styles['kpi_label']),
            Paragraph("TOTAL DISCOUNTS GIVEN", styles['kpi_label']),
        ],
    ]
    kpi_table = Table(kpi_data, colWidths=[125, 125, 125, 140])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 15))

    # Transactions List Table
    elements.append(Paragraph(f"Completed Sales Transactions ({len(transactions)} Records)", styles['h2']))
    table_data = [[
        Paragraph("Bill No", styles['header']),
        Paragraph("Customer", styles['header']),
        Paragraph("Payment", styles['header']),
        Paragraph("Date & Time", styles['header']),
        Paragraph("Discount (₹)", styles['header']),
        Paragraph("Net Total (₹)", styles['header']),
    ]]

    for txn in transactions[:100]:
        table_data.append([
            Paragraph(txn.get("transactionNumber", "N/A"), styles['cell_bold']),
            Paragraph(txn.get("customer", {}).get("name") if isinstance(txn.get("customer"), dict) else (txn.get("customer") or "Walk-in"), styles['cell']),
            Paragraph(txn.get("paymentMethod", "CASH"), styles['cell']),
            Paragraph(str(txn.get("transactionDate", ""))[:16], styles['cell']),
            Paragraph(f"₹{float(txn.get('discount', 0)):,.2f}", styles['cell']),
            Paragraph(f"₹{float(txn.get('totalAmount', 0)):,.2f}", styles['cell_bold']),
        ])

    t = Table(table_data, colWidths=[110, 110, 75, 105, 65, 85])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_GREEN),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY_BG]),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)

    return build_pdf_document("Sales Report", store_name, elements)
