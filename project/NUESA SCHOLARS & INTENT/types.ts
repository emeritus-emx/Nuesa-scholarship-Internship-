
export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
  status: 'success' | 'warning' | 'error';
}

export type VerificationTier = 'Admin' | 'Partner' | 'Unverified';

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  deadline?: string;
  amount?: string;
  location?: string;
  link?: string;
  type: 'scholarship' | 'internship';
  tags: string[];
  image?: string;
  description?: string;
  requiredDocuments?: string[]; 
  isVerified?: boolean;
  verificationTier?: VerificationTier;
  reportCount?: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AISearchResult {
  text: string;
  sources: GroundingChunk[];
}

export interface ParsedOpportunity {
  title: string;
  Provider?: string;
  Amount?: string;
  Deadline?: string;
  Summary?: string;
  Link?: string;
}

export interface User {
  name: string;
  email: string;
  role?: 'student' | 'sponsor' | 'admin'; 
  title?: string; 
  contactPerson?: string; 
  profilePicture?: string; 
  lastLogin?: string;
  securityScore?: number;
  sessionExpiry?: number;
  // Bio Data
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  stateOfOrigin?: string;
  bio?: string;
  // Academic Data
  institution?: string;
  faculty?: string;
  department?: string;
  level?: string;
  matricNumber?: string;
  cgpa?: string;
  // Documents
  documents?: Record<string, { name: string; date: string }>;
  // Bank Data
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bvn?: string;
}

export interface Sponsorship {
  id: string;
  providerEmail: string;
  providerName: string;
  title: string;
  type: 'Scholarship' | 'Grant' | 'Internship';
  amount: string;
  deadline: string;
  criteria: string;
  slots: number;
  requiredDocuments: string[];
  dateCreated: string;
  link?: string;
}

export interface SavedOpportunity extends ParsedOpportunity {
  id: string;
  dateSaved: string;
  status: 'Applied' | 'Interested' | 'Won';
  type: 'scholarship' | 'internship';
  requiredDocuments?: string[]; 
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'scholarship' | 'internship' | 'bursary' | 'grant' | 'system' | 'security';
  link?: string;
}

export enum ViewState {
  HOME = 'HOME',
  SCHOLARSHIPS = 'SCHOLARSHIPS',
  INTERNSHIPS = 'INTERNSHIPS',
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  AUTH = 'AUTH',
  SPONSORS = 'SPONSORS',
  SETTINGS = 'SETTINGS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  LEGAL = 'LEGAL'
}

export const DOCUMENTS_LIST = [
  "Scholarship Declaration Form",
  "Compliance Declaration Form",
  "Evidence of Consolidated Payment Confirmation Slip",
  "Letter from Community Leader",
  "Short Essay – Reason to Receive the Scholarship",
  "PICFI Scholarship Award Letter",
  "SNEPCo Candidate Data Form",
  "SNEPCo Vendor Form",
  "SNEPCo Bank Details Request Form",
  "SNEPCo Award Recipient Pack",
  "Addax Scholarship Testimonial",
  "SNEPCo Award Acceptance Letter",
  "NAOC Award Completed Forms",
  "SNEPCo Scholarship Award Letter (Endorsed by Registrar or DSA)",
  "SNEPCo Health Insurance Form",
  "Letter of Attestation / Confirmation",
  "AOS Orwell Scholarship Award Letter Acknowledgement",
  "Short Statement to Explain",
  "NYSC Discharge Certificate",
  "Waec Certificate",
  "Birth Certificate",
  "International Passport",
  "Marriage Certificate",
  "Age Declaration Document",
  "Proof of Local Government Area of Origin",
  "Letter of Identification from Community",
  "A’ Level / OND / NCE Certificate",
  "JAMB (UTME) Result",
  "LASSRA Document",
  "LASSRA Registration Card",
  "First School Leaving Certificate",
  "National Identification Number Card (NIN)",
  "Direct Entry Result",
  "Letter of Identification from Community Paramount Ruler",
  "Letter of Identification from Chairman of Community Development or Executive Council (CDC or CEC)",
  "Transcript or Signed Statement of Result"
];
