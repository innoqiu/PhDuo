# Academic Matching Assistant (PhDuoV2)

An intelligent AI-powered platform that analyzes the compatibility between PhD students and professors by matching CVs with professor profiles. The system uses advanced LLM technology to provide comprehensive match analysis, research alignment insights, and personalized recommendations.

## 🎯 Project Overview

This application helps prospective PhD students:
- **Analyze compatibility** with potential advisors by comparing their CVs against professor profiles
- **Get detailed insights** on research alignment, mentorship style, and lab culture
- **Receive actionable recommendations** for improving their application strategy
- **Access structured reports** with fit scores, risk assessments, and gap analysis

## ✨ Key Features

- **Intelligent CV Processing**: Extracts and structures information from PDF/DOCX CVs using LLM
- **Multi-Page Website Crawling**: Automatically crawls professor websites (up to 10 pages, depth 2) using Crawl4AI
- **Comprehensive Analysis**: 
  - Professor profile extraction and lab analysis
  - Multi-dimensional match analysis (9 dimensions)
  - Structured JSON reports for dashboard visualization
- **Smart Caching**: Reduces API calls with intelligent caching for CVs, professor profiles, and analysis reports
- **Parallel Processing**: Optimized execution with parallel CV and professor profile processing
- **Retry Logic**: Robust error handling with exponential backoff for rate limits
- **URL Validation**: Security checks to ensure only valid public HTTPS URLs are processed

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI** for REST API endpoints
- **SQLite** database for professor profiles and match reports
- **Crawl4AI** for web crawling
- **OpenAI-compatible API** for LLM processing
- **Async/await** for concurrent processing

### Frontend (React + Vite)
- **React 19** with modern hooks
- **Tailwind CSS** for styling
- **Framer Motion & GSAP** for animations
- **Recharts** for data visualization
- **React Markdown** for report rendering

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 18+** and npm
- **OpenAI-compatible API** key (or Zeabur API)
- **Crawl4AI** dependencies (browser automation)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PhDuoV2
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# LLM API Configuration
ZEABUR_API_KEY=your_api_key_here
ZEABUR_BASE_URL=https://hnd1.aihub.zeabur.ai/v1

# Database (optional, defaults to SQLite)
DATABASE_URL=sqlite:///./professors.db
```

## ⚙️ Configuration

### Backend Configuration

The backend uses environment variables for configuration:

- `ZEABUR_API_KEY`: Your OpenAI-compatible API key
- `ZEABUR_BASE_URL`: Base URL for the LLM API (default: Zeabur endpoint)
- `DATABASE_URL`: Database connection string (default: SQLite)

### Crawl4AI Configuration

The crawler is configured in `backend/app/services/crawl4ai_service.py`:
- `max_depth=2`: Maximum link depth to crawl
- `max_pages=10`: Maximum number of pages to crawl
- `include_patterns`: Only crawls pages within the root URL domain

## 🎮 Usage

### Starting the Backend Server

```bash
cd backend
python run_server.py
```

The server will start on `http://localhost:7878`

### Starting the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

### Using the Application

1. **Open the web interface** in your browser
2. **Upload your CV** (PDF or DOCX format, max 5MB)
3. **Enter the professor's website URL** (must be HTTPS and public domain)
4. **Click "Analyze Match"** and wait for processing
5. **View the results**:
   - Professor & Lab Analysis Report
   - Match Analysis Report
   - Structured Dashboard View with scores and visualizations

### Processing Flow

The system performs the following steps:

1. **CV Processing** (Call #1): Extracts and structures CV data
2. **Professor Profile Extraction & Analysis** (Call #2+3): Crawls website and generates profile + analysis
3. **Match Analysis & Refined Report** (Call #3): Analyzes compatibility and generates structured JSON

**Note**: Steps 1 and 2 run in parallel for faster execution.

## 📡 API Endpoints

### Main Analysis Endpoint

**POST** `/analyze`
- **Description**: Analyzes match between student CV and professor profile
- **Request**:
  - `cv`: File upload (PDF/DOCX)
  - `url`: Professor website URL (form data)
- **Response**: Server-Sent Events (SSE) stream with status updates and final report

### Database Endpoints

**GET** `/dbp/professors`
- List all professors with pagination

**GET** `/dbp/professors/{professor_id}`
- Get professor by ID

**GET** `/dbp/professors/url/{root_url}`
- Get professor by URL

**GET** `/dbp/professors/search?query={query}`
- Search professors by keyword

**GET** `/dbp/professors/by-name?name={name}`
- Get professors by name

**GET** `/dbp/professors/by-university?university={university}`
- Get professors by university

**GET** `/dbp/professors/by-research?keyword={keyword}`
- Get professors by research interest

**GET** `/dbp/professors/by-venue?venue={venue}`
- Get professors by publication venue

**GET** `/dbp/stats`
- Get database statistics

### Match Reports Endpoints

**GET** `/api/match-reports`
- List all match reports (history)

**GET** `/api/match-reports/{report_id}`
- Get specific match report by ID

## 📁 Project Structure

```
PhDuoV2/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── services/          # Business logic services
│   │   │   ├── crawl4ai_service.py    # Web crawling service
│   │   │   ├── llm_service.py         # LLM operations
│   │   │   └── pdf_parser.py          # PDF/DOCX parsing
│   │   ├── database.py        # Database configuration
│   │   └── models.py          # SQLAlchemy models
│   ├── prompts/               # LLM prompt templates
│   ├── main.py                # Main FastAPI application
│   ├── run_server.py          # Development server runner
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # Entry point
│   └── package.json           # Node dependencies
├── crawl_cache/               # Cached website content
├── cv_cache/                  # Cached CV extractions
├── match_log/                 # Match analysis logs
└── metadata/                  # Structured report JSONs
```

## 🔧 Development

### Testing the Crawler

You can test the Crawl4AI service independently:

```bash
cd backend/app/services
python crawl4ai_service.py
```

Modify the `test_url` variable in the `main()` function to test with different websites.

### Database Operations

The system uses SQLite by default. Database operations are handled through:
- `database_operations.py`: Helper functions for database queries
- Automatic table creation on first run

### Caching System

The application implements multi-level caching:
- **CV Cache**: Stores extracted CV data by file hash
- **Professor Profile Cache**: Stores crawled website content
- **Analysis Cache**: Stores professor analysis reports (invalidated on profile changes)

## 🛡️ Security Features

- **URL Validation**: Only accepts HTTPS URLs from public domains
- **File Size Limits**: Maximum 5MB for CV uploads
- **Input Sanitization**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 📊 Performance Optimizations

- **Parallel Processing**: CV and professor profile processing run concurrently
- **Combined LLM Calls**: Reduced from 5 to 3 maximum LLM calls per analysis
- **Intelligent Caching**: Reduces redundant API calls and processing
- **Retry Logic**: Handles rate limits with exponential backoff

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Crawling failed" error
- **Solution**: Ensure the URL is a valid HTTPS public domain. Check Crawl4AI dependencies are installed.

**Issue**: "Rate limit" errors
- **Solution**: The system automatically retries with exponential backoff. Check your API key limits.

**Issue**: Frontend can't connect to backend
- **Solution**: Ensure backend is running on port 7878 and CORS is properly configured.

**Issue**: Database errors
- **Solution**: Check file permissions for SQLite database. Delete `professors.db` to reset.


---

**Note**: This application requires an OpenAI-compatible API key. Make sure to configure your API credentials in the `.env` file before use.

