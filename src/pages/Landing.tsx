import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Target, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const GeometricBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-500 rounded-full blur-3xl"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 2 + 1,
              opacity: Math.random() * 0.5
            }}
            animate={{
              x: [null, Math.random() * 100 + "%"],
              y: [null, Math.random() * 100 + "%"],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: Math.random() * 400 + 200 + "px",
              height: Math.random() * 400 + 200 + "px",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
    </div>
  );
};

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      <GeometricBackground />
      
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-display font-bold tracking-tighter">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          LeadFlow AI
        </div>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
          <Link to="/dashboard" className="px-6 py-2 bg-white text-slate-950 rounded-full font-medium hover:bg-blue-50 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto text-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 inline-block">
            Next-Gen Outreach is Here
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1]">
            Automate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">entire pipeline</span> with AI.
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            From CSV upload to personalized follow-ups. LeadFlow AI handles the cleaning, scraping, and sending while you close deals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-blue-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/20">
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Globe, label: "Web Scraping" },
            { icon: Target, label: "AI Enrichment" },
            { icon: Mail, label: "Brevo Sending" },
            { icon: Zap, label: "Auto Follow-ups" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
              <item.icon className="w-8 h-8 text-blue-400" />
              <span className="text-slate-300 font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
