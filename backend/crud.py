from sqlalchemy.orm import Session
from models import Interaction
from schemas import InteractionCreate, InteractionUpdate

def create_interaction(db: Session, interaction: InteractionCreate):
    db_interaction = Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def get_interactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Interaction).order_by(Interaction.date.desc(), Interaction.time.desc()).offset(skip).limit(limit).all()

def get_interaction_by_id(db: Session, interaction_id: int):
    return db.query(Interaction).filter(Interaction.id == interaction_id).first()

def get_interactions_by_doctor(db: Session, doctor_name: str):
    return db.query(Interaction).filter(Interaction.doctor_name.ilike(f"%{doctor_name}%")).order_by(Interaction.date.desc()).all()

def update_interaction(db: Session, interaction_id: int, interaction: InteractionUpdate):
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if db_interaction:
        update_data = interaction.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_interaction, key, value)
        db.commit()
        db.refresh(db_interaction)
    return db_interaction
