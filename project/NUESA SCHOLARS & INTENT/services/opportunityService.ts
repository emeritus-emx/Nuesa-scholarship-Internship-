
import { Opportunity } from '../types';

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'NNPC / Chevron JV National University Scholarship',
    provider: 'Chevron Nigeria',
    deadline: '2025-11-30',
    amount: 'N200,000 / Year',
    location: 'Nigeria',
    link: 'https://www.chevron.com',
    type: 'scholarship',
    tags: ['Engineering', 'Business', 'Medical'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    description: 'Annual scholarship program for 200 level students in Nigerian Universities. High CGPA required.',
    verificationTier: 'Admin'
  },
  {
    id: '2',
    title: 'PTDF Overseas Scholarship Scheme',
    provider: 'PTDF',
    deadline: '2025-06-15',
    amount: 'Full Tuition + Stipend',
    location: 'United Kingdom / Germany',
    link: 'https://ptdf.gov.ng',
    type: 'scholarship',
    tags: ['MSc', 'PhD', 'Oil & Gas'],
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
    description: 'Fully funded scholarship for Master and PhD students in specific Oil and Gas related fields.',
    verificationTier: 'Admin'
  },
  {
    id: '3',
    title: 'MTN Foundation Science & Technology Scholarship',
    provider: 'MTN Foundation',
    deadline: '2025-09-01',
    amount: 'N200,000',
    location: 'Nigeria',
    link: 'https://www.mtn.ng/foundation',
    type: 'scholarship',
    tags: ['STEM', 'Undergraduate'],
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
    description: 'Targeted at high performing science and technology students in public tertiary institutions.',
    verificationTier: 'Admin'
  },
  {
    id: '4',
    title: 'Frontend Development Intern',
    provider: 'Paystack',
    deadline: '2025-05-20',
    amount: 'Paid Internship',
    location: 'Lagos (Remote)',
    link: 'https://paystack.com/careers',
    type: 'internship',
    tags: ['Tech', 'Engineering'],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    description: 'Join the engineering team to build payment solutions for Africa. React and TypeScript experience preferred.',
    verificationTier: 'Partner'
  },
  {
    id: '5',
    title: 'Graduate Trainee Program 2025',
    provider: 'UBA Group',
    deadline: '2025-08-10',
    amount: 'Competitive Salary',
    location: 'Pan-African',
    link: 'https://www.ubagroup.com/careers',
    type: 'internship',
    tags: ['Banking', 'Finance'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600',
    description: 'Accelerated career path for fresh graduates with a minimum of 2:1 degree in any discipline.',
    verificationTier: 'Partner'
  },
  {
    id: '6',
    title: 'UNICEF Internship Programme',
    provider: 'UNICEF',
    deadline: '2025-12-01',
    amount: 'Stipend',
    location: 'Abuja / Global',
    link: 'https://www.unicef.org/careers',
    type: 'internship',
    tags: ['NGO', 'Social Work'],
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600',
    description: 'Opportunity for students to acquire direct practical experience in UNICEF\'s work under direct supervision.',
    verificationTier: 'Admin'
  }
];

export const opportunityService = {
  getAll: (): Opportunity[] => {
    return MOCK_OPPORTUNITIES;
  },

  getActive: (type: 'scholarship' | 'internship'): Opportunity[] => {
    const today = new Date();
    return MOCK_OPPORTUNITIES.filter(op => {
      if (op.type !== type) return false;
      if (!op.deadline) return true;
      const dDate = new Date(op.deadline);
      return dDate >= today;
    });
  }
};
