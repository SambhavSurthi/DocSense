import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      <div className="absolute -inset-[10%] opacity-40" style={{
        backgroundImage:
          'radial-gradient(60rem 60rem at 10% 10%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(60rem 60rem at 90% 20%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(60rem 60rem at 20% 90%, rgba(34,197,94,0.25), transparent 60%)'
      }} />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 text-white bg-slate-900 overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center text-xs md:text-sm uppercase tracking-widest text-cyan-300/80 bg-white/5 border border-cyan-300/20 px-3 py-1 rounded-full backdrop-blur-md"
          >
            AI for Kochi Metro Rail Limited
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Faster, Smarter Document Management for KMRL
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-slate-200 max-w-2xl"
          >
            AI summaries, predictive compliance, secure access, and role-aware routing. Turn thousands of pages into actionable insights—instantly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/signup" className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/20 transition">
              Get Started
            </Link>
            <a href="#demo" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold transition">
              Request Demo
            </a>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-b from-transparent to-slate-50"
      />
    </section>
  );
};

export default Hero;


