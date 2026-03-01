import React, { useState } from 'react';
import { EmailTemplate } from '../types';
import { Copy, Check } from 'lucide-react';

interface Props {
  template: EmailTemplate;
}

export const EmailTemplateCard: React.FC<Props> = ({ template }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
          {template.label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
      <div className="p-4 sm:p-6 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
        <div className="mb-4 pb-4 border-b border-slate-100">
          <span className="font-bold text-slate-900">Subject:</span> {template.subject}
        </div>
        {template.body}
      </div>
    </div>
  );
};
