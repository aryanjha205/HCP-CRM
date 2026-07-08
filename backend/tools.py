from langchain.tools import tool
from sqlalchemy.orm import Session
from database import SessionLocal
import crud
import schemas
from datetime import date, time, datetime

def get_db_session():
    return SessionLocal()

@tool
def log_interaction(
    doctor_name: str,
    interaction_type: str,
    interaction_date: str,
    interaction_time: str,
    topics_discussed: str,
    materials_shared: str,
    sentiment: str,
    outcomes: str,
    follow_up_actions: str
) -> str:
    """Extract and store structured interaction data for a Healthcare Professional."""
    db = get_db_session()
    try:
        dt_date = datetime.strptime(interaction_date, "%Y-%m-%d").date()
        dt_time = datetime.strptime(interaction_time, "%H:%M").time()
        
        new_int = schemas.InteractionCreate(
            doctor_name=doctor_name,
            interaction_type=interaction_type,
            date=dt_date,
            time=dt_time,
            topics_discussed=topics_discussed,
            materials_shared=materials_shared,
            sentiment=sentiment,
            outcomes=outcomes,
            follow_up_actions=follow_up_actions
        )
        created = crud.create_interaction(db, new_int)
        return f"Interaction successfully logged with ID: {created.id}"
    except Exception as e:
        return f"Error logging interaction: {str(e)}"
    finally:
        db.close()

@tool
def edit_interaction(
    interaction_id: int,
    doctor_name: str = None,
    interaction_type: str = None,
    interaction_date: str = None,
    interaction_time: str = None,
    topics_discussed: str = None,
    materials_shared: str = None,
    sentiment: str = None,
    outcomes: str = None,
    follow_up_actions: str = None
) -> str:
    """Modify stored interaction records by ID. Only provide the fields that need updating."""
    db = get_db_session()
    try:
        update_data = {}
        if doctor_name: update_data["doctor_name"] = doctor_name
        if interaction_type: update_data["interaction_type"] = interaction_type
        if interaction_date: update_data["date"] = datetime.strptime(interaction_date, "%Y-%m-%d").date()
        if interaction_time: update_data["time"] = datetime.strptime(interaction_time, "%H:%M").time()
        if topics_discussed: update_data["topics_discussed"] = topics_discussed
        if materials_shared: update_data["materials_shared"] = materials_shared
        if sentiment: update_data["sentiment"] = sentiment
        if outcomes: update_data["outcomes"] = outcomes
        if follow_up_actions: update_data["follow_up_actions"] = follow_up_actions
        
        if not update_data:
            return "No fields provided to update."

        updated = crud.update_interaction(db, interaction_id, schemas.InteractionUpdate(**update_data))
        if updated:
            return f"Interaction {interaction_id} successfully updated."
        return f"Interaction {interaction_id} not found."
    except Exception as e:
        return f"Error updating interaction: {str(e)}"
    finally:
        db.close()

@tool
def hcp_summary_tool(doctor_name: str) -> str:
    """Retrieve doctor interaction history and summarize it."""
    db = get_db_session()
    try:
        interactions = crud.get_interactions_by_doctor(db, doctor_name)
        if not interactions:
            return f"No interactions found for {doctor_name}."
        
        summary = f"Interaction history for {doctor_name}:\n"
        for i in interactions:
            summary += f"- [{i.date} {i.time}] {i.interaction_type}: Discussed: {i.topics_discussed}. Sentiment: {i.sentiment}. Follow up: {i.follow_up_actions}\n"
        return summary
    finally:
        db.close()

@tool
def follow_up_recommendation_tool(sentiment: str, outcomes: str) -> str:
    """Suggest next actions based on the sentiment and outcomes of an interaction."""
    s = sentiment.lower()
    if 'positive' in s or 'excellent' in s:
        return "Recommendation: Send a thank you note highlighting key positive outcomes. Schedule a follow-up conversation within 2-4 weeks to discuss further adoption or specific patient cases."
    elif 'negative' in s or 'poor' in s:
        return "Recommendation: Alert Medical Science Liaison (MSL) or line manager. Draft a careful response addressing specific concerns mentioned. Follow up only when issues are resolved or clarified."
    else:
        return "Recommendation: Share a general clinical overview brochure. Invite them to an upcoming webinar or provide standard product updates. Check back in 1-2 months."

@tool
def material_recommendation_tool(topics_discussed: str) -> str:
    """Suggest marketing or clinical materials based on the topics discussed."""
    topics = topics_discussed.lower()
    recommendations = []
    
    if 'efficacy' in topics or 'clinical data' in topics or 'trial' in topics:
        recommendations.append("Phase 3 Clinical Trial Results Summary (PDF)")
        recommendations.append("Efficacy Deep Dive Presentation deck")
    if 'safety' in topics or 'side effect' in topics or 'adverse event' in topics:
        recommendations.append("Safety Profile & Management Overview (PDF)")
    if 'dosing' in topics or 'administration' in topics or 'dose' in topics:
        recommendations.append("Quick Dosing Guide Reference Card")
    if 'mechanism' in topics or 'moa' in topics:
        recommendations.append("Mechanism of Action Animation Video Link")
        
    if not recommendations:
        recommendations.append("General Product Overview Brochure (PDF)")
        recommendations.append("Patient Support Program Information")
    
    return "Recommended Materials to share:\n" + "\n".join([f"- {r}" for r in recommendations])
