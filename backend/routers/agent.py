from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Mandate, Product, generate_id
from schemas import AgentExecuteRequest, AgentExecuteResponse, ProductOut
from services.gemini_service import search_products_with_gemini

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])


@router.post("/execute", response_model=AgentExecuteResponse)
async def execute_agent(body: AgentExecuteRequest, db: Session = Depends(get_db)):
    mandate_instruction = ""
    if body.mandate_id:
        mandate = db.query(Mandate).filter(Mandate.id == body.mandate_id).first()
        if mandate:
            mandate_instruction = mandate.instruction

    result = await search_products_with_gemini(body.query, mandate_instruction)

    product_outs = []
    for p in result.get("products", []):
        db_product = Product(
            id=p.get("id") or generate_id("prd"),
            title=p["title"],
            price=p["price"],
            currency=p.get("currency", "USD"),
            category=p["category"],
            merchant=p["merchant"],
            rating=p.get("rating", 4.0),
            reviews_count=p.get("reviews_count", 0),
            image_url=p.get("image_url", ""),
            explanation=p.get("explanation", ""),
            specs=p.get("specs", []),
            in_stock=1 if p.get("in_stock", True) else 0,
        )
        existing = db.query(Product).filter(Product.id == db_product.id).first()
        if existing:
            for attr in ("title", "price", "currency", "category", "merchant",
                         "rating", "reviews_count", "image_url", "explanation", "specs", "in_stock"):
                setattr(existing, attr, getattr(db_product, attr))
        else:
            db.add(db_product)

        product_outs.append(
            ProductOut(
                id=db_product.id,
                title=db_product.title,
                price=db_product.price,
                currency=db_product.currency,
                category=db_product.category,
                merchant=db_product.merchant,
                rating=db_product.rating,
                reviews_count=db_product.reviews_count,
                image_url=db_product.image_url,
                explanation=db_product.explanation,
                specs=db_product.specs or [],
                in_stock=bool(db_product.in_stock),
            )
        )

    db.commit()

    return AgentExecuteResponse(
        products=product_outs,
        analysis=result.get("analysis", ""),
    )
