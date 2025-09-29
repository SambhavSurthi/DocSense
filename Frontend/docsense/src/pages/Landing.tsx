import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Metrics from '../components/landing/Metrics';
import HowItWorks from '../components/landing/HowItWorks';
import CTA from '../components/landing/CTA';
import Particles from '../components/landing/Particles';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative">
        <Particles />
        <Hero />
      </div>
      <Features />
      <Metrics />
      <HowItWorks />
      <CTA />
    </div>
  );
};

export default Landing;
