from sqlalchemy import Column, Integer, String, Text, Date, Time
from database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    doctor_name = Column(String, index=True)
    interaction_type = Column(String)
    date = Column(Date)
    time = Column(Time)
    topics_discussed = Column(Text)
    materials_shared = Column(Text)
    sentiment = Column(String)
    outcomes = Column(Text)
    follow_up_actions = Column(Text)
