# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, Base, get_db
from app import models, schemas, crud, auth

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bhartiya Abhilekhan API",
    description="Enterprise Inventory & Order Management System API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/healthz", tags=["Health"])
def health_check():
    return {"status": "operational", "service": "Bhartiya Abhilekhan API"}

# Startup event to seed database
@app.on_event("startup")
def seed_database():
    db = next(get_db())
    try:
        # Seed Products if empty
        if db.query(models.Product).count() == 0:
            products_to_seed = [
                models.Product(name="Neural Core Processor X1", sku="CPU-NC-9921", price=1249.00, quantity=432),
                models.Product(name="Industrial Flux Valve", sku="VLV-IND-403", price=89.60, quantity=12),
                models.Product(name="Quantum Battery Cell", sku="BAT-QB-2200", price=640.00, quantity=1120),
                models.Product(name="High-Flex Fiber Optic 10m", sku="CBL-FO-10M", price=24.99, quantity=85),
                models.Product(name="Industrial Sensor X-12", sku="SN-882-901-X", price=125.00, quantity=12),
                models.Product(name="Core Fiber Optic Hub", sku="NET-FIB-001", price=420.00, quantity=4),
                models.Product(name="Pro-Storage 10TB Rack", sku="STO-10TB-PRO", price=1500.00, quantity=18),
                models.Product(name="AI Processing Unit G2", sku="AI-GPU-GEN2", price=2499.99, quantity=2)
            ]
            db.add_all(products_to_seed)
            db.commit()
            print("Database Seeded: Products added successfully.")

        # Seed Customers/Users if empty
        if db.query(models.Customer).count() == 0:
            # We seed a static TOTP secret for easy setup (secret: JBSWY3DPEHPK3PXP -> Google Authenticator code generator)
            admin_customer = models.Customer(
                full_name="Alex Rivera",
                email="admin@bhartiya.com",
                phone_number="+1 (555) 123-4567",
                totp_secret="JBSWY3DPEHPK3PXP",  # Manual Setup key: JBSW Y3DP EHPK 3PXP
                is_totp_enabled=True,
                role="admin"
            )
            
            staff_customer = models.Customer(
                full_name="Jane Doe",
                email="staff@bhartiya.com",
                phone_number="+1 (555) 987-6543",
                totp_secret="JBSWY3DPEHPK3PXQ",  # Manual Setup key: JBSW Y3DP EHPK 3PXQ
                is_totp_enabled=True,
                role="staff"
            )

            client_1 = models.Customer(
                full_name="Global Logistics Inc.",
                email="procurement@globallogistics.co",
                phone_number="+1 (555) 012-4455",
                totp_secret=None,
                is_totp_enabled=False,
                role="staff"
            )

            client_2 = models.Customer(
                full_name="Acme Solutions",
                email="billing@acme.corp",
                phone_number="+1 (555) 789-0122",
                totp_secret=None,
                is_totp_enabled=False,
                role="staff"
            )

            db.add_all([admin_customer, staff_customer, client_1, client_2])
            db.commit()
            print("Database Seeded: Default Admin, Staff, and Client profiles created.")
            
    except Exception as e:
        print(f"Error during database seeding: {str(e)}")
    finally:
        db.close()

# --- AUTH ROUTER ---
@app.post("/auth/register", response_model=schemas.RegisterResponse, tags=["Authentication"])
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers or prepares TOTP passwordless credentials for an email address.
    If the customer profile does not exist, it creates one.
    Generates and returns the Google Authenticator TOTP Setup key & provisioning URI.
    """
    customer = crud.get_customer_by_email(db, payload.email)
    
    if not customer:
        # Auto-create profile if email not pre-populated
        full_name = payload.full_name or payload.email.split("@")[0].title()
        customer_in = schemas.CustomerCreate(
            full_name=full_name,
            email=payload.email,
            phone_number=None,
            role=payload.role or "staff"
        )
        customer = crud.create_customer(db, customer_in)
    else:
        # Update existing profile's name dynamically if provided in registration
        if payload.full_name:
            customer.full_name = payload.full_name
            db.commit()
            db.refresh(customer)

    # Generate TOTP secret if not present
    if not customer.totp_secret:
        customer.totp_secret = auth.generate_totp_secret()
        db.commit()
        db.refresh(customer)

    provisioning_uri = auth.get_provisioning_uri(customer.email, customer.totp_secret)
    
    return {
        "email": customer.email,
        "secret": customer.totp_secret,
        "provisioning_uri": provisioning_uri,
        "is_totp_enabled": customer.is_totp_enabled
    }

@app.post("/auth/login", response_model=schemas.LoginResponse, tags=["Authentication"])
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Validates the 6-digit TOTP code for the given email address.
    Enables TOTP on successfully verifying for the first time.
    Returns a signed JWT session token.
    """
    customer = crud.get_customer_by_email(db, payload.email)
    if not customer or not customer.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account credentials not configured. Please complete authentication setup first."
        )

    # Verify code
    is_valid = auth.verify_totp_code(customer.totp_secret, payload.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification failed. Invalid or expired authentication code."
        )

    # Automatically activate TOTP if first time logging in
    if not customer.is_totp_enabled:
        customer.is_totp_enabled = True
        db.commit()

    # Create Session JWT token
    token_data = {
        "sub": customer.email,
        "role": customer.role,
        "name": customer.full_name
    }
    access_token = auth.create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": customer.id,
            "email": customer.email,
            "full_name": customer.full_name,
            "role": customer.role
        }
    }

# --- PRODUCTS ROUTER ---
@app.get("/products", response_model=List[schemas.ProductResponse], tags=["Products"])
def read_products(
    search: str = None, 
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_user)
):
    return crud.get_products(db, search, status_filter)

@app.get("/products/{product_id}", response_model=schemas.ProductResponse, tags=["Products"])
def read_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_user)
):
    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.post("/products", response_model=schemas.ProductResponse, status_code=201, tags=["Products"])
def create_new_product(
    payload: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_admin)
):
    existing = crud.get_product_by_sku(db, payload.sku)
    if existing:
        raise HTTPException(status_code=400, detail="A product with this SKU already exists")
    return crud.create_product(db, payload)

@app.put("/products/{product_id}", response_model=schemas.ProductResponse, tags=["Products"])
def modify_product(
    product_id: int, 
    payload: schemas.ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_admin)
):
    db_product = crud.update_product(db, product_id, payload)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.delete("/products/{product_id}", status_code=200, tags=["Products"])
def remove_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_admin)
):
    db_product = crud.delete_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# --- CUSTOMERS ROUTER ---
@app.get("/customers", response_model=List[schemas.CustomerResponse], tags=["Customers"])
def read_customers(
    search: str = None, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_user)
):
    return crud.get_customers(db, search)

@app.get("/customers/{customer_id}", response_model=schemas.CustomerResponse, tags=["Customers"])
def read_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_user)
):
    db_customer = crud.get_customer_by_id(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.post("/customers", response_model=schemas.CustomerResponse, status_code=201, tags=["Customers"])
def create_new_customer(
    payload: schemas.CustomerCreate, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_admin)
):
    existing = crud.get_customer_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="A customer with this email already exists")
    return crud.create_customer(db, payload)

@app.put("/customers/{customer_id}", response_model=schemas.CustomerResponse, tags=["Customers"])
def modify_customer(
    customer_id: int, 
    payload: schemas.CustomerUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_admin)
):
    db_customer = crud.update_customer(db, customer_id, payload)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.delete("/customers/{customer_id}", status_code=200, tags=["Customers"])
def remove_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_admin)
):
    db_customer = crud.delete_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer profile removed successfully"}

# --- ORDERS ROUTER ---
@app.get("/orders", response_model=List[schemas.OrderResponse], tags=["Orders"])
def read_orders(
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_user)
):
    orders = crud.get_orders(db)
    
    # Populate extra names to make rendering easier
    for order in orders:
        order.customer_name = order.customer.full_name
        for item in order.items:
            item.product_name = item.product.name
            
    return orders

@app.post("/orders", response_model=schemas.OrderResponse, status_code=201, tags=["Orders"])
def create_new_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(auth.get_current_user)
):
    order = crud.create_order(db, payload)
    # Populate extra helper fields
    order.customer_name = order.customer.full_name
    for item in order.items:
        item.product_name = item.product.name
    return order
