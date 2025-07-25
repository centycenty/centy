from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import qrcode
import io
import base64
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: str
    category: str
    cooking_time: int  # in minutes
    difficulty: str  # Easy, Medium, Hard
    rating: float
    ingredients: List[str]
    instructions: List[str]
    is_available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str
    cooking_time: int
    difficulty: str
    rating: float
    ingredients: List[str]
    instructions: List[str]

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    color: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    icon: str
    color: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class QRCodeRequest(BaseModel):
    data: str
    size: int = 10
    border: int = 4

# QR Code Generation Function
def generate_qr_code(data: str, size: int = 10, border: int = 4) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

# Routes
@api_router.get("/")
async def root():
    return {"message": "Food Ordering App API"}

# QR Code Routes
@api_router.post("/generate-qr")
async def generate_qr(request: QRCodeRequest):
    try:
        qr_code_data = generate_qr_code(request.data, request.size, request.border)
        return {"qr_code": qr_code_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/qr/app")
async def get_app_qr():
    app_url = "https://2c0402ac-7110-4373-ba1b-7f653470b578.preview.emergentagent.com"
    qr_code_data = generate_qr_code(app_url)
    return {"qr_code": qr_code_data, "url": app_url}

@api_router.get("/qr/menu-item/{item_id}")
async def get_menu_item_qr(item_id: str):
    # Check if item exists
    item = await db.menu_items.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    item_url = f"https://2c0402ac-7110-4373-ba1b-7f653470b578.preview.emergentagent.com/item/{item_id}"
    qr_code_data = generate_qr_code(item_url)
    return {"qr_code": qr_code_data, "url": item_url, "item_name": item["name"]}

@api_router.get("/qr/table/{table_number}")
async def get_table_qr(table_number: str):
    table_url = f"https://2c0402ac-7110-4373-ba1b-7f653470b578.preview.emergentagent.com/table/{table_number}"
    qr_code_data = generate_qr_code(table_url)
    return {"qr_code": qr_code_data, "url": table_url, "table_number": table_number}

# Category Routes
@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate):
    category_dict = category.dict()
    category_obj = Category(**category_dict)
    await db.categories.insert_one(category_obj.dict())
    return category_obj

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find().to_list(1000)
    return [Category(**category) for category in categories]

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# Menu Item Routes
@api_router.post("/menu-items", response_model=MenuItem)
async def create_menu_item(item: MenuItemCreate):
    item_dict = item.dict()
    menu_item = MenuItem(**item_dict)
    await db.menu_items.insert_one(menu_item.dict())
    return menu_item

@api_router.get("/menu-items", response_model=List[MenuItem])
async def get_menu_items(category: Optional[str] = None):
    if category:
        items = await db.menu_items.find({"category": category, "is_available": True}).to_list(1000)
    else:
        items = await db.menu_items.find({"is_available": True}).to_list(1000)
    return [MenuItem(**item) for item in items]

@api_router.get("/menu-items/{item_id}", response_model=MenuItem)
async def get_menu_item(item_id: str):
    item = await db.menu_items.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return MenuItem(**item)

@api_router.put("/menu-items/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item: MenuItemCreate):
    item_dict = item.dict()
    result = await db.menu_items.update_one(
        {"id": item_id},
        {"$set": item_dict}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    updated_item = await db.menu_items.find_one({"id": item_id})
    return MenuItem(**updated_item)

@api_router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}

# User Routes
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user.dict()
    user_dict.pop("password")  # Remove password for now (implement proper auth later)
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

# Initialize default data
@api_router.post("/initialize-data")
async def initialize_data():
    # Check if data already exists
    existing_categories = await db.categories.find().to_list(1)
    if existing_categories:
        return {"message": "Data already initialized"}
    
    # Create default categories
    categories = [
        {"name": "Dinner", "icon": "🍽️", "color": "#FF6B6B"},
        {"name": "Supper", "icon": "🌙", "color": "#4ECDC4"},
        {"name": "Snack", "icon": "🍿", "color": "#45B7D1"},
        {"name": "Breakfast", "icon": "🌅", "color": "#FFA726"},
        {"name": "Dessert", "icon": "🍰", "color": "#AB47BC"}
    ]
    
    for cat_data in categories:
        category = Category(**cat_data)
        await db.categories.insert_one(category.dict())
    
    # Create default menu items with real food images
    menu_items = [
        {
            "name": "Garlic Shrimp Bowl",
            "description": "Fresh shrimp with garlic, vegetables, and rice in a flavorful bowl",
            "price": 18.99,
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGlzaGVzfGVufDB8fHx8MTc1MzQ4MTY0MHww&ixlib=rb-4.1.0&q=85",
            "category": "Dinner",
            "cooking_time": 25,
            "difficulty": "Medium",
            "rating": 4.8,
            "ingredients": ["Shrimp", "Garlic", "Rice", "Mixed Vegetables", "Soy Sauce", "Sesame Oil"],
            "instructions": ["Heat oil in pan", "Cook shrimp with garlic", "Add vegetables", "Serve over rice"]
        },
        {
            "name": "Blueberry Pancakes",
            "description": "Fluffy pancakes topped with fresh blueberries and maple syrup",
            "price": 12.99,
            "image_url": "https://images.unsplash.com/photo-1715493926880-a15b1fee7b30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxmb29kJTIwZGlzaGVzfGVufDB8fHx8MTc1MzQ4MTY0MHww&ixlib=rb-4.1.0&q=85",
            "category": "Breakfast",
            "cooking_time": 15,
            "difficulty": "Easy",
            "rating": 4.9,
            "ingredients": ["Flour", "Eggs", "Milk", "Fresh Blueberries", "Maple Syrup", "Butter"],
            "instructions": ["Mix batter", "Cook pancakes", "Add blueberries", "Serve with syrup"]
        },
        {
            "name": "Mediterranean Salad",
            "description": "Fresh Mediterranean salad with olives, feta cheese, and vegetables",
            "price": 14.99,
            "image_url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxmb29kJTIwZGlzaGVzfGVufDB8fHx8MTc1MzQ4MTY0MHww&ixlib=rb-4.1.0&q=85",
            "category": "Dinner",
            "cooking_time": 10,
            "difficulty": "Easy",
            "rating": 4.6,
            "ingredients": ["Mixed Greens", "Olives", "Feta Cheese", "Cherry Tomatoes", "Cucumber", "Olive Oil"],
            "instructions": ["Wash vegetables", "Combine ingredients", "Add dressing", "Serve fresh"]
        },
        {
            "name": "Veggie Rice Bowl",
            "description": "Healthy vegetarian bowl with rice, fresh vegetables, and tofu",
            "price": 16.99,
            "image_url": "https://images.unsplash.com/photo-1519996409144-56c88c9aa612?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHxmb29kJTIwZGlzaGVzfGVufDB8fHx8MTc1MzQ4MTY0MHww&ixlib=rb-4.1.0&q=85",
            "category": "Dinner",
            "cooking_time": 20,
            "difficulty": "Medium",
            "rating": 4.7,
            "ingredients": ["Brown Rice", "Tofu", "Broccoli", "Carrots", "Spinach", "Sesame Seeds"],
            "instructions": ["Cook rice", "Sauté vegetables", "Season tofu", "Combine and serve"]
        },
        {
            "name": "Gourmet Burger",
            "description": "Premium beef burger with cheese, lettuce, tomato, and special sauce",
            "price": 19.99,
            "image_url": "https://images.unsplash.com/photo-1600555379885-08a02224726d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWVhbHN8ZW58MHx8fHwxNzUzNDgxNjQ3fDA&ixlib=rb-4.1.0&q=85",
            "category": "Dinner",
            "cooking_time": 30,
            "difficulty": "Medium",
            "rating": 4.8,
            "ingredients": ["Beef Patty", "Cheese", "Lettuce", "Tomato", "Bun", "Special Sauce"],
            "instructions": ["Grill patty", "Toast bun", "Assemble burger", "Serve with fries"]
        },
        {
            "name": "Seafood Platter",
            "description": "Fresh seafood selection with lobster, shrimp, and seasonal fish",
            "price": 32.99,
            "image_url": "https://images.unsplash.com/photo-1737141500169-4208e3296b28?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxyZXN0YXVyYW50JTIwbWVhbHN8ZW58MHx8fHwxNzUzNDgxNjQ3fDA&ixlib=rb-4.1.0&q=85",
            "category": "Dinner",
            "cooking_time": 45,
            "difficulty": "Hard",
            "rating": 4.9,
            "ingredients": ["Lobster", "Shrimp", "Fresh Fish", "Lemon", "Herbs", "Garlic Butter"],
            "instructions": ["Prepare seafood", "Cook separately", "Plate elegantly", "Serve with lemon"]
        }
    ]
    
    for item_data in menu_items:
        menu_item = MenuItem(**item_data)
        await db.menu_items.insert_one(menu_item.dict())
    
    return {"message": "Data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()