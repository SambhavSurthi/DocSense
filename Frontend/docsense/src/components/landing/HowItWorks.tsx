import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, Calendar, ShieldCheck, BarChart3 } from 'lucide-react';

const steps = [
  { title: 'Upload', desc: 'Intake via email, WhatsApp, Drive, or API.', icon: Upload },
  { title: 'AI Summarize', desc: 'OCR, translate, and condense to essentials.', icon: Brain },
  { title: 'Deadline Extract', desc: 'Find critical dates and priorities.', icon: Calendar },
  { title: 'Compliance Monitor', desc: 'Rules enforced and alerts triggered.', icon: ShieldCheck },
  { title: 'Insights', desc: 'Surface actions for each role and team.', icon: BarChart3 },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-50" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900">How It Works</h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">From intake to insight—fully automated, fully traceable.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-white">
                  <s.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-slate-900">{s.title}</h4>
              </div>
              <p className="mt-3 text-slate-600 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


