
import React, { useState } from 'react';
import { FileText, Shield, ChevronRight, Lock, Scale, Info, Cookie, Users, Handshake } from 'lucide-react';

const Legal: React.FC = () => {
  const [audience, setAudience] = useState<'student' | 'partner'>('student');
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies'>('terms');

  const policies = {
    student: {
      terms: (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="text-orange-500" /> 1. Student User Agreement
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing NUESA SCHOLAS, you agree to be bound by these Student Terms. Our platform uses AI to aggregate scholarship data; while we strive for accuracy, we are not responsible for the final award decisions made by 3rd party providers.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="text-orange-500" /> 2. Academic Integrity
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You agree to provide accurate information during registration and scholarship applications. Misrepresentation of CGPA or academic records may lead to permanent account suspension and disqualification from all partner schemes.
            </p>
          </section>
        </div>
      ),
      privacy: (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock className="text-green-500" /> 1. Academic Data Protection
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We collect personal information such as name, email, institution, and CGPA to match you with relevant scholarships. Your academic data is shared with vetted Corporate Partners <strong>only</strong> when you explicitly apply for their schemes.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock className="text-green-500" /> 2. Document Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Uploaded documents (admission letters, IDs) are stored in encrypted buckets and are only accessible by system administrators and the specific sponsors you apply to.
            </p>
          </section>
        </div>
      ),
      cookies: (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Cookie className="text-amber-600" /> 1. Essential Student Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use cookies to maintain your session as a student, allowing you to access your tracker and dashboard without re-logging every time you navigate.
            </p>
          </section>
        </div>
      )
    },
    partner: {
      terms: (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="text-orange-500" /> 1. Corporate Partnership Agreement
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              As a verified Partner/Sponsor, you agree to post only genuine funding or employment opportunities. NUESA SCHOLAS reserves the right to audit your selection process to ensure fairness and transparency for the student body.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="text-orange-500" /> 2. Recruitment Ethics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Partners must not use student contact information for marketing purposes outside the scope of the specific scholarship or internship program for which the student applied.
            </p>
          </section>
        </div>
      ),
      privacy: (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock className="text-green-500" /> 1. Corporate Data Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We collect organizational data including CAC registration numbers and TIN for verification. This data is used solely for the "Know Your Partner" (KYP) vetting process and is never shared with students or 3rd parties.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock className="text-green-500" /> 2. Impact Reporting
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Anonymous data regarding your disbursement volumes may be used in global impact reports to showcase platform effectiveness, but specific corporate financial details remain confidential.
            </p>
          </section>
        </div>
      ),
      cookies: (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Cookie className="text-amber-600" /> 1. Analytics & Admin Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Partnership sessions use advanced analytics cookies to help you track application trends and user engagement with your scholarship posts.
            </p>
          </section>
        </div>
      )
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Legal & Policies</h1>
        <p className="text-gray-500 dark:text-gray-400">Review our operational guidelines tailored to your account type.</p>
      </div>

      {/* Audience Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex gap-1">
          <button 
            onClick={() => setAudience('student')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${audience === 'student' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Users size={18} />
            Student Policies
          </button>
          <button 
            onClick={() => setAudience('partner')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${audience === 'partner' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Handshake size={18} />
            Partner Policies
          </button>
        </div>
      </div>

      {/* Policy Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
        <button 
          onClick={() => setActiveTab('terms')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all min-w-[150px] ${activeTab === 'terms' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Scale size={18} />
          Terms
        </button>
        <button 
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all min-w-[150px] ${activeTab === 'privacy' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Shield size={18} />
          Privacy
        </button>
        <button 
          onClick={() => setActiveTab('cookies')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all min-w-[150px] ${activeTab === 'cookies' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Cookie size={18} />
          Cookies
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 prose prose-slate dark:prose-invert max-w-none">
        <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${audience === 'student' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                Applicable to {audience === 'student' ? 'Students & Applicants' : 'Partners & Sponsors'}
            </span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {activeTab === 'terms' ? 'Terms of Use' : activeTab === 'privacy' ? 'Privacy Statement' : 'Cookie Management'}
            </h3>
        </div>
        
        {policies[audience][activeTab]}
      </div>
      
      <div className="mt-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
        <p>Last updated: October 2023. Version 2.0 (Audience Segmented)</p>
        <p>© NUESA SCHOLAS AND INTERNT Legal Department.</p>
      </div>
    </div>
  );
};

export default Legal;
