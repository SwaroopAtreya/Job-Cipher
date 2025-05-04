import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  FormControl, 
  SelectChangeEvent,
  TextField, 
  Button, 
  Box,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Chip,
  Stack,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Link,
  alpha,
  styled
} from '@mui/material';
import { 
  WorkOutline as JobIcon,
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  Timeline as ExperienceIcon,
  Category as IndustryIcon,
  CurrencyRupee as SalaryIcon,
  MyLocation as RadiusIcon,
  WorkspacePremium as WorkModeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as ExpandIcon,
  AccessTime as AccessTimeIcon,
  OpenInNew as OpenInNewIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { JobItem, JobResults, JobSource } from '@/types/JobTypes';

// Add utility functions from jobFilters.ts
const createSearchRegex = (searchTerm: string): RegExp => {
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm, 'i');
};

// Helper function to parse CSV data
const parseCSVData = (csvData: string, source: string): JobItem[] => {
  if (!csvData) return [];
  
  // Split the CSV data into lines
  const lines = csvData.split('\r\n');
  if (lines.length <= 1) return [];
  
  // Extract headers and data rows
  const headers = lines[0].split(',');
  const dataRows = lines.slice(1).filter(line => line.trim() !== '');
  
  return dataRows.map(row => {
    const values = row.split(',');
    const jobItem: JobItem = {};
    
    // Map CSV columns to JobItem properties
    headers.forEach((header, index) => {
      const value = values[index];
      if (value === undefined) return;
      
      switch (header.toLowerCase()) {
        case 'job title':
        case 'title':
          jobItem.Title = value;
          jobItem.JobTitle = value;
          break;
        case 'company':
        case 'company name':
          jobItem.Company = value;
          jobItem.CompanyName = value;
          break;
        case 'company link':
          jobItem.CompanyLink = value;
          break;
        case 'location':
          jobItem.Location = value;
          break;
        case 'time posted':
        case 'posted':
          jobItem.TimePosted = value;
          break;
        case 'job link':
          jobItem.JobLink = value;
          jobItem.Url = value;
          break;
        case 'description':
          jobItem.Description = value;
          break;
        default:
          // Handle other fields
          jobItem[header] = value;
      }
    });
    
    return jobItem;
  });
};

const getJobProperty = (job: JobItem, propertyNames: string[]): string => {
  for (const name of propertyNames) {
    if (name in job && job[name as keyof JobItem]) {
      return String(job[name as keyof JobItem]).toLowerCase();
    }
  }
  return '';
};

const extractNumericValue = (value: string | number | undefined): number => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  const numericValue = value.replace(/[^0-9.]/g, '');
  return numericValue ? parseFloat(numericValue) : 0;
};

const filterJobs = (jobs: JobItem[], filters: JobFilterValues): JobItem[] => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }

  return jobs.filter(job => {
    const jobTitle = getJobProperty(job, ['Title', 'title', 'JobTitle', 'job_title']);
    const jobCompany = getJobProperty(job, ['Company', 'company', 'CompanyName', 'company_name']);
    const jobLocation = getJobProperty(job, ['Location', 'location']);
    const jobDescription = getJobProperty(job, ['Description', 'description']);
    const jobType = getJobProperty(job, ['job_type', 'type', 'JobType']);
    const jobWorkMode = getJobProperty(job, ['remote', 'WorkMode', 'work_mode', 'workplace_type']);
    
    const jobExperience = extractNumericValue(
      job.experience || job.Experience || job.years_of_experience || '0'
    );
    
    const jobSalary = extractNumericValue(
      job.salary || job.Salary || job.ctc || job.CTC || '0'
    );

    // Apply filters
    if (filters.keyword) {
      const keywordRegex = createSearchRegex(filters.keyword);
      if (!keywordRegex.test(jobTitle) && 
          !keywordRegex.test(jobCompany) && 
          !keywordRegex.test(jobDescription)) {
        return false;
      }
    }

    if (filters.location && filters.location.trim() !== '') {
      const locationRegex = createSearchRegex(filters.location);
      if (!locationRegex.test(jobLocation)) {
        return false;
      }
    }

    if (filters.company && filters.company.trim() !== '') {
      const companyRegex = createSearchRegex(filters.company);
      if (!companyRegex.test(jobCompany)) {
        return false;
      }
    }

    if (filters.experience > 0) {
      if (jobExperience === 0 || jobExperience > filters.experience) {
        return false;
      }
    }

    if (filters.job_type && filters.job_type !== '') {
      const jobTypeRegex = createSearchRegex(filters.job_type);
      if (!jobTypeRegex.test(jobType)) {
        return false;
      }
    }

    if (filters.remote && filters.remote !== '') {
      const remoteRegex = createSearchRegex(filters.remote);
      if (!remoteRegex.test(jobWorkMode)) {
        return false;
      }
    }

    if (filters.ctc_filters && filters.ctc_filters.trim() !== '') {
      const minSalary = parseFloat(filters.ctc_filters);
      if (!isNaN(minSalary) && minSalary > 0 && jobSalary < minSalary) {
        return false;
      }
    }

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

// Theme colors for styling
const THEME_COLORS = {
  primaryPurple: '#6B46C1',
  lightPurple: '#9F7AEA',
  darkPurple: '#553C9A',
  ghostPurple: '#E9D8FD',
  purpleGradient: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
  glassmorphism: 'rgba(255, 255, 255, 0.8)',
};

// Interface for JobCard props
interface JobCardProps {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  source: string;
}

// Styled components for job cards
const StyledJobCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'visible',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: alpha(THEME_COLORS.primaryPurple, 0.1),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(THEME_COLORS.primaryPurple, 0.15)}`,
    borderColor: THEME_COLORS.primaryPurple,
    '& .MuiCardActions-root': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const JobDetail = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

// Job Card Component
const JobCard: React.FC<JobCardProps> = ({ title, company, location, description, url, source }) => (
  <StyledJobCard elevation={0}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box flex={1}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: THEME_COLORS.darkPurple,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            <Chip
              icon={<CompanyIcon sx={{ fontSize: 16 }} />}
              label={company}
              size="small"
              sx={{
                backgroundColor: alpha(THEME_COLORS.primaryPurple, 0.08),
                color: THEME_COLORS.darkPurple,
                '&:hover': {
                  backgroundColor: alpha(THEME_COLORS.primaryPurple, 0.12),
                },
              }}
            />
            {location && (
              <Chip
                icon={<LocationIcon sx={{ fontSize: 16 }} />}
                label={location}
                size="small"
                sx={{
                  backgroundColor: alpha(THEME_COLORS.lightPurple, 0.08),
                  color: THEME_COLORS.darkPurple,
                }}
              />
            )}
          </Stack>
        </Box>
        <Chip
          label={source}
          size="small"
          sx={{
            ml: 2,
            background: THEME_COLORS.purpleGradient,
            color: 'white',
            fontWeight: 500,
            '&:hover': {
              background: THEME_COLORS.purpleGradient,
              opacity: 0.9,
            },
          }}
        />
      </Box>
      {description && (
        <Typography
          variant="body2"
          sx={{
            color: alpha('#000', 0.7),
            mt: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}
    </CardContent>
    <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
      <Button
        variant="contained"
        size="medium"
        endIcon={<OpenInNewIcon />}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          background: THEME_COLORS.purpleGradient,
          borderRadius: '50px',
          textTransform: 'none',
          px: 4,
          py: 1,
          fontWeight: 500,
          '&:hover': {
            background: THEME_COLORS.purpleGradient,
            opacity: 0.9,
            transform: 'translateY(-2px)',
          },
        }}
      >
        Apply Now
      </Button>
      <Button
        variant="outlined"
        size="medium"
        sx={{
          borderRadius: '50px',
          textTransform: 'none',
          px: 4,
          py: 1,
          borderColor: THEME_COLORS.primaryPurple,
          color: THEME_COLORS.primaryPurple,
          fontWeight: 500,
          '&:hover': {
            borderColor: THEME_COLORS.darkPurple,
            backgroundColor: alpha(THEME_COLORS.primaryPurple, 0.04),
          },
        }}
      >
        Save Job
      </Button>
    </CardActions>
  </StyledJobCard>
);

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

interface JobFiltersProps {
  onFilteredJobsUpdate: (results: JobResults) => void; // Only need this prop
  onResetFilters: () => void;
  filters: JobFilterValues;
  onFilterChange: (filters: JobFilterValues) => void;
  isLoading?: boolean;
  jobResults: JobResults; // Add jobResults prop
}

const JobFilters: React.FC<JobFiltersProps> = ({
  onFilteredJobsUpdate,
  onResetFilters,
  filters,
  onFilterChange,
  isLoading,
  jobResults
}) => {
  // Local state for filtered jobs
  const [filteredJobs, setFilteredJobs] = useState<JobResults | null>(null);
  const [isFilteredResults, setIsFilteredResults] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<JobSource>("LinkedIn Jobs");

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validation rules for specific fields
    let sanitizedValue = value;
    
    switch (name) {
      case 'experience':
        sanitizedValue = value.replace(/[^0-9]/g, '');
        break;
      case 'ctc_filters':
        sanitizedValue = value.replace(/[^0-9.]/g, '');
        break;
      case 'radius':
        sanitizedValue = value.replace(/[^0-9]/g, '');
        break;
      case 'keyword':
      case 'location':
      case 'company':
      case 'industry':
        // Allow letters, numbers, spaces, and basic punctuation
        sanitizedValue = value.replace(/[^a-zA-Z0-9\\s.,&-]/g, '');
        break;
    }
  
    onFilterChange({
      ...filters,
      [name]: name === 'experience' ? Number(sanitizedValue) : sanitizedValue,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  // Enhanced filter validation function
  const validateFilters = (filters: JobFilterValues): boolean => {
    // Check if any filter has invalid values
    if (
      (filters.experience && isNaN(Number(filters.experience))) ||
      (filters.ctc_filters && isNaN(Number(filters.ctc_filters))) ||
      (filters.radius && isNaN(Number(filters.radius)))
    ) {
      return false;
    }
    return true;
  };

  // Apply filters and pass filtered jobs to parent
  const handleApplyFilters = async () => {
    if (!validateFilters(filters)) {
      console.error('Invalid filter values');
      return;
    }

    try {
      console.log('Sending filter request with data:', filters);
      
      const response = await fetch('http://13.203.209.210:5000/job-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch filtered jobs: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      // Check if the response has the expected structure
      let linkedinJobs = [];
      let naukriJobs = [];
      let careerjetJobs = [];
      
      // Parse LinkedIn Jobs if available
      if (data["LinkedIn Jobs"] && typeof data["LinkedIn Jobs"] === 'string') {
        linkedinJobs = parseCSVData(data["LinkedIn Jobs"], "LinkedIn");
      } else if (data.linkedinJobs) {
        linkedinJobs = data.linkedinJobs;
      }
      
      // Parse Naukri Jobs if available
      if (data["Naukri Jobs"] && typeof data["Naukri Jobs"] === 'string') {
        naukriJobs = parseCSVData(data["Naukri Jobs"], "Naukri");
      } else if (data.naukriJobs) {
        naukriJobs = data.naukriJobs;
      }
      
      // Parse CareerJet Jobs if available
      if (data["CareerJet Jobs"] && typeof data["CareerJet Jobs"] === 'string') {
        careerjetJobs = parseCSVData(data["CareerJet Jobs"], "CareerJet");
      } else if (data.careerjetJobs) {
        careerjetJobs = data.careerjetJobs;
      }

      // Transform and send results to FileUpload through callback
      const transformedResults: JobResults = {
        "LinkedIn Jobs": Array.isArray(linkedinJobs) ? linkedinJobs : [],
        "Naukri Jobs": Array.isArray(naukriJobs) ? naukriJobs : [],
        "CareerJet Jobs": Array.isArray(careerjetJobs) ? careerjetJobs : []
      };
      
      console.log('Transformed filtered results:', {
        LinkedIn: transformedResults["LinkedIn Jobs"].length,
        Naukri: transformedResults["Naukri Jobs"].length,
        CareerJet: transformedResults["CareerJet Jobs"].length
      });

      // Update local state
      setFilteredJobs(transformedResults);
      setIsFilteredResults(true);
      
      // Keep this for backward compatibility
      onFilteredJobsUpdate(transformedResults);
    } catch (error) {
      console.error('Error applying filters:', error);
      // Send empty results in case of error
      const emptyResults = {
        "LinkedIn Jobs": [],
        "Naukri Jobs": [],
        "CareerJet Jobs": []
      };
      
      // Update local state
      setFilteredJobs(emptyResults);
      setIsFilteredResults(true);
      
      // Keep this for backward compatibility
      onFilteredJobsUpdate(emptyResults);
    }
  };

  const handleFilterToggle = (filterName: string) => {
    setActiveFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    );
  };
  
  // Add a function to handle reset that updates the local state
  const handleResetWithContext = () => {
    // Reset the local state
    setIsFilteredResults(false);
    setFilteredJobs(null);
    
    // Call the original reset function
    onResetFilters();
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: JobSource) => {
    setActiveTab(newValue);
  };
  
  // Render job card based on platform
  const renderJobCard = (job: JobItem, source: string) => {
    const title = job.Title || job.JobTitle || '';
    const company = job.Company || job.CompanyName || '';
    const location = job.Location || '';
    const description = job.Description || '';
    const url = job.JobLink || job.JobPostingLink || job.Url || '#';
    
    return (
      <JobCard
        title={title}
        company={company}
        location={location}
        description={description}
        url={url}
        source={source}
      />
    );
  };
  
  // Determine which jobs to display
  const displayResults = isFilteredResults && filteredJobs ? filteredJobs : jobResults;

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3 
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Job Filters
          </Typography>
        </Stack>
        <IconButton 
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ 
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'none'
          }}
        >
          <ExpandIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={2.5}>
          {/* Keyword Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Keyword</Typography>
            </Stack>
            <TextField
              name="keyword"
              value={filters.keyword}
              onChange={handleInputChange}
              placeholder="Job title, skills, etc."
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </FormControl>

          {/* Location Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <LocationIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Location</Typography>
            </Stack>
            <TextField
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </FormControl>

          {/* Experience Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <ExperienceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Experience (Years)</Typography>
            </Stack>
            <TextField
              type="number"
              name="experience"
              value={filters.experience}
              onChange={handleInputChange}
              placeholder="Years of experience"
              size="small"
              InputProps={{ 
                inputProps: { min: 0 },
                sx: { borderRadius: 2 }
              }}
            />
          </FormControl>

          {/* Job Type Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <JobIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Job Type</Typography>
            </Stack>
            <Select
              name="job_type"
              value={filters.job_type}
              onChange={handleSelectChange}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="Full-time">Full Time</MenuItem>
              <MenuItem value="Part-time">Part Time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
            </Select>
          </FormControl>

          {/* Work Mode Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <WorkModeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Work Mode</Typography>
            </Stack>
            <Select
              name="remote"
              value={filters.remote}
              onChange={handleSelectChange}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="on-site">On-Site</MenuItem>
              <MenuItem value="remote">Remote</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>

          {/* Date Posted Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Date Posted</Typography>
            </Stack>
            <Select
              name="date_posted"
              value={filters.date_posted}
              onChange={handleSelectChange}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              
              <MenuItem value="hours">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
            </Select>
          </FormControl>

          {/* Company Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <CompanyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Company</Typography>
            </Stack>
            <TextField
              name="company"
              value={filters.company}
              onChange={handleInputChange}
              placeholder="Company name"
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </FormControl>

          {/* Salary Range Section */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <SalaryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2">Minimum Salary (LPA)</Typography>
            </Stack>
            <TextField
              name="ctc_filters"
              value={filters.ctc_filters}
              onChange={handleInputChange}
              placeholder="Minimum CTC"
              size="small"
              type="number"
              InputProps={{ 
                inputProps: { min: 0 },
                sx: { borderRadius: 2 }
              }}
            />
          </FormControl>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} mt={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleApplyFilters}
              disabled={isLoading}
              startIcon={<SearchIcon />}
              sx={{
                borderRadius: 2,
                py: 1,
                background: 'linear-gradient(45deg, #6B46C1 30%, #9F7AEA 90%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(107, 70, 193, 0.2)',
                }
              }}
            >
              {isLoading ? 'Applying...' : 'Apply Filters'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResetWithContext}
              disabled={isLoading}
              startIcon={<ClearIcon />}
              sx={{
                borderRadius: 2,
                py: 1,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(107, 70, 193, 0.04)',
                }
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Collapse>

      {/* Active Filters Display */}
      <Box sx={{ mt: 2 }}>
        <AnimatePresence>
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== '0' && value !== '') {
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: 'inline-block', margin: '4px' }}
                >
                  <Chip
                    label={`${key.replace('_', ' ')}: ${value}`}
                    onDelete={() => {
                      onFilterChange({
                        ...filters,
                        [key]: key === 'experience' ? 0 : ''
                      });
                    }}
                    sx={{
                      bgcolor: 'rgba(107, 70, 193, 0.1)',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(107, 70, 193, 0.2)',
                      }
                    }}
                  />
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </Box>

      {/* Display filtered jobs */}
      {isFilteredResults && filteredJobs && (
        <Box sx={{ mt: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 500,
              },
            }}
          >
            {Object.keys(filteredJobs).map((source) => (
              <Tab
                key={source}
                label={`${source} (${filteredJobs[source as JobSource]?.length || 0})`}
                value={source}
              />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2}>
              {filteredJobs[activeTab]?.length > 0 ? (
                filteredJobs[activeTab].map((job, index) => (
                  <Grid item xs={12} key={`${activeTab}-${index}`}>
                    {renderJobCard(job, activeTab)}
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or search for different keywords.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default JobFilters;