from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import crud
import database
from agent import process_chat

# Initialize the database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="HCP CRM System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the HCP CRM System API. Use /docs to view Swagger documentation."}

@app.post("/api/interactions", response_model=schemas.InteractionResponse)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(database.get_db)):
    return crud.create_interaction(db=db, interaction=interaction)

@app.get("/api/interactions", response_model=List[schemas.InteractionResponse])
def read_interactions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_interactions(db, skip=skip, limit=limit)

@app.put("/api/interactions/{interaction_id}", response_model=schemas.InteractionResponse)
def update_interaction(interaction_id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(database.get_db)):
    db_interaction = crud.update_interaction(db, interaction_id, interaction)
    if db_interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.post("/api/chat")
def chat_endpoint(chat_message: schemas.ChatMessage):
    try:
        reply = process_chat(chat_message.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
