import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Link,
  Chip,
  Grid,
  Divider,
  styled,
  IconButton,
  Tooltip,
  Stack,
  alpha
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  OpenInNew as OpenInNewIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { extractResumeInfo, logMessage, parseCSV } from '@/utils/resumeParser';
import JobAlert from './JobAlert';

// Add new color constants
const THEME_COLORS = {
  primaryPurple: '#6B46C1',
  lightPurple: '#9F7AEA',
  darkPurple: '#553C9A',
  ghostPurple: '#E9D8FD',
  purpleGradient: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
  glassmorphism: 'rgba(255, 255, 255, 0.8)',
};

// Enhanced styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    maxWidth: '95%',
  },
  padding: theme.spacing(4),
  '@media (max-width: 600px)': {
    padding: theme.spacing(2),
  },
}));

const AnimatedUploadBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8),
  border: `2px dashed ${THEME_COLORS.primaryPurple}`,
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(THEME_COLORS.primaryPurple, 0.02),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: THEME_COLORS.purpleGradient,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: THEME_COLORS.lightPurple,
    '&:before': {
      opacity: 0.05,
    },
  },
  '@media (max-width: 600px)': {
    padding: theme.spacing(4),
  },
}));

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

// Interface definitions
interface JobCardProps {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  source: string;
}

interface JobItem {
  // LinkedIn specific fields
  Title?: string;
  Company?: string;
  CompanyLink?: string;
  Location?: string;
  TimePosted?: string;
  JobLink?: string;
  Description?: string;

  // Naukri specific fields
  JobTitle?: string;
  CompanyName?: string;
  Rating?: string;
  Experience?: string;
  TechStack?: string;
  JobPostingLink?: string;

  [key: string]: string | undefined;
}

interface JobResults {
  "LinkedIn Jobs": JobItem[];
  "Naukri Jobs": JobItem[];
  "CareerJet Jobs": JobItem[];
}

interface JobData {
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

interface FileUploadProps {
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingResume: boolean;
  resumeUrl: string;
  jobResults: JobResults;
  onJobResultsUpdate: (results: JobResults) => void;
  sources: Array<"LinkedIn Jobs" | "Naukri Jobs" | "CareerJet Jobs">;
  isFilteredResults?: boolean;
  filteredJobs?: JobResults;
}

type JobSource = "LinkedIn Jobs" | "Naukri Jobs" | "CareerJet Jobs";

// Styled components
const Input = styled('input')({
  display: 'none',
});

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
              icon={<BusinessIcon sx={{ fontSize: 16 }} />}
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

const FileUpload: React.FC<FileUploadProps> = ({
  onResumeUpload,
  uploadingResume,
  resumeUrl,
  jobResults,
  onJobResultsUpdate,
  sources,
  isFilteredResults = false,
  filteredJobs
}) => {
  // State declarations
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<JobSource>("LinkedIn Jobs");
  const [fileName, setFileName] = useState<string>('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Utility functions
  const cleanText = (text: string): string => {
    // Remove numeric prefixes like "4.", "5.", etc., and trim whitespace
    return text.replace(/^\d+\.\s*/, '').trim();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: JobSource) => {
    setActiveTab(newValue);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
      } else {
        newSaved.add(jobId);
      }
      return newSaved;
    });
  };

  // Add this function before the handleFileUpload
  const scrapeCareerJetJobs = async (keyword: string, location: string): Promise<JobItem[]> => {
    try {
      const cleanedKeyword = keyword.replace(/^\d+\.\s*/, '').trim();
      const cleanedLocation = location.replace(/^\d+\.\s*/, '').trim();

      const response = await fetch(
        `http://localhost:3000/api/careerjet?keyword=${encodeURIComponent(cleanedKeyword)}&location=${encodeURIComponent(cleanedLocation)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch CareerJet jobs: ${response.status}`);
      }

      const jobs = await response.json();

      if (!Array.isArray(jobs)) {
        throw new Error('Invalid response format from CareerJet API');
      }

      return jobs.map((job) => ({
        Title: job.Title,
        Company: job.Company,
        Location: job.Location,
        Description: job.Description,
        JobLink: job.JobLink,
        TimePosted: job.TimePosted
      }));
    } catch (error) {
      console.error('Error fetching CareerJet jobs:', error);
      return [];
    }
  };

  // File upload handler
  const [filters, setFilters] = useState({ keyword: '', location: '' });

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError('');
    setStatus('Uploading and Extracting Information...');
    // Reset previous results

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Clear any filtered state when uploading a new resume
      setIsFiltering(false);
      
      const extractResponse = await fetch('http://13.203.209.210:5001/extract', {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error(`Resume extraction failed! Status: ${extractResponse.status}`);
      }

      const parsedData = await extractResponse.json();
      logMessage("Extracted Data: " + JSON.stringify(parsedData, null, 2));

      if (!parsedData.extracted_info) {
        throw new Error('No information could be extracted from the resume');
      }

      // Use the new extractResumeInfo function
      const resumeInfo = extractResumeInfo(parsedData.extracted_info);
      logMessage("Parsed Resume Info: " + JSON.stringify(resumeInfo, null, 2));

      const jobData: JobData = {
        name: resumeInfo.name,
        branch: resumeInfo.branch,
        college: resumeInfo.college,
        keyword: resumeInfo.keyword,
        location: resumeInfo.location,
        experience: parsedData.experience || 0,
        job_type: parsedData.job_type || 'fulltime',
        remote: parsedData.remote || 'on-site',
        date_posted: parsedData.date_posted || 'week',
        company: parsedData.company || '',
        industry: parsedData.industry || '',
        ctc_filters: parsedData.ctc_filters || '',
        radius: parsedData.radius || '10'
      };

      setStatus('Searching for Jobs...');

      // Update this section in handleFileUpload
      const [mainJobsResponse, careerjetResults] = await Promise.all([
        fetch('http://13.203.209.210:5000/job-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        }).then(res => res.json()),
        scrapeCareerJetJobs(jobData.keyword, jobData.location)
      ]);

      // Combine all results
      const combinedResults: JobResults = {
        "LinkedIn Jobs": parseJobsToJson(mainJobsResponse["LinkedIn Jobs"] || ''),
        "Naukri Jobs": parseJobsToJson(mainJobsResponse["Naukri Jobs"] || ''),
        "CareerJet Jobs": careerjetResults
      };

      console.log("Combined results:", {
        LinkedIn: combinedResults["LinkedIn Jobs"].length,
        Naukri: combinedResults["Naukri Jobs"].length,
        CareerJet: combinedResults["CareerJet Jobs"].length
      });

      onJobResultsUpdate(combinedResults);
      setStatus('Job Search Successful!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      logMessage('Error: ' + errorMessage);
    } finally {
      setLoading(false);
      // Reset file input
      const fileInput = document.getElementById('contained-button-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }, [onJobResultsUpdate]);

  // Parse CSV to JSON with platform-specific handling
  const parseJobsToJson = (csvString: string): JobItem[] => {
    try {
      const rows = parseCSV(csvString);
      if (rows.length < 2) return [];

      const headers = rows[0];
      return rows.slice(1).map(values => {
        const jobItem: JobItem = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            // Map CSV headers to our JobItem interface
            const value = values[index];
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
              case 'job posting link':
                jobItem.JobLink = value;
                jobItem.JobPostingLink = value;
                break;
              case 'rating':
                jobItem.Rating = value;
                break;
              case 'experience':
                jobItem.Experience = value;
                break;
              case 'tech stack':
              case 'skills':
                jobItem.TechStack = value;
                break;
              default:
                jobItem[header] = value;
            }
          }
        });
        return jobItem;
      });
    } catch (error) {
      logMessage('Error parsing CSV: ' + (error instanceof Error ? error.message : String(error)));
      return [];
    }
  };

  // Render job card based on platform
  const renderJobCard = (job: JobItem, source: string) => {
    const title = job.Title || job.JobTitle || '';
    const company = job.Company || job.CompanyName || '';
    const location = job.Location || '';
    const description = job.Description || '';
    const url = job.JobLink || job.JobPostingLink || '';

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

  // Modified handleJobSearch to set isFiltering flag to true when filtering
  const handleJobSearch = async (jobData: JobData) => {
    try {
      setIsFiltering(true);
      setStatus('Applying filters...');
      
      const mainResults = await fetch('http://13.203.209.210:5000/job-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      }).then(res => res.json());

      const combinedResults: JobResults = {
        "LinkedIn Jobs": mainResults["LinkedIn Jobs"] || [],
        "Naukri Jobs": mainResults["Naukri Jobs"] || [],
        'CareerJet Jobs': []
      };

      console.log('Filtered results:', combinedResults);
      onJobResultsUpdate(combinedResults);
      setStatus('Filter applied successfully!');
    } catch (error) {
      console.error('Error filtering jobs:', error);
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  // This determines which job results to display based on filtering state
  const displayResults = isFilteredResults && filteredJobs ? filteredJobs : jobResults;

  // Effects to manage loading state when filtering
  useEffect(() => {
    if (isFiltering) {
      setLoading(true);
    }
  }, [isFiltering]);

  // Component render
  return (
    <StyledContainer>
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Title with JobAlert */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #6B46C1 30%, #9F7AEA 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0, // Remove bottom margin since we're using flex container
            }}
          >
            Resume Upload & Job Search
          </Typography>
          <JobAlert
            keyword={filters.keyword}
            location={filters.location}
          />
        </Box>

        {/* Rest of the existing code remains unchanged */}
        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 4 },
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
              }}
            >
              <label htmlFor="contained-button-file">
                <Input
                  accept="application/pdf"
                  id="contained-button-file"
                  type="file"
                  onChange={handleFileUpload}
                />
                <AnimatedUploadBox
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#6B46C1' }} />
                  <Typography variant="h6" sx={{ color: '#6B46C1' }}>
                    Drop your resume here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports PDF format up to 10MB
                  </Typography>
                </AnimatedUploadBox>
              </label>

              {/* Status and Progress */}
              <Box sx={{ mt: 3 }}>
                {fileName && (
                  <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 2 }}
                  >
                    {fileName} uploaded successfully
                  </Alert>
                )}

                {loading && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CircularProgress
                      size={40}
                      thickness={4}
                      sx={{ color: '#6B46C1' }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      {status}
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Job Results Section */}
          {(Object.values(displayResults).some(jobs => jobs.length > 0)) && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  mt: 3
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#6B46C1',
                    },
                    '& .Mui-selected': {
                      color: '#553C9A',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#6B46C1',
                    },
                  }}
                >
                  {sources.map((source) => (
                    <Tab
                      key={source}
                      label={`${source} (${displayResults[source]?.length || 0})`}
                      value={source}
                    />
                  ))}
                </Tabs>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={2}>
                    {displayResults[activeTab]?.length > 0 ? (
                      displayResults[activeTab].map((job, index) => (
                        <Grid item xs={12} key={`${activeTab}-${index}`}>
                          {renderJobCard(job, activeTab)}
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                          <Typography variant="h6">
                            {isFiltering 
                              ? "No matching jobs found for your filters" 
                              : `No jobs found for ${activeTab}`}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </StyledContainer>
  );
};

export default FileUpload;