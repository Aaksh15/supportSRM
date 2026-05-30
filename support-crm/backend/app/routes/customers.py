from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("", response_model=list[schemas.CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return crud.list_customers(db)


@router.get("/{email}", response_model=schemas.CustomerDetailOut)
def get_customer(email: str, db: Session = Depends(get_db)):
    return crud.get_customer_detail(db, email)
