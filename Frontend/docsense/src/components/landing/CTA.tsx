import React from 'react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
  return (
    <footer className="relative py-16 md:py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white" id="demo">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">Ready to modernize KMRL documents?</h3>
          <p className="mt-3 text-slate-300">Request a demo or get started now. Built for scale, security, and speed.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/20 transition">Get Started</Link>
            <a href="mailto:contact@docsense.example" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold transition">Contact</a>
          </div>
          <div className="mt-10 text-xs text-slate-400">© {new Date().getFullYear()} DocSense. Built for Kochi Metro.</div>
        </div>
      </div>
    </footer>
  );
};

export default CTA;


