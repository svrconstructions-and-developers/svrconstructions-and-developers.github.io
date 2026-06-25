import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Clock, CheckCircle2, ChevronDown, Award, Users, HardHat, Compass, Users2, Sparkles, Building, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Fetch featured projects
    api.get('/api/projects?featured=1')
      .then((res) => setFeaturedProjects(res.data.slice(0, 3)))
      .catch((err) => console.error('Error fetching featured projects:', err));

    // Fetch FAQs
    api.get('/api/content/faqs')
      .then((res) => setFaqs(res.data))
      .catch((err) => console.error('Error fetching FAQs:', err));

    // Fetch Testimonials
    api.get('/api/content/testimonials')
      .then((res) => setTestimonials(res.data))
      .catch((err) => console.error('Error fetching testimonials:', err));
  }, []);

  const stats = [
    { value: '250+', label: 'Projects Completed', icon: Building },
    { value: '180+', label: 'Happy Clients', icon: Users2 },
    { value: '15+', label: 'Years Experience', icon: Clock },
    { value: '45+', label: 'Expert Engineers', icon: HardHat }
  ];

  const coreValues = [
    { title: 'Mission', text: 'To construct high-quality structures with engineering excellence, timely execution, and supreme structural safety.', icon: Compass },
    { title: 'Vision', text: 'To be the most trusted and premium brand in construction, shaping skylines with innovation and sustainable designs.', icon: Award },
    { title: 'Core Values', text: 'Integrity, transparent pricing, zero compromise on material quality, and adherence to safety protocols.', icon: ShieldCheck }
  ];

  const whyChooseUs = [
    { title: 'Uncompromising Quality', desc: 'We select premium materials and enforce strict engineering audit checklists at every stage of casting and fabrication.' },
    { title: 'On-Time Handover', desc: 'Our project managers map out weekly milestones, ensuring residential and commercial properties are completed exactly on schedule.' },
    { title: 'Transparent Costing', desc: 'SVR provides detailed structural estimates. There are zero hidden costs, unexpected fees, or mid-project charges.' },
    { title: 'Integrated Client Portal', desc: 'Log in anytime to see the progress bar, inspect weekly site photographs, and send direct messages to the site supervisor.' }
  ];

  const processSteps = [
    { num: '01', title: 'Consultation & Site Review', desc: 'We study your plot layout, soil report, structural expectations, and custom design preferences.' },
    { num: '02', title: 'Engineering & Quotation', desc: 'Our architects design the structure, and we deliver an itemized, highly transparent cost quote.' },
    { num: '03', title: 'Foundation & Casting', desc: 'Excavation, grading, and building reinforced concrete footing and foundation to withstand load.' },
    { num: '04', title: 'Superstructure framing', desc: 'Casting of pillars, concrete beams, floors, and brickwork masonry to erect the skeleton framework.' },
    { num: '05', title: 'Plumbing, Wiring & Plastering', desc: 'Internal electrical grids, drainage, wall plastering, waterproofing, and window fitting.' },
    { num: '06', title: 'Finishes & Final Handover', desc: 'Painting, luxury flooring installation, sanitary fittings, final inspections, and handing over the keys.' }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80"
            alt="Premium Construction Site"
            className="w-full h-full object-cover scale-105 filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-4 py-1.5 rounded-full text-gold-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="h-3.5 w-3.5" /> Building Luxury Infrastructures
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Crafting Structures With <span className="text-gold-500">Uncompromising Integrity</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light"
          >
            From luxurious residential villas to massive commercial centers, SVR Construction combines innovative architectural designs with robust civil engineering to build structures that last.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/projects"
              className="w-full sm:w-auto bg-gold-500 text-charcoal-950 font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-gold-400 hover:scale-105 transition-luxury text-center"
            >
              Explore Our Projects
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto border border-white/20 hover:border-gold-500 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/5 transition-luxury text-center"
            >
              Consult with Engineers
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Company Overview & Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Who We Are</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Engineering Quality, Defining Landmarks</h2>
            <p className="text-slate-300 leading-relaxed font-light">
              SVR Construction & Developers has built an stellar reputation for outstanding execution of high-quality building projects. Our integration of structural durability and state-of-the-art spatial styling ensures maximum asset longevity and beauty.
            </p>
            <p className="text-slate-400 leading-relaxed font-light">
              Whether executing detailed excavation phases or fitting out premium Italian marble lobbies, we focus on perfection, material specification tracking, and safety compliance.
            </p>
            <div className="pt-2">
              <Link to="/about" className="inline-flex items-center text-gold-500 font-semibold group hover:text-gold-400 transition-luxury">
                Learn more about SVR history <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl flex items-start gap-4">
                  <div className="bg-gold-500/10 border border-gold-500/30 p-3 rounded-xl text-gold-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{val.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{val.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Statistics Section */}
      <section className="bg-charcoal-900 border-y border-charcoal-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-gold-500/5 text-gold-500 mb-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black text-white">{stat.value}</h3>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Our Portfolio</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Featured Showcases</h2>
          </div>
          <Link to="/projects" className="text-gold-500 hover:text-gold-400 font-semibold text-sm transition-luxury flex items-center gap-1">
            Browse all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <p className="text-slate-400">Loading featured projects portfolio...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div key={project.id} className="glass-panel rounded-2xl overflow-hidden group shadow-lg flex flex-col h-full hover:-translate-y-2 transition-luxury">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-charcoal-900/90 text-gold-500 border border-gold-500/20 text-xs px-3 py-1 rounded-full font-semibold">
                    {project.type}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-gold-400 transition-luxury">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400">Client: <span className="text-slate-300 font-semibold">{project.client_name}</span></p>
                    <p className="text-sm text-slate-400 line-clamp-3 font-light leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-charcoal-800 pt-4 text-xs text-slate-400">
                    <span>Date: {project.completion_date}</span>
                    <span className="text-gold-500 font-semibold">★ {project.rating > 0 ? project.rating : 'New'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">The SVR Advantage</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Unmatched Professional Standards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUs.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl hover:border-gold-500/30 transition-luxury flex flex-col justify-between">
              <div className="space-y-4">
                <span className="h-8 w-8 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Construction Process */}
      <section className="bg-charcoal-900/60 border-y border-charcoal-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How We Build Your Dreams</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative glass-panel p-8 rounded-2xl border-l-4 border-l-gold-500 shadow-md">
                <div className="absolute top-4 right-6 text-5xl font-black text-charcoal-800 select-none">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold text-white mb-2 relative z-10">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-light relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="glass-panel rounded-2xl overflow-hidden transition-luxury border border-charcoal-800/80">
              <button
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gold-500 transition-transform duration-300 flex-shrink-0 ${
                    activeFaq === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed font-light border-t border-charcoal-800/40 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Client Reviews</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What Clients Say About SVR</h2>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl max-w-3xl mx-auto border border-dashed border-charcoal-800">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-1">No client reviews available yet.</h4>
            <p className="text-xs text-slate-400">All client project reviews are subjected to supervisor validation checks prior to publication.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="glass-panel p-8 rounded-2xl flex flex-col justify-between space-y-6 relative">
                <span className="text-5xl font-serif text-gold-500/20 absolute top-4 left-4 select-none">“</span>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10 italic">
                  {t.message}
                </p>
                <div className="flex items-center justify-between border-t border-charcoal-800 pt-4">
                  <div>
                    <h5 className="font-bold text-white text-sm">{t.name}</h5>
                    <p className="text-xs text-slate-400">{t.designation}</p>
                  </div>
                  <div className="text-gold-500 font-bold text-xs flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
