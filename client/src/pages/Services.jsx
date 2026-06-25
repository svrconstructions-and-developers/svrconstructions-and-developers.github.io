import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Building2, Factory, Paintbrush, HardHat, ShieldAlert, Award, Compass, Scale, ShieldCheck } from 'lucide-react';
import api from '../services/api';

// Map icon names to Lucide icons
const iconMap = {
  Home: HomeIcon,
  Building2: Building2,
  Factory: Factory,
  Paintbrush: Paintbrush,
  HardHat: HardHat
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/content/services')
      .then((res) => {
        setServices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  const values = [
    { title: 'Material Compliance Audits', text: 'We perform strict slump and compressive strength tests on all concrete castings before pouring.', icon: ShieldCheck },
    { title: 'Licensed Engineering Team', text: 'All design blueprints are signed off by certified structural engineers to ensure structural safety limits are exceeded.', icon: Award },
    { title: 'Safety-First Policy', text: 'We enforce full scaffolding compliance, hardhat rules, and safety harnesses on all high-rise sites.', icon: ShieldAlert },
    { title: 'Precision Planning', desc: 'Detailed scheduling keeps the project timeline synchronized and prevents costly engineering delays.', icon: Compass }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* 1. Page Header */}
      <div className="space-y-4">
        <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Engineering Expertise</span>
        <h1 className="text-4xl font-extrabold text-white">Our Construction Services</h1>
        <p className="text-slate-400 max-w-2xl font-light">From initial architectural sketches to concrete pouring and luxury painting, SVR offers complete building solutions.</p>
      </div>

      {/* 2. Services Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon_name] || HardHat;
            return (
              <div key={service.id} className="glass-panel p-8 rounded-3xl hover:border-gold-500/25 transition-luxury flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="bg-gold-500/10 border border-gold-500/20 text-gold-500 p-4 rounded-2xl w-fit">
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{service.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">{service.description}</p>
                </div>
                <div className="border-t border-charcoal-800 pt-4">
                  <Link to="/contact" className="text-xs text-gold-500 hover:text-gold-400 font-bold tracking-wider uppercase flex items-center gap-1">
                    Get Details & Quote →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SVR Standards (Why Choose Us) */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Our Engineering Standards</h2>
          <p className="text-sm text-slate-400">Strict structural checks that set SVR apart from ordinary builders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl space-y-3">
                <div className="text-gold-500 bg-gold-500/5 p-3.5 rounded-full w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white text-base leading-tight">{v.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{v.text || v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Contact CTA */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 bg-gradient-to-br from-charcoal-900 to-charcoal-950">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Need a Professional Construction Plan?</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
          Get in touch with SVR developers today. We review your land blueprints and offer detailed civil estimations completely free of charge.
        </p>
        <div>
          <Link
            to="/contact"
            className="inline-flex items-center space-x-2 bg-gold-500 text-charcoal-950 font-bold px-8 py-3.5 rounded-full hover:bg-gold-400 hover:scale-105 transition-luxury shadow-lg"
          >
            <span>Request Cost Estimation</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
