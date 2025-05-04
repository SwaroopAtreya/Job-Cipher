import React, { useState, ReactNode } from 'react';
import { JobResults } from '@/types/JobTypes';
import { JobContext, JobContextType } from './JobContextCore';

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [filteredJobs, setFilteredJobs] = useState<JobResults | null>(null);
  const [isFilteredResults, setIsFilteredResults] = useState(false);

  return (
    <JobContext.Provider value={{ 
      filteredJobs, 
      setFilteredJobs, 
      isFilteredResults, 
      setIsFilteredResults 
    }}>
      {children}
    </JobContext.Provider>
  );
};