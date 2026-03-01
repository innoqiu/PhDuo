#!/usr/bin/env python3
"""
Simple test script to verify the backend structure works correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported correctly"""
    try:
        print("Testing imports...")
        
        # Test database imports
        from app.database import engine, SessionLocal, Base, get_db, create_tables
        print("[OK] Database module imported successfully")
        
        # Test models
        from app.models import Professor
        print("[OK] Models module imported successfully")
        
        # Test schemas
        from app.schemas import ProfessorProfile, ProfessorResponse, AnalyzeRequest
        print("[OK] Schemas module imported successfully")
        
        # Test services
        from app.services.crawler import clean_url, crawl_website, get_professor_profile
        from app.services.llm_service import extract_professor_profile, analyze_match_streaming
        from app.services.pdf_parser import extract_text_from_pdf
        print("[OK] Services modules imported successfully")
        
        # Test API
        from app.api.endpoints import router
        print("[OK] API endpoints imported successfully")
        
        # Test main app
        from main import app
        print("[OK] Main app imported successfully")
        
        print("\n[SUCCESS] All imports successful! The backend structure is working correctly.")
        return True
        
    except Exception as e:
        print(f"[ERROR] Import error: {str(e)}")
        return False

def test_url_cleaning():
    """Test URL cleaning functionality"""
    try:
        from app.services.crawler import clean_url
        
        test_cases = [
            ("https://imyueli.github.io/projects.html", "https://imyueli.github.io"),
            ("https://scholar.google.com/citations?user=abc123", "https://scholar.google.com"),
            ("http://example.com/path/to/page?query=test", "http://example.com")
        ]
        
        print("Testing URL cleaning...")
        for input_url, expected in test_cases:
            result = clean_url(input_url)
            if result == expected:
                print(f"[OK] {input_url} -> {result}")
            else:
                print(f"[ERROR] {input_url} -> {result} (expected {expected})")
                return False
                
        print("[OK] URL cleaning tests passed")
        return True
        
    except Exception as e:
        print(f"[ERROR] URL cleaning test error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Backend Structure Test")
    print("=" * 50)
    
    success = True
    success &= test_imports()
    success &= test_url_cleaning()
    
    if success:
        print("\n[SUCCESS] All tests passed! Backend structure is ready.")
        sys.exit(0)
    else:
        print("\n[ERROR] Some tests failed. Please check the errors above.")
        sys.exit(1)