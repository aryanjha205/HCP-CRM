from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class InteractionBase(BaseModel):
    doctor_name: str
    interaction_type: str
    date: date
    time: time
    topics_discussed: str
    materials_shared: str
    sentiment: str
    outcomes: str
    follow_up_actions: str

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    doctor_name: Optional[str] = None
    interaction_type: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None

class InteractionResponse(InteractionBase):
    id: int

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message: str
