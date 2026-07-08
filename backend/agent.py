import os
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from tools import (
    log_interaction, 
    edit_interaction, 
    hcp_summary_tool, 
    follow_up_recommendation_tool, 
    material_recommendation_tool
)
from dotenv import load_dotenv

load_dotenv()

def get_agent():
    api_key = os.getenv("GROQ_API_KEY")
    
    # If the key is absent or still the placeholder, return None to use mock mode
    if not api_key or api_key == "your_groq_api_key_here" or api_key.strip() == "":
        return None

    try:
        llm = ChatGroq(model="gemma2-9b-it", temperature=0, groq_api_key=api_key)
    except Exception as e:
        print(f"Failed to initialize ChatGroq: {e}. Please ensure GROQ_API_KEY is set correctly.")
        return None
        
    tools = [
        log_interaction,
        edit_interaction,
        hcp_summary_tool,
        follow_up_recommendation_tool,
        material_recommendation_tool
    ]
    
    system_prompt = """You are an AI assistant for a Healthcare Professional (HCP) CRM system used by medical sales reps.
Your goal is to help reps log interactions, summarize history, and provide recommendations.
Always invoke the available tools to log data into the system, look up doctor history, or get recommendations for materials/follow-ups. 
When asked to log an interaction, ensure you extract or ask for all necessary fields: doctor_name, interaction_type, interaction_date (YYYY-MM-DD), interaction_time (HH:MM), topics_discussed, materials_shared, sentiment, outcomes, and follow_up_actions. If you don't have all the info, you can guess reasonable defaults or summarize the provided context to fill them when logging.
Be friendly and concise in your responses.
"""
    return create_react_agent(llm, tools, state_modifier=system_prompt)

import re
import json
from datetime import date as dt_date, timedelta
from g4f.client import Client
from tools import (
    log_interaction, 
    edit_interaction, 
    hcp_summary_tool, 
    follow_up_recommendation_tool, 
    material_recommendation_tool
)

def fallback_agent(message: str) -> str:
    today_str = dt_date.today().strftime("%Y-%m-%d")
    
    # Prompt the LLM for structured intent extraction
    extraction_prompt = f"""You are an AI Healthcare CRM routing assistant. Your job is to extract entities and identify the user's intent.
You MUST output a valid JSON block containing:
- "intent": one of: ["log_interaction", "edit_interaction", "hcp_summary", "material_recommendation", "follow_up_recommendation", "general_chat"]
- "data": a JSON object with the extracted parameters.

Parameters to extract by intent:
1. For "log_interaction":
   - "doctor_name": name of the doctor (e.g. "Dr. Sarah Connor", ensure you prefix with "Dr. " if not present)
   - "interaction_type": one of: ["In-person Meeting", "Virtual Call", "Email", "Phone Call"] (default to "In-person Meeting")
   - "date": YYYY-MM-DD format (default to today's date if not specified: "{today_str}")
   - "time": HH:MM format (default to "12:00" if not specified)
   - "topics_discussed": summary of topics discussed
   - "materials_shared": materials shared
   - "sentiment": one of: ["Positive", "Neutral", "Negative"] (default to "Positive")
   - "outcomes": summary of meeting outcomes
   - "follow_up_actions": follow up actions

2. For "edit_interaction":
   - "interaction_id": integer ID of the interaction to edit (extract from statements like "edit interaction 2" or "update ID 1")
   - Any of: "doctor_name", "interaction_type", "date", "time", "topics_discussed", "materials_shared", "sentiment", "outcomes", "follow_up_actions" (only include if user explicitly mentions updating them)

3. For "hcp_summary":
   - "doctor_name": doctor name to summarize (e.g. "Dr. House")

4. For "material_recommendation":
   - "topics_discussed": topics to match (e.g. "efficacy", "safety", "dosing")

5. For "follow_up_recommendation":
   - "sentiment": sentiment of the interaction ("Positive", "Neutral", "Negative")
   - "outcomes": outcomes of the interaction

6. For "general_chat":
   - If user asks a general question or doesn't want to run a tool, set intent to "general_chat".

User Message: "{message}"

IMPORTANT: Output ONLY valid raw JSON. Do not include markdown code block quotes (e.g., ```json) or any explanation. Just the raw JSON block.
"""
    
    try:
        client = Client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": extraction_prompt}]
        )
        response_text = response.choices[0].message.content
        
        # Clean response to get raw JSON
        clean_res = response_text.strip()
        if clean_res.startswith("```"):
            clean_res = re.sub(r"^```(?:json)?\n", "", clean_res)
            clean_res = re.sub(r"\n```$", "", clean_res)
        clean_res = clean_res.strip()
        
        # Find json bounds if there are leading/trailing characters
        json_start = clean_res.find("{")
        json_end = clean_res.rfind("}")
        if json_start != -1 and json_end != -1:
            clean_res = clean_res[json_start:json_end+1]
            
        payload = json.loads(clean_res)
        intent = payload.get("intent", "general_chat")
        data = payload.get("data", {})
        
        # Route to appropriate tool
        if intent == "log_interaction":
            doc = data.get("doctor_name", "Dr. House")
            if not doc.startswith("Dr. "):
                doc = "Dr. " + doc
            
            args = {
                "doctor_name": doc,
                "interaction_type": data.get("interaction_type", "In-person Meeting"),
                "interaction_date": data.get("date", today_str),
                "interaction_time": data.get("time", "12:00"),
                "topics_discussed": data.get("topics_discussed", "General Product Discussion"),
                "materials_shared": data.get("materials_shared", "Product Brochure PDF"),
                "sentiment": data.get("sentiment", "Positive"),
                "outcomes": data.get("outcomes", "HCP showed interest."),
                "follow_up_actions": data.get("follow_up_actions", "Schedule follow-up next month.")
            }
            res = log_interaction.invoke(args)
            return f"""### [Free AI Assistant - Fallback Mode]

I have analyzed your request and successfully logged the interaction using the **Log Interaction** tool.

**Logged Details:**
- **Doctor:** {args['doctor_name']}
- **Type:** {args['interaction_type']}
- **Date & Time:** {args['interaction_date']} at {args['interaction_time']}
- **Topics:** {args['topics_discussed']}
- **Materials Shared:** {args['materials_shared']}
- **Sentiment:** {args['sentiment']}
- **Outcomes:** {args['outcomes']}
- **Follow-up:** {args['follow_up_actions']}

**Database Confirmation:**
{res}"""

        elif intent == "edit_interaction":
            int_id = data.get("interaction_id")
            if not int_id:
                # Search for id inside prompt
                id_match = re.search(r'\d+', message)
                if id_match:
                    int_id = int(id_match.group(0))
            
            if not int_id:
                return "Error: Could not determine interaction ID. Please specify which interaction ID you want to edit."
                
            args = {"interaction_id": int_id}
            for f in ["doctor_name", "interaction_type", "date", "time", "topics_discussed", "materials_shared", "sentiment", "outcomes", "follow_up_actions"]:
                if f in data:
                    if f == "date":
                        args["interaction_date"] = data["date"]
                    elif f == "time":
                        args["interaction_time"] = data["time"]
                    else:
                        args[f] = data[f]
            
            res = edit_interaction.invoke(args)
            return f"### [Free AI Assistant - Fallback Mode]\n\nI processed your edit request for interaction ID {int_id} using the **Edit Interaction** tool.\n\n**Result:** {res}"

        elif intent == "hcp_summary":
            doc = data.get("doctor_name", "House")
            res = hcp_summary_tool.invoke({"doctor_name": doc})
            return f"### [Free AI Assistant - Fallback Mode]\n\nI have fetched the doctor's interaction history using the **HCP Summary** tool.\n\n{res}"

        elif intent == "material_recommendation":
            topics = data.get("topics_discussed", "general")
            res = material_recommendation_tool.invoke({"topics_discussed": topics})
            return f"### [Free AI Assistant - Fallback Mode]\n\nHere are the material recommendations from the **Material Recommendation** tool:\n\n{res}"

        elif intent == "follow_up_recommendation":
            sentiment = data.get("sentiment", "Positive")
            outcomes = data.get("outcomes", "HCP showed interest.")
            res = follow_up_recommendation_tool.invoke({"sentiment": sentiment, "outcomes": outcomes})
            return f"### [Free AI Assistant - Fallback Mode]\n\nHere are the recommended next steps from the **Follow-up Recommendation** tool:\n\n{res}"

    except Exception as e:
        print(f"Fallback extraction failed ({e}). Falling back to simple keyword search.")
        
    # Simple Heuristic Fallback if LLM parsing fails or JSON is corrupt
    msg_lower = message.lower()
    if any(k in msg_lower for k in ["summary", "summarize", "history", "records"]) and ("dr." in msg_lower or "doctor" in msg_lower or "house" in msg_lower):
        doc_match = re.search(r'(?:dr\.|doctor)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)', msg_lower)
        doc_name = doc_match.group(1).title() if doc_match else "House"
        res = hcp_summary_tool.invoke({"doctor_name": doc_name})
        return f"### [Free AI Assistant - Fallback Mode (Heuristic)]\n\nI have fetched the interaction history for Dr. {doc_name}.\n\n{res}"

    if any(k in msg_lower for k in ["material", "brochure", "resource", "share", "deck", "document"]):
        topics = "general"
        for t in ["efficacy", "safety", "dosing", "administration", "trial", "mechanism", "moa", "side effect"]:
            if t in msg_lower:
                topics = t
                break
        res = material_recommendation_tool.invoke({"topics_discussed": topics})
        return f"### [Free AI Assistant - Fallback Mode (Heuristic)]\n\nHere are the recommended materials:\n\n{res}"

    if any(k in msg_lower for k in ["follow-up recommendation", "follow up recommendation", "next step", "suggest follow"]):
        sentiment = "neutral"
        if any(s in msg_lower for s in ["positive", "good", "great", "excellent"]):
            sentiment = "positive"
        elif any(s in msg_lower for s in ["negative", "poor", "bad", "concerned"]):
            sentiment = "negative"
        res = follow_up_recommendation_tool.invoke({"sentiment": sentiment, "outcomes": "Discussion"})
        return f"### [Free AI Assistant - Fallback Mode (Heuristic)]\n\nHere are the suggested next steps:\n\n{res}"

    if any(k in msg_lower for k in ["edit", "update", "modify", "change"]) and any(x in msg_lower for x in ["id", "interaction"]):
        id_match = re.search(r'(?:id|interaction)\s*#?\s*(\d+)', msg_lower)
        if id_match:
            int_id = int(id_match.group(1))
            args = {"interaction_id": int_id}
            if "sentiment" in msg_lower:
                for s in ["positive", "neutral", "negative"]:
                    if s in msg_lower: args["sentiment"] = s.title()
            res = edit_interaction.invoke(args)
            return f"### [Free AI Assistant - Fallback Mode (Heuristic)]\n\nUpdated interaction {int_id}.\n\n**Result:** {res}"

    # Default general chat
    try:
        client = Client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful sales assistant for an HCP CRM. Answer the rep's query professionally and concisely."},
                {"role": "user", "content": message}
            ]
        )
        return f"### [Free AI Assistant - Fallback Mode]\n\n{response.choices[0].message.content}"
    except Exception as e:
        return f"### [Free AI Assistant - Fallback Mode]\n\nHello! I received your message: '{message}'. To fully use all tool functions, verify your internet connection or supply a Groq API key."

def process_chat(message: str) -> str:
    agent = get_agent()
    
    if not agent:
        return fallback_agent(message)
        
    try:
        response = agent.invoke({"messages": [{"role": "user", "content": message}]})
        return response["messages"][-1].content
    except Exception as e:
        print(f"Agent invoke failed: {e}. Falling back to Smart NLP parser.")
        return fallback_agent(message)


