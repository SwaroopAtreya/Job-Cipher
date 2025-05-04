export type JobSource = "LinkedIn Jobs" | "Naukri Jobs" | "CareerJet Jobs";

export interface JobResults {
  "LinkedIn Jobs": JobItem[];
  "Naukri Jobs": JobItem[];
  "CareerJet Jobs": JobItem[];
  
}

export interface JobItem {
  Title?: string;
  Company?: string;
  Location?: string;
  Description?: string;
  Salary?: string;
  WorkMode?: string;
  id?: string;
  Date?: string;
  Url?: string;
  Experience?: string;
  
  JobTitle?: string;
  CompanyName?: string;
  Rating?: string;
  TechStack?: string;
  JobLink?: string;
  JobPostingLink?: string;
  TimePosted?: string;
  CompanyLink?: string;
  [key: string]: string;
}

export interface JobData {
  name: string;
  branch: string;
  college: string;
  keyword: string;
  location: string;
  experience: number;
  job_type: string;
  remote: string;
  date_posted: string;
  company: string;
  industry: string;
  ctc_filters: string;
  radius: string;
}

export interface JobFilterValues {
  experience: number;
  job_type: string;
  remote: string;
  date_posted: string;
  company: string;
  industry: string;
  ctc_filters: string;
  radius: string;
  keyword: string;
  location: string;
}

