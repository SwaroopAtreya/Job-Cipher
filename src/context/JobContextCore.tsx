import { createContext, useContext } from 'react';
import { JobResults } from '@/types/JobTypes';

export interface JobContextType {
  filteredJobs: JobResults | null;
  setFilteredJobs: (jobs: JobResults | null) => void;
  isFilteredResults: boolean;
  setIsFilteredResults: (isFiltered: boolean) => void;
}

export const defaultContext: JobContextType = {
  filteredJobs: null,
  setFilteredJobs: () => {},
  isFilteredResults: false,
  setIsFilteredResults: () => {}
};

export const JobContext = createContext<JobContextType>(defaultContext);

export const useJobContext = () => useContext(JobContext);