import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Target, Mail, Globe, Shield, BarChart2, Star, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase.ts';
import { useAuth } from '../context/AuthContext.tsx';

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

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all"
  >
    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await signInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error("Auth failed:", error);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-x-hidden selection:bg-blue-500/30">
      <GeometricBackground />
      
      <nav className="fixed top-0 w-full p-6 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-display font-bold tracking-tighter">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            LeadFlow AI
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors font-medium">Features</a>
            <a href="#testimonials" className="text-slate-400 hover:text-white transition-colors font-medium">Testimonials</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors font-medium">Pricing</a>
            <button 
              onClick={handleAuth}
              className="px-6 py-2.5 bg-white text-slate-950 rounded-full font-bold hover:bg-blue-50 transition-all active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-8">
              <Star className="w-4 h-4 fill-blue-400" /> Trusted by 500+ Sales Teams
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold tracking-tight mb-6 md:mb-8 leading-[1.1] md:leading-[1.05] dark:text-white">
              Scale your outreach <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">without the grind.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              The only AI-powered outreach suite that handles lead cleaning, web scraping, and personalized cold emails in one seamless flow.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleAuth}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-500 hover:scale-105 transition-all shadow-2xl shadow-blue-600/40 active:scale-95"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-95">
                Book a Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Everything you need to <span className="text-blue-500">win.</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Stop juggling tools. LeadFlow AI brings your entire sales stack into one professional dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={Globe}
              title="Smart Web Scraping"
              description="Our agents crawl websites to find verified emails and company insights that LinkedIn misses."
            />
            <FeatureCard 
              icon={Target}
              title="AI Lead Enrichment"
              description="Automatically clean and structure messy CSV data. No more broken first names or invalid industries."
            />
            <FeatureCard 
              icon={Mail}
              title="Personalized Sequences"
              description="Gemini-powered email generation that sounds human. High-conversion scripts tailored to every lead."
            />
            <FeatureCard 
              icon={Shield}
              title="Email Validation"
              description="Built-in MX and SMTP checks ensure your bounce rate stays below 1%. Protect your sender reputation."
            />
            <FeatureCard 
              icon={BarChart2}
              title="Orbital Analytics"
              description="Visualize your entire pipeline in real-time. See exactly where leads are converting or dropping off."
            />
            <FeatureCard 
              icon={Zap}
              title="Automated Follow-ups"
              description="Set it and forget it. Our system handles multi-step sequences with intelligent rate limiting."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold mb-8 leading-tight">
                "LeadFlow AI doubled our <br />
                <span className="text-blue-500">meeting volume</span> in 30 days."
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-blue-500/20" />
                <div>
                  <p className="font-bold text-lg">Alex Rivera</p>
                  <p className="text-slate-400">Head of Sales, CloudScale</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { label: "Open Rate", value: "48%" },
                { label: "Reply Rate", value: "12%" },
                { label: "Leads/Mo", value: "5k+" },
                { label: "ROI", value: "10x" }
              ].map((stat, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 text-center">
                  <p className="text-3xl font-display font-bold text-blue-400 mb-1">{stat.value}</p>
                  <p className="text-slate-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-xl font-display font-bold tracking-tighter">
            <Zap className="w-5 h-5 text-blue-500 fill-blue-500" /> LeadFlow AI
          </div>
          <div className="flex gap-8 text-slate-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-slate-600 text-sm">© 2026 LeadFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
