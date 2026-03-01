from sqlalchemy import Column, String, Text, Integer, JSON
from app.database import Base

class Professor(Base):
    """Professor database model"""
    __tablename__ = "professors"
    
    id = Column(Integer, primary_key=True, index=True)
    root_url = Column(String, unique=True, index=True)  # 用于索引
    name = Column(String)
    university = Column(String)
    profile_data = Column(JSON)  # 存储 LLM 提取的结构化 Profile