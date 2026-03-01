import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Upload, ArrowRight, Loader2, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [professorReport, setProfessorReport] = useState('');
  const [matchReport, setMatchReport] = useState('');
  const [status, setStatus] = useState('');
  const [statusInfo, setStatusInfo] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Refs for GSAP
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const headerRef = useRef(null);

  // GSAP Entrance Animation
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(headerRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1 }
    )
      .fromTo(formRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      );
  }, { scope: containerRef });

  // Fetch history on component mount
  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/match-reports?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await fetch(`/api/match-reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.refined_report) {
          navigate('/report', { state: { reportData: data.data.refined_report } });
        }
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url || !file) return;

    setLoading(true);
    setResult('');
    setProfessorReport('');
    setMatchReport('');
    setStatus('');
    setStatusInfo('');

    const formData = new FormData();
    formData.append('cv', file);
    formData.append('url', url);

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Helper function to handle complete status
      const handleComplete = (data) => {
        console.log('handleComplete called with data:', {
          hasResult: !!data.result,
          hasProfessorReport: !!data.professor_report,
          hasMatchReport: !!data.match_report,
          hasRefinedReport: !!data.refined_report
        });

        setResult(data.result);
        // If separate reports are provided, use them; otherwise use combined result
        if (data.professor_report && data.match_report) {
          console.log('Using separate reports');
          setProfessorReport(data.professor_report);
          setMatchReport(data.match_report);
        } else {
          console.log('Splitting combined report');
          // Fallback: try to split combined report if it contains the separator
          const parts = data.result.split('\n---\n');
          if (parts.length >= 2) {
            setProfessorReport(parts[0].replace('# Professor & Lab Analysis Report', '').trim());
            setMatchReport(parts.slice(1).join('\n---\n').replace('# Match Analysis Report', '').trim());
          } else {
            setResult(data.result);
          }
        }
        setStatus('COMPLETE');
        setStatusInfo('');
        setLoading(false);
        console.log('Status set to COMPLETE, loading set to false');

        // If refined report is available, navigate to report page
        if (data.refined_report) {
          console.log('Navigating to report page with refined report');
          setTimeout(() => {
            navigate('/report', { state: { reportData: data.refined_report } });
          }, 1000); // Small delay to show completion status
        }
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.status === 'COMPLETE' && data.result) {
                    handleComplete(data);
                    return; // Exit early since we're done
                  }
                } catch (e) {
                  console.error('Failed to parse final status:', e);
                }
              }
            }
          }
          // Stream ended - if we haven't received COMPLETE, there might be an issue
          // But don't set error here as the COMPLETE might have been processed
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status === 'COMPLETE' && data.result) {
                console.log('Received COMPLETE status, processing...');
                handleComplete(data);
                return; // Exit early since we're done
              } else if (data.status === 'ERROR') {
                setResult(`**Error:** ${data.error || 'An error occurred'}`);
                setStatus('ERROR');
                setStatusInfo('');
                setLoading(false);
                return;
              } else if (data.status) {
                // Update status message
                const newStatus = data.message || data.status;
                const newStatusInfo = data.info || '';
                console.log('Updating status:', newStatus, newStatusInfo);
                setStatus(newStatus);
                setStatusInfo(newStatusInfo);
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.error('Failed to parse status update:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setResult('**Error:** Connection failed. Please verify the server status.');
      setStatus('ERROR');
      setStatusInfo('');
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-black selection:bg-black selection:text-white flex flex-col items-center pt-24 pb-12 px-6 font-sans">

      {/* Header Section */}
      <div ref={headerRef} className="max-w-2xl w-full mb-16 space-y-4">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="px-2 py-0.5 border border-black text-xs font-mono uppercase tracking-widest">
            Beta v1.0
          </span>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
          PhDuo<br />
          <span className="text-gray-400">ACADEMIC CONNECT</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-md leading-relaxed">
          AI-driven analysis for academic outreach. Upload your credentials, target a lab, and generate the optimal correspondence.
        </p>
      </div>

      {/* Main Form Area */}
      <div ref={formRef} className="max-w-2xl w-full z-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* URL Input */}
          <div className="group relative">
            <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wide">
              Target URL
            </label>
            <div className="relative flex items-center border-b border-gray-200 focus-within:border-black transition-colors duration-300 py-2">
              <LinkIcon className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="url"
                required
                className="block w-full bg-transparent text-xl outline-none placeholder:text-gray-200 font-medium"
                placeholder="https://lab.university.edu"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          {/* File Upload - Minimalist Box */}
          <div className="group">
            <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wide">
              Curriculum Vitae
            </label>
            <label className={`
              relative flex flex-col items-center justify-center w-full h-32 
              border border-dashed transition-all duration-300 cursor-pointer
              ${file ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
            `}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center space-x-2"
                  >
                    <FileText className="w-6 h-6 text-black" />
                    <p className="text-sm font-medium text-black">{file.name}</p>
                    <CheckCircle className="w-4 h-4 text-gray-400 ml-2" />
                  </motion.div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-3 text-gray-400 group-hover:text-black transition-colors" />
                    <p className="text-sm text-gray-400 group-hover:text-black transition-colors">
                      Drop PDF or Word Document or Click to Browse
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Action Button & Status */}
          <div className="space-y-4">
            <motion.button
              type="submit"
              disabled={loading || !file || !url}
              whileHover={!loading && { scale: 1.01 }}
              whileTap={!loading && { scale: 0.98 }}
              className="w-full relative h-14 bg-black text-white text-sm font-bold tracking-widest uppercase flex items-center justify-center overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <AnimatePresence mode='wait'>
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center space-x-3"
                  >
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Processing</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <span>Analyze Match</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Status Text - Monospace */}
            <div className="min-h-[60px] flex flex-col items-center justify-center space-y-2">
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center space-y-1"
                  >
                    <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                      [{status}]
                    </p>
                    {statusInfo && (
                      <p className="text-xs text-gray-500 italic max-w-md">
                        {statusInfo}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </form>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight mb-2">PREVIOUS REPORTS</h2>
              <p className="text-xs text-gray-400 font-mono">Click to view</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((report) => (
                <motion.button
                  key={report.id}
                  onClick={() => handleViewReport(report.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left p-4 border border-gray-200 hover:border-black transition-colors bg-white group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate group-hover:text-gray-600 transition-colors">
                        {report.professor_name} × {report.student_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 truncate" title={report.professor_url}>
                        {report.professor_url}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-lg font-bold text-black">
                        {report.overall_score !== 'N/A' ? `${report.overall_score}/5` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-black transition-colors">
                      View →
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {loadingHistory && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <p className="text-xs text-gray-400 font-mono">Loading history...</p>
          </div>
        )}
      </div>

      {/* Results Section - Expandable */}
      <AnimatePresence>
        {(result || professorReport || matchReport || loading) && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-2xl w-full mt-16 pt-16 border-t border-gray-200"
          >
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">ANALYSIS REPORT</h2>
              <span className="text-xs font-mono text-gray-400">GENERATED BY AI</span>
            </div>

            {loading ? (
              // Placeholder UI while loading
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mt-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mt-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Professor Report Section */}
                {professorReport && (
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-4 pb-2 border-b border-gray-200">
                      Professor & Lab Analysis
                    </h3>
                    <div className="prose prose-neutral prose-lg max-w-none text-gray-800">
                      <div className="markdown-body font-light">
                        <ReactMarkdown>{professorReport}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Report Section */}
                {matchReport && (
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-4 pb-2 border-b border-gray-200">
                      Match Analysis
                    </h3>
                    <div className="prose prose-neutral prose-lg max-w-none text-gray-800">
                      <div className="markdown-body font-light">
                        <ReactMarkdown>{matchReport}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback: Show combined result if separate reports not available */}
                {!professorReport && !matchReport && result && (
                  <div className="prose prose-neutral prose-lg max-w-none text-gray-800">
                    <div className="markdown-body font-light">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;