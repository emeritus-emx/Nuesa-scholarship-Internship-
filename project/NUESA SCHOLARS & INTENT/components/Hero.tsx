
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Search, Quote, ChevronLeft, ChevronRight, Award, Globe, Briefcase, Users } from 'lucide-react';
import { ViewState } from '../types';
import { storageService } from '../services/storage';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
}

const beneficiaries = [
  {
    id: 1,
    name: "Chioma Okoro",
    role: "MSc Public Health",
    award: "Commonwealth Scholarship 2024",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800",
    quote: "I never thought I'd study in the UK fully funded. NUESA made the search effortless.",
    color: "green"
  },
  {
    id: 2,
    name: "David Adeleke",
    role: "Software Engineering Intern",
    award: "Google Africa Developer Intern",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    quote: "Landing an internship at a big tech company seemed impossible until I found the right listing here.",
    color: "orange"
  },
  {
    id: 3,
    name: "Aisha Bello",
    role: "Research Fellow",
    award: "DAAD German Exchange Grant",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    quote: "The detailed application guides helped me secure my research funding in Berlin.",
    color: "green"
  }
];

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitClass, setExitClass] = useState('');
  const recentStudents = storageService.getRecentStudents();

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setExitClass('animate-card-peel');
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % beneficiaries.length);
      setExitClass('');
      setIsAnimating(false);
    }, 700);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setExitClass('animate-card-peel'); // Reverse peel logic could be added but peel works well for both directions here

    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + beneficiaries.length) % beneficiaries.length);
      setExitClass('');
      setIsAnimating(false);
    }, 700);
  };

  const activeStory = beneficiaries[currentSlide];
  const nextStory = beneficiaries[(currentSlide + 1) % beneficiaries.length];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-950 min-h-[95vh] flex items-center transition-colors duration-300">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-orange-100/50 dark:bg-orange-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-green-100/50 dark:bg-green-900/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-0">
                
                <div className="text-left space-y-8 order-2 lg:order-1">
                     <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-full px-4 py-1.5 shadow-sm animate-fade-in">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-green-700 dark:text-green-400 text-sm font-bold uppercase tracking-wider">AI Discovery Engine v2.5</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-green-950 dark:text-gray-100 leading-[1.05] tracking-tight">
                        Bridge the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Opportunity</span> Gap.
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
                        The definitive intelligent ecosystem engineered to connect ambitious African talent with life-altering scholarships and career-defining internships.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => onNavigate(ViewState.SCHOLARSHIPS)}
                            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 hover:shadow-2xl shadow-green-200 dark:shadow-none"
                        >
                            <Search className="w-5 h-5 text-green-100" />
                            <span>Explore Scholarships</span>
                        </button>
                        <button 
                            onClick={() => onNavigate(ViewState.INTERNSHIPS)}
                            className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-gray-800 text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-900 px-8 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <span>Browse Internships</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex -space-x-3">
                            {recentStudents.slice(0, 5).map((student, idx) => (
                                <div 
                                  key={idx} 
                                  title={student.name}
                                  className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center bg-cover shadow-sm transition-transform hover:scale-110 hover:z-20" 
                                  style={{backgroundImage: `url(${student.img})`}}
                                ></div>
                            ))}
                            <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 bg-green-600 flex items-center justify-center text-xs text-white font-bold shadow-sm">+2k</div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Active Community Proof</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Join Zainab, Chidi, and 2,400+ others who joined this week.</p>
                        </div>
                    </div>
                </div>

                <div className="relative order-1 lg:order-2 h-[550px] lg:h-[650px] flex items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-contain bg-center bg-no-repeat opacity-50 dark:opacity-20" style={{backgroundImage: 'radial-gradient(circle, rgba(255,237,213,0.4) 0%, rgba(255,255,255,0) 70%)'}}></div>

                    <div className="relative w-full max-w-md mx-auto perspective-1000">
                        
                        {/* THE STACKED EFFECT: PREVIEW OF NEXT CARD */}
                        <div className="absolute top-10 -right-10 w-full h-full bg-white/40 dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100/50 dark:border-gray-700/50 -z-20 blur-sm scale-90 origin-center transition-all duration-1000"></div>
                        <div className="absolute top-6 -right-6 w-full h-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 -z-10 opacity-60 scale-95 origin-bottom-left transition-all duration-1000 overflow-hidden">
                             <img src={nextStory.image} className="w-full h-full object-cover grayscale opacity-20" alt="Next preview" />
                        </div>

                        {/* MAIN ACTIVE CARD */}
                        <div key={activeStory.id} className={`relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transform-gpu ${exitClass || 'animate-card-pop'}`}>
                            <div className="relative h-72 sm:h-80 overflow-hidden group">
                                <img 
                                    src={activeStory.image} 
                                    alt={activeStory.name} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 animate-shutter"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                                    <div className="animate-fade-in-up">
                                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${activeStory.color === 'green' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                            Success Story
                                        </div>
                                        <h3 className="text-white text-3xl font-black">{activeStory.name}</h3>
                                        <p className="text-green-200 text-sm font-medium">{activeStory.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 relative">
                                <div className="absolute -top-7 right-8 w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl shadow-xl flex items-center justify-center transform rotate-6 group-hover:rotate-0 transition-transform">
                                     <Quote className={`w-6 h-6 ${activeStory.color === 'green' ? 'text-green-500' : 'text-orange-500'}`} />
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        {activeStory.color === 'green' ? <Award className="w-5 h-5 text-green-600 mt-1 shrink-0" /> : <Briefcase className="w-5 h-5 text-orange-600 mt-1 shrink-0" />}
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Placement</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{activeStory.award}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 italic text-base leading-relaxed">"{activeStory.quote}"</p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-2">
                                        {beneficiaries.map((_, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-gray-800 dark:bg-gray-200' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                          onClick={handlePrev} 
                                          disabled={isAnimating}
                                          className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button 
                                          onClick={handleNext} 
                                          disabled={isAnimating}
                                          className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Hero;
