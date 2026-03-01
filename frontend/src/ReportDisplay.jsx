import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FitRadarChart } from './components/RadarChart';
import { ScoreCard } from './components/ScoreCard';
import { EmailTemplateCard } from './components/EmailTemplateCard';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Target, 
  User, 
  GraduationCap, 
  Microscope,
  Building2,
  Users,
  Mail,
  BookOpen,
  ArrowUpRight,
  ArrowLeft,
  Printer
} from 'lucide-react';

const ReportDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.reportData;

  // If no report data, redirect back
  if (!reportData) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  // Helper for status icons
  const StatusIcon = ({ type }) => {
    switch (type) {
      case 'positive': return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'negative': return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
      default: return <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />;
    }
  };

  const SectionHeader = ({ title, icon: Icon, subtitle }) => (
    <div className="mb-6 border-b border-slate-100 pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          header {
            position: static !important;
            page-break-after: avoid;
          }
          section {
            page-break-inside: avoid;
          }
          .bg-slate-50 {
            background: white !important;
          }
          .shadow-sm, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }
          a {
            color: black !important;
            text-decoration: none !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:static">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors print:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Mentor Match Report</h1>
              <p className="text-xs text-slate-500">Generated {new Date(reportData.meta.generated).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm print:hidden"
              title="Print as PDF"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Print PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        
        {/* Executive Summary Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div>
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Analysis Complete
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Compatibility Report
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Evaluation of research fit, lab culture alignment, and potential mentorship dynamics for the <strong>{reportData.professorProfile.lab}</strong>.
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100 min-w-[200px]">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray={`${(reportData.meta.overallScore / 5) * 100}, 100`}
                    className="drop-shadow-sm transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-slate-900">{reportData.meta.overallScore}</span>
                  <span className="text-xs text-slate-500 font-medium">OUT OF 5</span>
                </div>
              </div>
              <div className="mt-3 font-semibold text-indigo-700">Strong Match</div>
            </div>
          </div>
        </section>

        {/* PROFESSOR ANALYSIS SECTION */}
        <section className="scroll-mt-24">
          <SectionHeader 
            title="Professor Analysis" 
            icon={User} 
            subtitle="Profile, Lab Context, and Research Activity"
          />
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column: Context & Status */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl border border-slate-200 shrink-0">
                    {reportData.professorProfile.imageInitials}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 truncate">{reportData.professorProfile.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{reportData.professorProfile.title}</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm flex-1">
                  <div className="flex gap-3">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="block font-semibold text-slate-700">Institution</span>
                      <span className="text-slate-600 block truncate" title={reportData.professorProfile.institution}>{reportData.professorProfile.institution}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Microscope className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-700">Lab</span>
                      <span className="text-slate-600">{reportData.professorProfile.lab}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentorship Style */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Users size={18} />
                    <h4 className="font-bold text-sm">Mentorship Style</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {reportData.professorProfile.mentorshipStyle}
                  </p>
              </div>

              {/* Hiring Status */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <GraduationCap size={18} />
                    <h4 className="font-bold text-sm">Hiring Status</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {reportData.professorProfile.currentStatus}
                  </p>
              </div>
            </div>

            {/* Right Column: Research Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Focus Areas */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Research Focus & Venues</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {reportData.professorProfile.focusAreas.map((area, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium border border-indigo-100">
                      {area}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm border-t border-slate-100 pt-4">
                  <span className="text-slate-500 font-medium">Top Venues:</span>
                  {reportData.professorProfile.keyVenues.map((venue, i) => (
                    <span key={i} className="text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                      {venue}
                    </span>
                  ))}
                </div>
              </div>

               {/* Key Readings */}
               <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} />
                    Quick Start Reading List
                  </h4>
                  <span className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 shadow-sm">
                    Essential Reading
                  </span>
                </div>
                
                <div className="space-y-3">
                  {reportData.professorProfile.keyReads.map((paper, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors group cursor-default shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h5 className="font-semibold text-slate-800 text-sm leading-tight mb-1 group-hover:text-indigo-700 transition-colors">
                            {paper.title}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                              {paper.citation}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="italic">{paper.year}</span>
                            {paper.type && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-indigo-500 font-medium">{paper.type}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FIT ANALYSIS SECTION */}
        <section>
          <SectionHeader 
            title="Fit Analysis" 
            icon={Target} 
            subtitle="Compatibility Breakdown across 8 Dimensions"
          />
          
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <FitRadarChart data={reportData.fitDimensions} />
              <div className="mt-4 text-center">
                <span className="text-xs text-slate-400">Dimension Scores (0-5)</span>
              </div>
            </div>

            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {reportData.fitDimensions.map((dim, idx) => (
                <ScoreCard key={idx} dimension={dim} />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-green-50/50 p-4 border-b border-green-100 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <h3 className="font-bold text-green-900 text-sm uppercase tracking-wide">Who Thrives</h3>
               </div>
               <ul className="p-5 space-y-3">
                 {reportData.fitMatrix.thrive.map((item, i) => (
                   <li key={i} className="flex gap-3 text-sm text-slate-700">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Potential Risks</h3>
               </div>
               <ul className="p-5 space-y-3">
                 {reportData.fitMatrix.struggle.map((item, i) => (
                   <li key={i} className="flex gap-3 text-sm text-slate-700">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
           </div>
        </section>

        {/* FLAGS SECTION */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-slate-400" size={20} />
              Key Signals
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 border-b-2 border-green-100 pb-2">Green Flags</h4>
                <ul className="space-y-3">
                  {reportData.flags.green.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 border-b-2 border-amber-100 pb-2">Yellow Flags</h4>
                <ul className="space-y-3">
                   {reportData.flags.yellow.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 border-b-2 border-red-100 pb-2">Red Flags</h4>
                <ul className="space-y-3">
                   {reportData.flags.red.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION PLAN & OUTREACH */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Action Plan */}
          <section className="bg-slate-900 rounded-2xl shadow-lg text-white p-6 sm:p-8 flex flex-col h-full">
            <div className="mb-6">
               <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
                 <Target className="text-indigo-400" size={24} />
                 Action Plan
               </h3>
               <p className="text-indigo-200 text-sm">
                 Verify information gaps before commitment.
               </p>
            </div>
            
            <div className="space-y-4 flex-1">
               <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/5">
                 <h4 className="font-semibold mb-3 text-indigo-300 uppercase text-xs tracking-wider">Verification Questions</h4>
                 <ul className="space-y-3">
                   {reportData.actionPlan.verification.map((item, i) => (
                     <li key={i} className="flex gap-3 items-start text-sm">
                       <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded flex items-center justify-center w-5 h-5 text-xs font-bold mt-0.5 shrink-0">{i + 1}</span>
                       <span className="opacity-90">{item}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="p-4">
                 <h4 className="font-semibold mb-3 text-amber-400 uppercase text-xs tracking-wider">Unknowns</h4>
                 <ul className="space-y-2">
                  {reportData.actionPlan.gaps.slice(0, 3).map((gap, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs opacity-70">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      {gap}
                    </li>
                  ))}
                </ul>
               </div>
            </div>
          </section>

          {/* Outreach */}
          <section className="flex flex-col h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="text-indigo-600" size={24} />
                  Outreach Templates
                </h3>
                <p className="text-sm text-slate-500 mt-1">Recommended outreach strategy.</p>
              </div>
              <div className="space-y-4 flex-1">
                {reportData.emailKit.map((template, idx) => (
                  <EmailTemplateCard key={idx} template={template} />
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="text-center text-slate-400 text-xs py-8 border-t border-slate-200">
          <p>Confidential Match Analysis Report</p>
        </footer>

      </main>
      </div>
    </>
  );
};

export default ReportDisplay;


