import React from 'react';
import { motion } from 'framer-motion';

const metrics = [
  { label: 'Faster Turnaround', value: '75%', note: 'document processing speed' },
  { label: 'Regulatory Accuracy', value: '99.9%', note: 'automated compliance checks' },
  { label: 'Time Saved', value: '40%', note: 'reduction in manual effort' },
  { label: 'Knowledge Retained', value: '100%', note: 'institutional insights preserved' },
];

const Metrics: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-950 text-white" id="metrics">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold">Impact Metrics</h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">Outcomes when AI handles the document overload.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-6 bg-white/5 border border-white/10 text-center backdrop-blur-md"
            >
              <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-cyan-300 to-fuchsia-300">
                {m.value}
              </div>
              <div className="mt-2 text-sm text-slate-300">{m.label}</div>
              <div className="text-xs text-slate-400">{m.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;


