"""
Groq Client — turns a fused + forecasted incident into a plain-English
summary and recommended action, filling incident.schema.json's
`summary` and `recommended_action` fields.

Uses Groq's OpenAI-compatible /chat/completions endpoint.
Needs GROQ_API_KEY set — put it in your .env file (see .env.example)
or export it directly in your shell before starting the backend.
"""

import os
import json
import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # fine without python-dotenv installed, as long as GROQ_API_KEY is set some other way

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

SYSTEM_PROMPT = (
    "You are a security operations assistant. You are given a fused security "
    "incident (correlated events from camera, badge, and network logs) plus "
    "the raw events behind it. Write a short plain-English summary of what "
    "happened and a concrete recommended action for the operator.\n\n"
    "Respond with ONLY a JSON object, no markdown, no preamble, in exactly "
    "this shape:\n"
    '{"summary": "...", "recommended_action": "..."}\n\n'
    "summary: 2-4 sentences, plain English, no jargon, mention the entity, "
    "locations, and the sequence of what happened.\n"
    "recommended_action: 1-2 sentences, a concrete next step the operator "
    "should take right now."
)


def _build_user_prompt(incident: dict, linked_events: list) -> str:
    payload = {
        "incident": {
            "primary_entity": incident.get("primary_entity"),
            "locations": incident.get("locations"),
            "time_window": incident.get("time_window"),
            "correlation_reason": incident.get("correlation_reason"),
            "severity": incident.get("severity"),
            "matched_attack_pattern": incident.get("matched_attack_pattern"),
            "predicted_next_step": incident.get("predicted_next_step"),
            "confidence": incident.get("confidence"),
        },
        "linked_events": [
            {
                "source": e.get("source"),
                "event_type": e.get("event_type"),
                "location": e.get("location"),
                "timestamp": e.get("timestamp"),
                "rule_triggered": e.get("rule_triggered"),
                "raw_details": e.get("raw_details"),
            }
            for e in linked_events
        ],
    }
    return json.dumps(payload, indent=2)


def summarize_incident(incident: dict, linked_events: list, timeout: int = 15) -> dict:
    """
    Calls Groq to generate a summary + recommended_action for one incident.
    Returns {"summary": str, "recommended_action": str}.

    On any failure (missing key, network error, malformed JSON back), returns
    a safe fallback instead of raising — a live demo should never crash
    because one LLM call hiccuped.
    """
    fallback = {
        "summary": (
            f"Incident involving {incident.get('primary_entity', {}).get('id', 'an unknown entity')} "
            f"across {', '.join(incident.get('locations') or []) or 'an unspecified location'} "
            f"matched pattern '{incident.get('matched_attack_pattern') or 'unclassified'}'."
        ),
        "recommended_action": "Review the linked events manually — automatic summary unavailable.",
    }

    if not GROQ_API_KEY:
        print("[groq_client] GROQ_API_KEY not set — returning fallback summary")
        return fallback

    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": _build_user_prompt(incident, linked_events)},
                ],
                "temperature": 0.3,
                "max_tokens": 400,
                "response_format": {"type": "json_object"},
            },
            timeout=timeout,
        )  
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        parsed = json.loads(content)

        return {
            "summary": parsed.get("summary", fallback["summary"]),
            "recommended_action": parsed.get("recommended_action", fallback["recommended_action"]),
        }

    except Exception as e:
        print(f"[groq_client] Groq call failed ({e}) — returning fallback summary")
        return fallback


def enrich_incident(incident: dict, linked_events: list) -> dict:
    """Convenience wrapper for main.py: mutates incident in place with
    summary + recommended_action filled in, and returns it."""
    result = summarize_incident(incident, linked_events)
    incident["summary"] = result["summary"]
    incident["recommended_action"] = result["recommended_action"]
    return incident


# --- quick standalone test using schemas/examples.json ---
if __name__ == "__main__":
    examples_path = os.path.join(os.path.dirname(__file__), "..", "schemas", "examples.json")
    with open(examples_path) as f:
        data = json.load(f)

    incident = dict(data["example_incident"])
    incident["summary"] = None
    incident["recommended_action"] = None
    linked_events = data["example_events"]

    result = enrich_incident(incident, linked_events)
    print(json.dumps(result, indent=2))