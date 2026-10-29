from fastapi import APIRouter, Depends, Query, Response
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.reports.generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports & Audits"])

@router.get("/csv")
def download_csv_report(
    ward_id: Optional[int] = Query(None),
    sector_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    csv_stream = ReportGenerator.generate_csv_report(db=db, ward_id=ward_id, sector_id=sector_id)
    return Response(
        content=csv_stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=carboniq_municipal_emissions_report.csv"}
    )

@router.get("/pdf")
def download_pdf_report(db: Session = Depends(get_db)):
    pdf_stream = ReportGenerator.generate_pdf_report(db=db)
    return Response(
        content=pdf_stream.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=carboniq_municipal_carbon_audit.pdf"}
    )
