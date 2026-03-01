"""
Database Operations Module
Provides common database operations for the Professor model
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine, Column, String, Integer, JSON, or_
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./professors.db")

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Professor model (matching the one in main.py)
class Professor(Base):
    __tablename__ = "professors"
    id = Column(Integer, primary_key=True, index=True)
    root_url = Column(String, unique=True, index=True)
    name = Column(String)
    university = Column(String)
    profile_data = Column(JSON)


# ==================== Query Functions ====================

def get_by_id(professor_id: int) -> Optional[Professor]:
    """
    Get professor by ID
    
    Args:
        professor_id: The ID of the professor
        
    Returns:
        Professor object or None if not found
    """
    db = SessionLocal()
    try:
        return db.query(Professor).filter(Professor.id == professor_id).first()
    finally:
        db.close()


def get_by_url(root_url: str) -> Optional[Professor]:
    """
    Get professor by root URL
    
    Args:
        root_url: The root URL of the professor's website
        
    Returns:
        Professor object or None if not found
    """
    db = SessionLocal()
    try:
        return db.query(Professor).filter(Professor.root_url == root_url).first()
    finally:
        db.close()


def get_by_name(name: str, exact_match: bool = False) -> List[Professor]:
    """
    Get professors by name
    
    Args:
        name: The name to search for
        exact_match: If True, search for exact match; if False, search for partial match
        
    Returns:
        List of Professor objects
    """
    db = SessionLocal()
    try:
        if exact_match:
            return db.query(Professor).filter(Professor.name == name).all()
        else:
            return db.query(Professor).filter(Professor.name.contains(name)).all()
    finally:
        db.close()


def get_by_university(university: str, exact_match: bool = False) -> List[Professor]:
    """
    Get professors by university
    
    Args:
        university: The university name to search for
        exact_match: If True, search for exact match; if False, search for partial match
        
    Returns:
        List of Professor objects
    """
    db = SessionLocal()
    try:
        if exact_match:
            return db.query(Professor).filter(Professor.university == university).all()
        else:
            return db.query(Professor).filter(Professor.university.contains(university)).all()
    finally:
        db.close()


def search_professors(query: str) -> List[Professor]:
    """
    Search professors by name or university (case-insensitive)
    
    Args:
        query: Search query string
        
    Returns:
        List of Professor objects matching the query
    """
    db = SessionLocal()
    try:
        return db.query(Professor).filter(
            or_(
                Professor.name.contains(query),
                Professor.university.contains(query),
                Professor.root_url.contains(query)
            )
        ).all()
    finally:
        db.close()


# ==================== List Functions ====================

def list_all(limit: Optional[int] = None, offset: int = 0) -> List[Professor]:
    """
    List all professors
    
    Args:
        limit: Maximum number of results to return (None for all)
        offset: Number of results to skip
        
    Returns:
        List of Professor objects
    """
    db = SessionLocal()
    try:
        query = db.query(Professor)
        if limit:
            return query.offset(offset).limit(limit).all()
        return query.offset(offset).all()
    finally:
        db.close()


def list_all_as_dict(limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
    """
    List all professors as dictionaries
    
    Args:
        limit: Maximum number of results to return (None for all)
        offset: Number of results to skip
        
    Returns:
        List of dictionaries containing professor data
    """
    professors = list_all(limit=limit, offset=offset)
    return [professor_to_dict(prof) for prof in professors]


# ==================== Create Functions ====================

def create_professor(
    root_url: str,
    name: str,
    university: str,
    profile_data: Dict[str, Any]
) -> Professor:
    """
    Create a new professor record
    
    Args:
        root_url: The root URL of the professor's website
        name: The professor's name
        university: The university name
        profile_data: The profile data dictionary
        
    Returns:
        Created Professor object
        
    Raises:
        ValueError: If professor with same root_url already exists
    """
    db = SessionLocal()
    try:
        # Check if professor already exists
        existing = db.query(Professor).filter(Professor.root_url == root_url).first()
        if existing:
            raise ValueError(f"Professor with URL {root_url} already exists")
        
        new_professor = Professor(
            root_url=root_url,
            name=name,
            university=university,
            profile_data=profile_data
        )
        db.add(new_professor)
        db.commit()
        db.refresh(new_professor)
        return new_professor
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def create_or_update_professor(
    root_url: str,
    name: str,
    university: str,
    profile_data: Dict[str, Any]
) -> Professor:
    """
    Create a new professor or update existing one
    
    Args:
        root_url: The root URL of the professor's website
        name: The professor's name
        university: The university name
        profile_data: The profile data dictionary
        
    Returns:
        Created or updated Professor object
    """
    db = SessionLocal()
    try:
        existing = db.query(Professor).filter(Professor.root_url == root_url).first()
        
        if existing:
            # Update existing
            existing.name = name
            existing.university = university
            existing.profile_data = profile_data
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new
            new_professor = Professor(
                root_url=root_url,
                name=name,
                university=university,
                profile_data=profile_data
            )
            db.add(new_professor)
            db.commit()
            db.refresh(new_professor)
            return new_professor
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


# ==================== Update Functions ====================

def update_professor(
    professor_id: int,
    name: Optional[str] = None,
    university: Optional[str] = None,
    profile_data: Optional[Dict[str, Any]] = None
) -> Optional[Professor]:
    """
    Update professor by ID
    
    Args:
        professor_id: The ID of the professor to update
        name: New name (optional)
        university: New university (optional)
        profile_data: New profile data (optional)
        
    Returns:
        Updated Professor object or None if not found
    """
    db = SessionLocal()
    try:
        professor = db.query(Professor).filter(Professor.id == professor_id).first()
        if not professor:
            return None
        
        if name is not None:
            professor.name = name
        if university is not None:
            professor.university = university
        if profile_data is not None:
            professor.profile_data = profile_data
        
        db.commit()
        db.refresh(professor)
        return professor
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def update_professor_by_url(
    root_url: str,
    name: Optional[str] = None,
    university: Optional[str] = None,
    profile_data: Optional[Dict[str, Any]] = None
) -> Optional[Professor]:
    """
    Update professor by root URL
    
    Args:
        root_url: The root URL of the professor to update
        name: New name (optional)
        university: New university (optional)
        profile_data: New profile data (optional)
        
    Returns:
        Updated Professor object or None if not found
    """
    db = SessionLocal()
    try:
        professor = db.query(Professor).filter(Professor.root_url == root_url).first()
        if not professor:
            return None
        
        if name is not None:
            professor.name = name
        if university is not None:
            professor.university = university
        if profile_data is not None:
            professor.profile_data = profile_data
        
        db.commit()
        db.refresh(professor)
        return professor
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


# ==================== Delete Functions ====================

def delete_by_id(professor_id: int) -> bool:
    """
    Delete professor by ID
    
    Args:
        professor_id: The ID of the professor to delete
        
    Returns:
        True if deleted, False if not found
    """
    db = SessionLocal()
    try:
        professor = db.query(Professor).filter(Professor.id == professor_id).first()
        if not professor:
            return False
        
        db.delete(professor)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def delete_by_url(root_url: str) -> bool:
    """
    Delete professor by root URL
    
    Args:
        root_url: The root URL of the professor to delete
        
    Returns:
        True if deleted, False if not found
    """
    db = SessionLocal()
    try:
        professor = db.query(Professor).filter(Professor.root_url == root_url).first()
        if not professor:
            return False
        
        db.delete(professor)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def delete_all() -> int:
    """
    Delete all professors
    
    Returns:
        Number of deleted records
    """
    db = SessionLocal()
    try:
        count = db.query(Professor).count()
        db.query(Professor).delete()
        db.commit()
        return count
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


# ==================== Utility Functions ====================

def count() -> int:
    """
    Count total number of professors
    
    Returns:
        Total count of professors
    """
    db = SessionLocal()
    try:
        return db.query(Professor).count()
    finally:
        db.close()


def exists_by_url(root_url: str) -> bool:
    """
    Check if professor exists by root URL
    
    Args:
        root_url: The root URL to check
        
    Returns:
        True if exists, False otherwise
    """
    db = SessionLocal()
    try:
        return db.query(Professor).filter(Professor.root_url == root_url).first() is not None
    finally:
        db.close()


def exists_by_id(professor_id: int) -> bool:
    """
    Check if professor exists by ID
    
    Args:
        professor_id: The ID to check
        
    Returns:
        True if exists, False otherwise
    """
    db = SessionLocal()
    try:
        return db.query(Professor).filter(Professor.id == professor_id).first() is not None
    finally:
        db.close()


def professor_to_dict(professor: Professor) -> Dict[str, Any]:
    """
    Convert Professor object to dictionary
    
    Args:
        professor: Professor object
        
    Returns:
        Dictionary representation of the professor
    """
    if professor is None:
        return {}
    
    return {
        "id": professor.id,
        "root_url": professor.root_url,
        "name": professor.name,
        "university": professor.university,
        "profile_data": professor.profile_data
    }


def get_professors_by_research_interest(keyword: str) -> List[Professor]:
    """
    Search professors by research interest keyword in profile_data
    
    Args:
        keyword: Keyword to search for in research interests
        
    Returns:
        List of Professor objects matching the keyword
    """
    db = SessionLocal()
    try:
        all_professors = db.query(Professor).all()
        matching_professors = []
        
        for prof in all_professors:
            if prof.profile_data:
                # Search in research_signals.research_interests
                research_interests = prof.profile_data.get("research_signals", {}).get("research_interests", "")
                if keyword.lower() in str(research_interests).lower():
                    matching_professors.append(prof)
                    continue
                
                # Search in research_items
                research_items = prof.profile_data.get("research_signals", {}).get("research_items", [])
                for item in research_items:
                    if isinstance(item, dict):
                        title = item.get("title", "")
                        abstract = item.get("abstract_or_description", "")
                        if keyword.lower() in str(title).lower() or keyword.lower() in str(abstract).lower():
                            matching_professors.append(prof)
                            break
        
        return matching_professors
    finally:
        db.close()


def get_professors_by_venue(venue: str) -> List[Professor]:
    """
    Get professors who have publications in a specific venue
    
    Args:
        venue: Venue name or acronym (e.g., "CVPR", "NeurIPS")
        
    Returns:
        List of Professor objects
    """
    db = SessionLocal()
    try:
        all_professors = db.query(Professor).all()
        matching_professors = []
        
        for prof in all_professors:
            if prof.profile_data:
                venues = prof.profile_data.get("research_signals", {}).get("venues_found", [])
                if venue.upper() in [v.upper() for v in venues]:
                    matching_professors.append(prof)
        
        return matching_professors
    finally:
        db.close()


# ==================== Batch Operations ====================

def batch_create(professors_data: List[Dict[str, Any]]) -> List[Professor]:
    """
    Create multiple professors in a batch
    
    Args:
        professors_data: List of dictionaries containing professor data
                        Each dict should have: root_url, name, university, profile_data
        
    Returns:
        List of created Professor objects
    """
    db = SessionLocal()
    created_professors = []
    try:
        for prof_data in professors_data:
            # Check if exists
            existing = db.query(Professor).filter(Professor.root_url == prof_data["root_url"]).first()
            if existing:
                continue  # Skip if already exists
            
            new_professor = Professor(
                root_url=prof_data["root_url"],
                name=prof_data["name"],
                university=prof_data["university"],
                profile_data=prof_data["profile_data"]
            )
            db.add(new_professor)
            created_professors.append(new_professor)
        
        db.commit()
        for prof in created_professors:
            db.refresh(prof)
        return created_professors
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def batch_delete(professor_ids: List[int]) -> int:
    """
    Delete multiple professors by IDs
    
    Args:
        professor_ids: List of professor IDs to delete
        
    Returns:
        Number of deleted records
    """
    db = SessionLocal()
    try:
        count = db.query(Professor).filter(Professor.id.in_(professor_ids)).delete(synchronize_session=False)
        db.commit()
        return count
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

