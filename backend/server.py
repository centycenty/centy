from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime
import json
import asyncio

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

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        self.active_connections.remove(websocket)
        if room_id in self.rooms:
            self.rooms[room_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.rooms:
            for connection in self.rooms[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass

manager = ConnectionManager()

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    role: str  # 'participant', 'moderator', 'viewer'
    avatar_url: Optional[str] = None
    is_streaming: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Competition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    status: str = "waiting"  # waiting, active, ended
    max_participants: int = 6
    participants: List[str] = []
    moderator_id: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Vote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    competition_id: str
    participant_id: str
    voter_id: str
    rating: int  # 1-5 stars
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    competition_id: str
    user_id: str
    username: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Create requests
class UserCreate(BaseModel):
    username: str
    role: str
    avatar_url: Optional[str] = None

class CompetitionCreate(BaseModel):
    title: str
    description: str
    moderator_id: str

class VoteCreate(BaseModel):
    competition_id: str
    participant_id: str
    rating: int

class MessageCreate(BaseModel):
    competition_id: str
    user_id: str
    username: str
    message: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "TikTok Live Stream Competition API"}

# User management
@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    user = User(**input.dict())
    await db.users.insert_one(user.dict())
    return user

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# Competition management
@api_router.post("/competitions", response_model=Competition)
async def create_competition(input: CompetitionCreate):
    competition = Competition(**input.dict())
    await db.competitions.insert_one(competition.dict())
    return competition

@api_router.get("/competitions", response_model=List[Competition])
async def get_competitions():
    competitions = await db.competitions.find().to_list(1000)
    return [Competition(**comp) for comp in competitions]

@api_router.get("/competitions/{competition_id}", response_model=Competition)
async def get_competition(competition_id: str):
    comp = await db.competitions.find_one({"id": competition_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    return Competition(**comp)

@api_router.post("/competitions/{competition_id}/join")
async def join_competition(competition_id: str, user_id: str):
    comp = await db.competitions.find_one({"id": competition_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    competition = Competition(**comp)
    if len(competition.participants) >= competition.max_participants:
        raise HTTPException(status_code=400, detail="Competition is full")
    
    if user_id not in competition.participants:
        competition.participants.append(user_id)
        await db.competitions.replace_one({"id": competition_id}, competition.dict())
    
    return {"message": "Successfully joined competition"}

@api_router.post("/competitions/{competition_id}/start")
async def start_competition(competition_id: str):
    comp = await db.competitions.find_one({"id": competition_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    competition = Competition(**comp)
    competition.status = "active"
    competition.start_time = datetime.utcnow()
    await db.competitions.replace_one({"id": competition_id}, competition.dict())
    
    # Broadcast to room
    await manager.broadcast_to_room(
        json.dumps({"type": "competition_started", "competition_id": competition_id}),
        competition_id
    )
    
    return {"message": "Competition started"}

@api_router.post("/competitions/{competition_id}/end")
async def end_competition(competition_id: str):
    comp = await db.competitions.find_one({"id": competition_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    competition = Competition(**comp)
    competition.status = "ended"
    competition.end_time = datetime.utcnow()
    await db.competitions.replace_one({"id": competition_id}, competition.dict())
    
    # Broadcast to room
    await manager.broadcast_to_room(
        json.dumps({"type": "competition_ended", "competition_id": competition_id}),
        competition_id
    )
    
    return {"message": "Competition ended"}

# Voting system
@api_router.post("/votes", response_model=Vote)
async def cast_vote(input: VoteCreate):
    # Check if user already voted for this participant
    existing_vote = await db.votes.find_one({
        "competition_id": input.competition_id,
        "participant_id": input.participant_id,
        "voter_id": input.dict().get("voter_id")  # We'll need to add voter_id to the model
    })
    
    vote = Vote(**input.dict())
    await db.votes.insert_one(vote.dict())
    
    # Broadcast vote update
    await manager.broadcast_to_room(
        json.dumps({"type": "new_vote", "vote": vote.dict()}),
        input.competition_id
    )
    
    return vote

@api_router.get("/competitions/{competition_id}/results")
async def get_competition_results(competition_id: str):
    votes = await db.votes.find({"competition_id": competition_id}).to_list(1000)
    
    # Calculate average ratings for each participant
    results = {}
    for vote_data in votes:
        vote = Vote(**vote_data)
        if vote.participant_id not in results:
            results[vote.participant_id] = {"total": 0, "count": 0}
        results[vote.participant_id]["total"] += vote.rating
        results[vote.participant_id]["count"] += 1
    
    # Calculate averages and sort
    final_results = []
    for participant_id, data in results.items():
        avg_rating = data["total"] / data["count"] if data["count"] > 0 else 0
        final_results.append({
            "participant_id": participant_id,
            "average_rating": round(avg_rating, 2),
            "total_votes": data["count"]
        })
    
    final_results.sort(key=lambda x: x["average_rating"], reverse=True)
    return final_results

# Chat system
@api_router.post("/messages", response_model=ChatMessage)
async def send_message(input: MessageCreate):
    message = ChatMessage(**input.dict())
    await db.messages.insert_one(message.dict())
    
    # Broadcast to room
    await manager.broadcast_to_room(
        json.dumps({"type": "new_message", "message": message.dict()}),
        input.competition_id
    )
    
    return message

@api_router.get("/competitions/{competition_id}/messages", response_model=List[ChatMessage])
async def get_messages(competition_id: str, limit: int = 100):
    messages = await db.messages.find({"competition_id": competition_id}).sort("timestamp", -1).limit(limit).to_list(limit)
    messages.reverse()  # Return in chronological order
    return [ChatMessage(**msg) for msg in messages]

# WebSocket endpoint
@app.websocket("/ws/{competition_id}")
async def websocket_endpoint(websocket: WebSocket, competition_id: str):
    await manager.connect(websocket, competition_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle different types of real-time messages
            message_data = json.loads(data)
            await manager.broadcast_to_room(data, competition_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, competition_id)

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