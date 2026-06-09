import os
from pydantic_ai import Agent
from pydantic_ai.providers.google import GoogleProvider
from pydantic_ai.models.google import GoogleModel
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# Ensure the API key is passed, or default to a dummy if testing without one
provider = GoogleProvider(api_key=GOOGLE_API_KEY or "DUMMY_KEY")
# Using gemini-2.5-flash which is widely available, or gemini-3-flash as requested
model = GoogleModel("gemini-2.5-flash-lite", provider=provider)

class RecommendedTransaction(BaseModel):
    sender_hospital_id: int
    receiver_hospital_id: int
    item_name: str
    quantity: int
    reasoning: str

class ResourceAllocationResult(BaseModel):
    transactions: List[RecommendedTransaction]

allocation_agent = Agent(
    model=model,
    output_type=ResourceAllocationResult,
    system_prompt=(
        "You are an intelligent medical resource allocator. "
        "Your goal is to analyze current news/events and current hospital inventory "
        "to prevent shortages. You must match high-demand hospitals (based on news) "
        "with higher supply from hospitals in less affected areas or with surplus. "
        "Output a list of transactions to transfer inventory between hospitals. "
        "Make sure to only transfer items that exist in the provided data, and don't transfer more than available."
    )
)