from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., gt=0.0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0.0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    phone_number: Optional[str] = None
    role: str = "staff"

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1)
    email: Optional[str] = Field(None, min_length=1)
    phone_number: Optional[str] = None
    role: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    is_totp_enabled: bool

    class Config:
        from_attributes = True

# --- Order Item Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_items=1)

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]
    customer_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Authentication Schemas ---
class RegisterRequest(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: Optional[str] = "staff" # "admin" or "staff"

class RegisterResponse(BaseModel):
    email: str
    secret: str
    provisioning_uri: str
    is_totp_enabled: bool

class LoginRequest(BaseModel):
    email: str
    code: str = Field(..., min_length=6, max_length=6)

class TokenUser(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: TokenUser

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
