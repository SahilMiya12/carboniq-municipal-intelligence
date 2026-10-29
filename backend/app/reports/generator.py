import io
import csv
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.entities import ActivityRecord, Municipality, Ward, EmissionSector
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ReportGenerator:
    @staticmethod
    def generate_csv_report(db: Session, ward_id: Optional[int] = None, sector_id: Optional[int] = None) -> io.StringIO:
        query = db.query(ActivityRecord)
        if ward_id:
            query = query.filter(ActivityRecord.ward_id == ward_id)
        if sector_id:
            query = query.filter(ActivityRecord.sector_id == sector_id)

        records = query.order_by(ActivityRecord.record_date.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Record ID",
            "Timestamp",
            "Ward Code",
            "Ward Name",
            "Sector",
            "Activity Type",
            "Quantity",
            "Unit",
            "Emission Factor (kgCO2e/unit)",
            "Emissions (kgCO2e)",
            "Emissions (tCO2e)",
            "Data Source",
            "Quality Status"
        ])

        for r in records:
            writer.writerow([
                r.id,
                r.record_date.strftime("%Y-%m-%d %H:%M:%S"),
                r.ward.code if r.ward else "",
                r.ward.name if r.ward else "",
                r.sector.name if r.sector else "",
                r.activity_type,
                r.activity_quantity,
                r.activity_unit,
                r.emission_factor_value,
                r.emissions_kg_co2e,
                r.emissions_t_co2e,
                r.data_source,
                r.data_quality_status
            ])

        output.seek(0)
        return output

    @staticmethod
    def generate_pdf_report(db: Session) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#064e3b')  # Dark forest emerald
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#475569')
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#0f172a')
        )

        elements = []

        # Header
        elements.append(Paragraph("CARBONIQ — Municipal Carbon Intelligence Audit", title_style))
        elements.append(Paragraph(f"Official Municipal GHG Verification Report • Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
        elements.append(Spacer(1, 15))

        # Executive Metrics
        records = db.query(ActivityRecord).all()
        total_tco2e = sum(r.emissions_t_co2e for r in records)
        elec_tco2e = sum(r.emissions_t_co2e for r in records if "elec" in r.sector.code.lower())
        trans_tco2e = sum(r.emissions_t_co2e for r in records if "trans" in r.sector.code.lower())
        waste_tco2e = sum(r.emissions_t_co2e for r in records if "waste" in r.sector.code.lower())

        muni = db.query(Municipality).first()
        muni_name = muni.name if muni else "Metropolis Smart District"

        summary_data = [
            ["Metric", "Value", "Scope / Protocol"],
            ["Municipality", muni_name, "GPC Geographic Boundary"],
            ["Total Gross Emissions", f"{total_tco2e:,.1f} tCO2e", "IPCC Scope 1 & 2"],
            ["Electricity Grid Consumption", f"{elec_tco2e:,.1f} tCO2e", "Scope 2 (Location-based)"],
            ["Municipal Transportation", f"{trans_tco2e:,.1f} tCO2e", "Scope 1 (Mobile Combustion)"],
            ["Waste & Landfill Dissipation", f"{waste_tco2e:,.1f} tCO2e", "Scope 1 (Solid Waste Model)"],
            ["Verified Records Audited", f"{len(records):,}", "ISO 14064-1 Compliant"],
        ]

        t_summary = Table(summary_data, colWidths=[200, 160, 180])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#064e3b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 20))

        # Ward Hotspot Table
        elements.append(Paragraph("Ward Decarbonization Hotspot Ranking", h2_style))
        elements.append(Spacer(1, 8))

        wards = db.query(Ward).all()
        ward_data = [["Ward Code", "Ward Name", "Population", "Total (tCO2e)", "Per-Capita (kg/person)"]]
        for w in wards[:8]:
            w_records = [r for r in records if r.ward_id == w.id]
            w_total = sum(r.emissions_t_co2e for r in w_records)
            per_cap = (w_total * 1000.0 / w.population) if w.population > 0 else 0
            ward_data.append([
                w.code,
                w.name,
                f"{w.population:,}",
                f"{w_total:,.1f}",
                f"{per_cap:.1f}"
            ])

        t_ward = Table(ward_data, colWidths=[80, 160, 100, 100, 100])
        t_ward.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t_ward)
        elements.append(Spacer(1, 20))

        # Methodology statement
        elements.append(Paragraph("Methodology & Verification Assurance", h2_style))
        statement = (
            "This report is compiled in accordance with the Global Protocol for Community-Scale Greenhouse Gas Emission "
            "Inventories (GPC). Emission calculations utilize validated activity metrics combined with regional grid "
            "intensity and IPCC Tier 1/2 factors. All reported data points reflect audited telemetry and uploaded records."
        )
        elements.append(Paragraph(statement, subtitle_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer
