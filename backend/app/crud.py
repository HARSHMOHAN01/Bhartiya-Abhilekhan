from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from app import models, schemas

# --- Product CRUD ---
def get_products(db: Session, search: str = None, status_filter: str = None):
    query = db.query(models.Product)
    if search:
        query = query.filter(
            or_(
                models.Product.name.ilike(f"%{search}%"),
                models.Product.sku.ilike(f"%{search}%")
            )
        )
    if status_filter:
        if status_filter == "LowStock":
            query = query.filter(models.Product.quantity < 10)
        elif status_filter == "InStock":
            query = query.filter(models.Product.quantity >= 10)
        elif status_filter == "OutOfStock":
            query = query.filter(models.Product.quantity == 0)
    return query.order_by(models.Product.id.asc()).all()

def get_product_by_id(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        name=product.name,
        sku=product.sku.upper(),
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "sku":
            value = value.upper()
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product

# --- Customer CRUD ---
def get_customers(db: Session, search: str = None):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            or_(
                models.Customer.full_name.ilike(f"%{search}%"),
                models.Customer.email.ilike(f"%{search}%")
            )
        )
    return query.order_by(models.Customer.id.asc()).all()

def get_customer_by_id(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email.ilike(email)).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(
        full_name=customer.full_name,
        email=customer.email.lower(),
        phone_number=customer.phone_number,
        role=customer.role
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer_update: schemas.CustomerUpdate):
    db_customer = get_customer_by_id(db, customer_id)
    if not db_customer:
        return None
    
    update_data = customer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "email":
            value = value.lower()
        setattr(db_customer, key, value)
        
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer_by_id(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer

# --- Order Transaction Flow ---
def get_orders(db: Session):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

def get_order_by_id(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def create_order(db: Session, order_in: schemas.OrderCreate):
    """
    Creates an Order in a single, atomic, thread-safe database transaction.
    Locks involved products to avoid race conditions.
    Deducts stock entirely in-database and computes totals.
    """
    try:
        # Verify customer existence
        customer = db.query(models.Customer).filter(models.Customer.id == order_in.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {order_in.customer_id} does not exist"
            )

        # Get list of unique product IDs
        product_ids = list(set([item.product_id for item in order_in.items]))
        
        # Load and lock the products for update to prevent concurrent stock depletion
        products = (
            db.query(models.Product)
            .filter(models.Product.id.in_(product_ids))
            .with_for_update()
            .all()
        )
        
        product_map = {p.id: p for p in products}
        
        # Perform inventory availability check
        for item in order_in.items:
            product = product_map.get(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found"
                )
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient Inventory. Requested {item.quantity} of '{product.name}' (SKU: {product.sku}), but only {product.quantity} is available."
                )

        # Build order objects and calculate totals
        total_amount = 0.0
        order_items = []
        for item in order_in.items:
            product = product_map[item.product_id]
            
            # Deduct inventory (CheckConstraint on DB will physically verify quantity >= 0)
            product.quantity -= item.quantity
            
            unit_price = product.price
            subtotal = unit_price * item.quantity
            total_amount += subtotal
            
            order_item = models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price
            )
            order_items.append(order_item)

        # Create Order
        db_order = models.Order(
            customer_id=order_in.customer_id,
            total_amount=total_amount,
            items=order_items
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction rolled back due to error: {str(e)}"
        )
