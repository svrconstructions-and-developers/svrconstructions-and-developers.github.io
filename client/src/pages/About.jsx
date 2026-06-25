import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, History, Heart, Target, GraduationCap, Briefcase, Mail } from 'lucide-react';

export default function About() {
  const team = [
    {
      name: 'R. S. Reddy',
      designation: 'Managing Director & Founder',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
      desc: 'Over 20 years of civil engineering execution experience. Leading the design vision and technical execution frameworks at SVR.'
    },
    {
      name: 'Vikas Sharma',
      designation: 'Chief Structural Engineer',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
      desc: 'Specialized in earthquake-resistant high-rise structures. Oversees blueprint audits and foundation design protocols.'
    },
    {
      name: 'Priya Narang',
      designation: 'Head of Architecture & Design',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
      desc: 'Passionate about integrating luxury aesthetics with sustainable materials. Designs modern spatial layouts for our villas.'
    }
  ];

  const milestones = [
    { year: '2010', title: 'Company Inception', desc: 'Founded SVR with a vision to build safety-first housing modules.' },
    { year: '2014', title: 'Commercial expansion', desc: 'Successfully executed our first multi-story corporate park.' },
    { year: '2019', title: 'Green Building Initiative', desc: 'Adopting sustainable concrete mixes and water harvesting techniques.' },
    { year: '2023', title: 'Smart Cities Integration', desc: 'Partnering with developers to construct IoT-enabled infrastructure projects.' }
  ];

  const achievements = [
    { title: 'Best Premium Builder Award', agency: 'National Construction Council, 2022' },
    { title: 'ISO 9001:2015 Certification', agency: 'Structural Audit Board Compliance' },
    { title: 'Over 2 Million Sq. Ft. Constructed', agency: 'Across Residential & Commercial Spaces' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* 1. Intro & Header */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-gold-500 font-bold tracking-widest text-xs uppercase block">Our Identity</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">SVR Construction & Developers</h1>
          <h4 className="text-lg font-medium text-gold-400">Pioneering structural integrity and design innovation since 2010.</h4>
          <p className="text-slate-300 font-light leading-relaxed">
            Founded with a passion for architectural perfection and clean civil engineering, SVR Construction has grown from a local residential contractor to a highly reputed builder of luxury homes and commercial structures. We bridge high-performance technology with handpicked construction materials to execute works of art.
          </p>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px]">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
            alt="Engineers reviewing prints"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent"></div>
        </div>
      </section>

      {/* 2. Company History Timeline */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <History className="h-8 w-8 text-gold-500 mx-auto" />
          <h2 className="text-3xl font-extrabold text-white">Our Journey</h2>
          <p className="text-sm text-slate-400">Key milestones in the growth of SVR Construction & Developers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {milestones.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl relative border-t-4 border-t-gold-500">
              <span className="text-2xl font-black text-gold-500 block mb-2">{item.year}</span>
              <h4 className="font-bold text-white mb-1 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Vision & Mission Detailed */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-l-gold-500">
          <Target className="h-10 w-10 text-gold-500" />
          <h3 className="text-2xl font-bold text-white">Our Core Mission</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            We deliver building solutions that stand the test of time. By selecting structural steel of highest grades, testing concrete castings in premium laboratories, and maintaining transparency, SVR creates safe spaces where communities grow and companies thrive.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-l-gold-500">
          <Heart className="h-10 w-10 text-gold-500" />
          <h3 className="text-2xl font-bold text-white">Our Vision</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            To define standard guidelines for residential safety and luxury. We visualize a future where every home we construct integrates eco-friendly cooling structures, smart security sensors, and zero carbon footprint engineering designs.
          </p>
        </div>
      </section>

      {/* 4. Management Team */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Leadership Team</h2>
          <p className="text-sm text-slate-400">The experienced minds guiding SVR towards structural excellence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="glass-panel rounded-2xl overflow-hidden flex flex-col items-center text-center p-6 space-y-4 hover:-translate-y-2 transition-luxury">
              <img
                src={member.photo}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-charcoal-800 shadow-lg"
              />
              <div>
                <h4 className="text-lg font-bold text-white">{member.name}</h4>
                <p className="text-xs text-gold-500 font-semibold">{member.designation}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Company Achievements */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Trophy className="h-8 w-8 text-gold-500 mx-auto" />
          <h2 className="text-3xl font-extrabold text-white">Milestones & Achievements</h2>
          <p className="text-sm text-slate-400">Recognitions awarded for SVR engineering standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h4 className="font-bold text-white text-lg">{item.title}</h4>
              <span className="text-xs text-gold-500 font-medium mt-4">{item.agency}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Contact Button Action */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Have a Project in Mind? Let's Talk.</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
          Ready to construct your commercial skyscraper or plan your dream modular home? Contact SVR developers today for a free design consultation.
        </p>
        <div>
          <Link
            to="/contact"
            className="inline-flex items-center space-x-2 bg-gold-500 text-charcoal-950 font-bold px-8 py-3.5 rounded-full hover:bg-gold-400 hover:scale-105 transition-luxury shadow-lg"
          >
            <Mail className="h-5 w-5" />
            <span>Connect with SVR</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
