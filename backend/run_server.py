#!/usr/bin/env python3
"""
Development server runner for the Academic Matching Assistant
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print(" Starting Academic Matching Assistant Backend...")
    print(" Environment:", os.getenv("DATABASE_URL", "sqlite:///./professors.db"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=7878,
        reload=True,  # Auto-reload on code changes in development
        log_level="info"
    )