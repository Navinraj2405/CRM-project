import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate(); 
  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full flex items-center justify-between px-8 py-5 border-b border-white/10 bg-neutral-950/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MicroCRM</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Pricing</a>
          <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-white transition-colors">Log in</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 flex flex-col items-center text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] opacity-50"></div>
        </div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
            Next-gen sales <br /> at your fingertips.
          </h1>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Manage your leads, track conversions, and close deals faster with our beautifully designed CRM platform tailored for modern teams.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#pricing" className="px-8 py-4 bg-white text-neutral-950 rounded-full font-bold text-lg hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 px-8 bg-neutral-900 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Simple, transparent pricing.</h2>
            <p className="text-lg text-neutral-400">Unlock the full potential of your sales team today.</p>
          </div>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-25 blur-lg group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-neutral-950 rounded-3xl p-10 border border-white/10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Pro Plan</h3>
                  <p className="text-neutral-400 text-sm">Everything you need to grow.</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
                  Most Popular
                </div>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-black text-white">₹99</span>
                <span className="text-neutral-500 ml-2">/month</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {['Unlimited Leads', 'Advanced Analytics', 'Priority Support', 'Custom Integrations'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-neutral-300">
                    <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleGetStarted} 
                className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                Sign up & Try Pro
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
