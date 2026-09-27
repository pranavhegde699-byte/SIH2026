import React from 'react';
import { Building2, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">UdyogSetu</span>
            <span>— Smart Regulatory Planning & Cognitive Compliance Gateway</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield size={14} className="text-emerald-500" />
              <span>Maha Parwana 48-Hr SLA Protocol</span>
            </span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} Government of Maharashtra MSME Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
