import { JobFilterValues } from "@/components/dashboard/JobFilters";
import { JobItem } from "@/types/JobTypes";

/**
 * Creates a case-insensitive regex pattern for searching
 */
const createSearchRegex = (searchTerm: string): RegExp => {
  // Escape special regex characters and create a case-insensitive regex
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm, 'i');
};

/**
 * Safely extracts a text property from a job item, handling different property names
 */
const getJobProperty = (job: JobItem, propertyNames: string[]): string => {
  for (const name of propertyNames) {
    if (name in job && job[name as keyof JobItem]) {
      return String(job[name as keyof JobItem]).toLowerCase();
    }
  }
  return '';
};

/**
 * Extract a numeric value from a string, handling various formats
 */
const extractNumericValue = (value: string | number | undefined): number => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  // Handle salary strings like "12-15 LPA" or "₹12,00,000" or "12 lakhs"
  const numericValue = value.replace(/[^0-9.]/g, '');
  return numericValue ? parseFloat(numericValue) : 0;
};

/**
 * Filters jobs based on the provided filter criteria
 */
export const filterJobs = (jobs: JobItem[], filters: JobFilterValues): JobItem[] => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }

  return jobs.filter(job => {
    // Get job properties, handling various possible property names
    const jobTitle = getJobProperty(job, ['Title', 'title', 'JobTitle', 'job_title']);
    const jobCompany = getJobProperty(job, ['Company', 'company', 'CompanyName', 'company_name']);
    const jobLocation = getJobProperty(job, ['Location', 'location']);
    const jobDescription = getJobProperty(job, ['Description', 'description']);
    const jobType = getJobProperty(job, ['job_type', 'type', 'JobType']);
    const jobWorkMode = getJobProperty(job, ['remote', 'WorkMode', 'work_mode', 'workplace_type']);
    
    // Get numeric values
    const jobExperience = extractNumericValue(
      job.experience || job.Experience || job.years_of_experience || '0'
    );
    
    const jobSalary = extractNumericValue(
      job.salary || job.Salary || job.ctc || job.CTC || '0'
    );

    // Apply filters
    
    // Keyword filter (match title, company, or description)
    if (filters.keyword) {
      const keywordRegex = createSearchRegex(filters.keyword);
      if (!keywordRegex.test(jobTitle) && 
          !keywordRegex.test(jobCompany) && 
          !keywordRegex.test(jobDescription)) {
        return false;
      }
    }

    // Location filter
    if (filters.location && filters.location.trim() !== '') {
      const locationRegex = createSearchRegex(filters.location);
      if (!locationRegex.test(jobLocation)) {
        return false;
      }
    }

    // Company filter
    if (filters.company && filters.company.trim() !== '') {
      const companyRegex = createSearchRegex(filters.company);
      if (!companyRegex.test(jobCompany)) {
        return false;
      }
    }

    // Experience filter
    if (filters.experience > 0) {
      if (jobExperience === 0 || jobExperience > filters.experience) {
        return false;
      }
    }

    // Job type filter
    if (filters.job_type && filters.job_type !== '') {
      const jobTypeRegex = createSearchRegex(filters.job_type);
      if (!jobTypeRegex.test(jobType)) {
        return false;
      }
    }

    // Work mode/Remote filter
    if (filters.remote && filters.remote !== '') {
      const remoteRegex = createSearchRegex(filters.remote);
      if (!remoteRegex.test(jobWorkMode)) {
        return false;
      }
    }

    // Salary/CTC filter
    if (filters.ctc_filters && filters.ctc_filters.trim() !== '') {
      const minSalary = parseFloat(filters.ctc_filters);
      if (!isNaN(minSalary) && minSalary > 0 && jobSalary < minSalary) {
        return false;
      }
    }

    // Industry filter
    if (filters.industry && filters.industry.trim() !== '') {
      const industryRegex = createSearchRegex(filters.industry);
      const jobIndustry = getJobProperty(job, ['industry', 'Industry']);
      if (!industryRegex.test(jobIndustry)) {
        return false;
      }
    }

    return true;
  });
};