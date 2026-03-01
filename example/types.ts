export interface FitDimension {
  category: string;
  score: number; // 0-5
  description: string;
}

export interface BulletPoint {
  text: string;
  type: 'neutral' | 'positive' | 'negative' | 'warning';
}

export interface SectionData {
  title: string;
  content: BulletPoint[];
}

export interface EmailTemplate {
  subject: string;
  body: string;
  label: string;
}

export interface ResearchPaper {
  title: string;
  year: string;
  citation: string;
  type: string;
}

export interface ProfessorProfile {
  name: string;
  title: string;
  lab: string;
  institution: string;
  imageInitials: string;
  focusAreas: string[];
  keyVenues: string[];
  mentorshipStyle: string;
  currentStatus: string;
  keyReads: ResearchPaper[];
}

export interface ReportData {
  meta: {
    generated: string;
    professor: string;
    student: string;
    overallScore: number;
  };
  professorProfile: ProfessorProfile;
  executiveSnapshot: SectionData;
  fitDimensions: FitDimension[];
  fitMatrix: {
    thrive: string[];
    struggle: string[];
  };
  flags: {
    green: string[];
    yellow: string[];
    red: string[];
  };
  actionPlan: {
    gaps: string[];
    verification: string[];
  };
  emailKit: EmailTemplate[];
}