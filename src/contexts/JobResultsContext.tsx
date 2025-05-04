import React, { createContext, useState, useContext, ReactNode } from 'react';

interface JobListing {
  title: string;
  company: string;
  location: string;
  salary: string;
  link: string;
  source: 'Naukri' | 'LinkedIn';
  description?: string;
  posted_date?: string;
}

interface JobResultsContextType {
  naukriJobs: JobListing[];
  linkedinJobs: JobListing[];
  setJobResults: (naukriJobs: JobListing[], linkedinJobs: JobListing[]) => void;
}

const JobResultsContext = createContext<JobResultsContextType | undefined>(undefined);

export const JobResultsProvider = ({ children }: { children: ReactNode }) => {
  const [naukriJobs, setNaukriJobs] = useState<JobListing[]>([]);
  const [linkedinJobs, setLinkedinJobs] = useState<JobListing[]>([]);

  const setJobResults = (naukriJobs: JobListing[], linkedinJobs: JobListing[]) => {
    setNaukriJobs(naukriJobs);
    setLinkedinJobs(linkedinJobs);
  };

  return (
    <JobResultsContext.Provider value={{ naukriJobs, linkedinJobs, setJobResults }}>
      {children}
    </JobResultsContext.Provider>
  );
};

export const useJobResults = () => {
  const context = useContext(JobResultsContext);
  if (context === undefined) {
    throw new Error('useJobResults must be used within a JobResultsProvider');
  }
  return context;
};