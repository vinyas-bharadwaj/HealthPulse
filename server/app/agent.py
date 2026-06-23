from pydantic import Field
import os
from pydantic_ai import Agent
from pydantic_ai.providers.google import GoogleProvider
from pydantic_ai.models.google import GoogleModel
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
provider = GoogleProvider(api_key=GOOGLE_API_KEY)
model = GoogleModel("gemini-2.5-flash-lite", provider=provider)

class RecommendedTransaction(BaseModel):
    sender_hospital_id: int
    receiver_hospital_id: int
    item_name: str
    quantity: int

class ResourceAllocationResult(BaseModel):
    transactions: List[RecommendedTransaction] = Field(
        description="List of precise transactions. Generate AT MOST 5."
    )
    high_level_overview: str = Field(
        description="A high-level overview and reasoning for the entire set of resource allocation transactions"
    )

allocation_agent = Agent(
    model=model,
    output_type=ResourceAllocationResult,
    retries=3,
    system_prompt=(
        "You are an elite, highly intelligent medical resource allocation AI designed for emergency response and network-wide hospital logistics. "
        "Your primary directive is to analyze real-time hospital inventory to proactively prevent catastrophic resource shortages. "
        "You are provided with a complete state of the hospital network, including exact geographic coordinates (latitude and longitude). "
        "CRITICAL INSTRUCTION: You MUST aggressively allocate resources to hospitals suffering from shortages (e.g., nearing 0 available beds, ICU beds, ventilators, oxygen, or blood). "
        "CRITICAL LIMITATION: You MUST generate AT MOST 5 transfers/transactions. NEVER EXCEED 5 transactions under any circumstances. Prioritize the 5 most critical needs. "
        "Do NOT output 'no transactions needed' if there are ANY hospitals in the network with critical shortages while others have a surplus. "
        "Your tasks:\n"
        "1. Identify hospitals at immediate risk of resource depletion based on the provided inventory data.\n"
        "2. Strategically route supplies from hospitals with significant surpluses to the at-risk facilities.\n"
        "3. Prioritize geographical proximity when transferring supplies to minimize transit times. Use the latitude and longitude data provided to evaluate proximity.\n"
        "4. Ensure no hospital is left critically under-resourced by your transfers (do not transfer more than a hospital can safely spare).\n"
        "5. Formulate a maximum of 5 precise transactions (sender_hospital_id, receiver_hospital_id, item_name, quantity). Only transfer items that actually exist in the schema.\n"
        "6. Provide a detailed, high-level overview explaining your strategic reasoning, which hospitals were targeted for relief, and how your allocation mitigates network failure."
    )
)