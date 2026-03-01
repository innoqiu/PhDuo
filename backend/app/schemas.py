from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ProfessorProfile(BaseModel):
    """Professor profile schema"""
    name: str
    university: str
    research_interests: List[str]
    recent_publications: List[str]

class ProfessorResponse(BaseModel):
    """Professor database response schema"""
    id: int
    root_url: str
    name: str
    university: str
    profile_data: Dict[str, Any]
    
    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    """Request schema for analyze endpoint"""
    url: str

class MatchAnalysisResponse(BaseModel):
    """Response schema for match analysis"""
    professor_profile: Dict[str, Any]
    analysis: str