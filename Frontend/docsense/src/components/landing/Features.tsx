import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Library, BadgePercent, Clock, Database, Bell, MapPin, CameraOff, Download, MessageSquare, NotebookPen, Activity, Bot, FileSearch } from 'lucide-react';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const coreValues: Feature[] = [
  { title: 'Faster, Smarter Decisions', description: 'AI summaries cut review time from hours to minutes.', icon: <Brain className="w-5 h-5" /> },
  { title: 'Zero Compliance Misses', description: 'Automated rule checks and predictive alerts.', icon: <ShieldCheck className="w-5 h-5" /> },
  { title: 'Unified Knowledge Hub', description: 'Centralizes data to retain expertise.', icon: <Library className="w-5 h-5" /> },
  { title: 'Cost & Effort Savings', description: 'Eliminates duplicate work up to 40% time saved.', icon: <BadgePercent className="w-5 h-5" /> },
];

const solutions: Feature[] = [
  { title: 'Role-Based Access', description: 'Granular read/write/delete via admin approvals.', icon: <ShieldCheck className="w-5 h-5" /> },
  { title: 'Automated Intake + OCR', description: 'Email/WhatsApp/Drive merge, OCR, translate.', icon: <Database className="w-5 h-5" /> },
  { title: 'AI Summaries & Deadlines', description: 'Summarize, extract deadlines, route by role.', icon: <Clock className="w-5 h-5" /> },
  { title: 'Priority Dashboard', description: 'High/Moderate/Low triage with planner.', icon: <Bell className="w-5 h-5" /> },
  { title: 'Secure Viewer', description: 'Watermark, no-screenshot, geofencing, audit logs.', icon: <CameraOff className="w-5 h-5" /> },
  { title: 'Controlled Downloads', description: 'Admin-gated downloads with limits.', icon: <Download className="w-5 h-5" /> },
  { title: 'Secure Comms', description: 'Role-based notifications and messaging.', icon: <MessageSquare className="w-5 h-5" /> },
  { title: 'Notes & Guides', description: 'Personal notes and role troubleshooting guides.', icon: <NotebookPen className="w-5 h-5" /> },
  { title: 'AI Monitoring', description: 'Suspicious behavior detection and logs.', icon: <Activity className="w-5 h-5" /> },
  { title: 'AI Assistant', description: 'Chatbot for help and discovery.', icon: <Bot className="w-5 h-5" /> },
  { title: 'Document Requests', description: 'Users can request specific documents.', icon: <FileSearch className="w-5 h-5" /> },
  { title: 'Intelligent Document Twin', description: 'Live data binding to IoT/UNS.', icon: <MapPin className="w-5 h-5" /> },
];

const FeatureCard: React.FC<Feature> = ({ title, description, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.4 }}
    className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-cyan-400/40 to-fuchsia-500/40"
  >
    <div className="h-full rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 p-5 hover:bg-slate-900/70 transition">
      <div className="flex items-center gap-3 text-cyan-300">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          {icon}
        </div>
        <h4 className="text-white font-semibold">{title}</h4>
      </div>
      <p className="mt-3 text-slate-300 text-sm">{description}</p>
    </div>
  </motion.div>
);

const Features: React.FC = () => {
  return (
    <section className="relative py-16 md:py-20 bg-slate-50" id="features">
      <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-slate-50/0 to-slate-50" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900">Why DocSense for KMRL</h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Sleek, secure, and built for complex public infrastructure workflows.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreValues.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


