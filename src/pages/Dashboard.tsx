import { useState, useCallback, useEffect, useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUpload from "@/components/dashboard/FileUpload";
import JobFilters from "@/components/dashboard/JobFilters";
import { createTheme, ThemeProvider } from '@mui/material';

import { 
  Alert, 
  Snackbar, 
  Box, 
  Paper, 
  useTheme,
  IconButton,
  Tooltip,
  Typography 
} from '@mui/material';
import { 
  BusinessCenter as BusinessCenterIcon 
} from '@mui/icons-material';
import { JobItem, JobResults } from "@/types/JobTypes";
import CompanyReviews from "@/components/dashboard/CompanyReviews";

import * as cheerio from 'cheerio';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ErrorBoundary from '@/components/ErrorBoundary';
import { JobProvider } from "@/context/JobContext";

// Simplified CareerJet job scraping function
const scrapeCareerJetJobs = async (keyword, location) => {
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
    return jobs;
  } catch (error) {
    console.error('Error fetching CareerJet jobs:', error);
    return [];
  }
};

// Custom theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B46C1', // Purple shade
      light: '#9F7AEA',
      dark: '#553C9A',
    },
    secondary: {
      main: '#ffffff',
      dark: '#f4f4f4',
    },
    background: {
      default: '#F7FAFC',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2D3748',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

const Dashboard = () => {
  const theme = useTheme();
  const { applications, applicationStats, userSkills } = useDashboardData();
  const { handleFileUpload, uploadingResume } = useFileUpload();
  
  // Add state for company reviews visibility
  const [showReviews, setShowReviews] = useState(false);
  
  // State Management
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  
  // Job Results State - Using a single object for all job sources
  const [jobResults, setJobResults] = useState<JobResults>({
    "LinkedIn Jobs": [],
    "Naukri Jobs": [],
    "CareerJet Jobs": []
  });

  // Local state for filtered jobs
  const [filteredJobs, setFilteredJobs] = useState<JobResults | null>(null);
  const [isFilteredResults, setIsFilteredResults] = useState(false);
  
  // Keep track of original jobs for reset functionality
  const [originalJobs, setOriginalJobs] = useState<JobResults>({
    "LinkedIn Jobs": [],
    "Naukri Jobs": [],
    "CareerJet Jobs": []
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    experience: 0,
    job_type: "",
    remote: "",
    date_posted: "",
    company: "",
    industry: "",
    ctc_filters: "",
    radius: "",
    keyword: "",
    location: ""
  });

  // Update originalJobs whenever jobResults changes
  useEffect(() => {
    setOriginalJobs(jobResults);
  }, [jobResults]);

  // Handle resume upload and job search
  const handleResumeUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setStatus('Uploading and Extracting Information...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Extract resume data
      const extractResponse = await fetch('http://13.203.209.210:5001/extract', {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error(`Resume extraction failed! Status: ${extractResponse.status}`);
      }

      const parsedData = await extractResponse.json();

      if (!parsedData.extracted_info) {
        throw new Error('No information could be extracted from the resume');
      }

      setStatus('Searching for Jobs...');

      // Search for jobs with the parsed data
      const mainJobsResponse = await fetch('http://13.203.209.210:5000/job-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      if (!mainJobsResponse.ok) {
        throw new Error(`Job search failed! Status: ${mainJobsResponse.status}`);
      }

      const mainResults = await mainJobsResponse.json();

      // Clean keyword and location for CareerJet
      const cleanedKeyword = parsedData.keyword?.replace(/^\d+\.\s*/, '').trim() || '';
      const cleanedLocation = parsedData.location?.replace(/^\d+\.\s*/, '').trim() || '';
      const careerjetJobs = await scrapeCareerJetJobs(cleanedKeyword, cleanedLocation);

      // Combine all results
      const combinedResults: JobResults = {
        "LinkedIn Jobs": mainResults.linkedinJobs || [],
        "Naukri Jobs": mainResults.naukriJobs || [],
        "CareerJet Jobs": careerjetJobs
      };

      setJobResults(combinedResults);
      setStatus('Job Search Successful!');
      
      // Update resume URL
      handleFileUpload(event, 'resume', (url) => {
        setResumeUrl(url);
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [handleFileUpload]);

  // Update filtered jobs state
  const handleFilteredJobsUpdate = useCallback((results: JobResults) => {
    setFilteredJobs(results);
    setIsFilteredResults(true);
    console.log("Dashboard updated filtered jobs");
  }, []);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      experience: 0,
      job_type: "",
      remote: "",
      date_posted: "",
      company: "",
      industry: "",
      ctc_filters: "",
      radius: "",
      keyword: "",
      location: ""
    });
    // Reset filtered jobs state
    setFilteredJobs(null);
    setIsFilteredResults(false);
  }, []);
  
  // We'll handle loading state differently now
  useEffect(() => {
    // Reset isApplyingFilters after a short delay
    const timer = setTimeout(() => {
      setIsApplyingFilters(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [jobResults]);

  // We no longer need this as the FileUpload component will handle displaying the correct jobs
  // using the JobContext

  return (
    <JobProvider>
      <ThemeProvider theme={theme}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DashboardHeader />
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              lg: '300px 1fr',
            }, 
            gap: 4,
            mt: 4,
            position: 'relative'
          }}>
            {/* Left Sidebar */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 3,
              position: { lg: 'sticky' },
              top: { lg: theme.spacing(3) },
              height: { lg: 'calc(100vh - 100px)' },
              overflowY: { lg: 'auto' },
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}>
              <JobFilters 
                  onFilteredJobsUpdate={handleFilteredJobsUpdate}
                  onResetFilters={handleResetFilters}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  isLoading={isApplyingFilters}
                  jobResults={jobResults}              />
            </Box>

            {/* Main Content */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: { xs: 2, md: 3 },
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}>
              <ErrorBoundary>
                <FileUpload 
                  onResumeUpload={handleResumeUpload}
                  uploadingResume={uploadingResume}
                  resumeUrl={resumeUrl}
                  jobResults={jobResults}  // Always pass the original jobs
                  onJobResultsUpdate={setJobResults}
                  sources={["LinkedIn Jobs", "Naukri Jobs", "CareerJet Jobs"]}
                  // Using values from JobContext
                  isFilteredResults={isFilteredResults}
                  filteredJobs={filteredJobs}
                />
              </ErrorBoundary>
            </Box>

            {/* Company Reviews Button - Fixed Position */}
            <Box
              sx={{
                position: 'fixed',
                right: theme.spacing(4),
                bottom: theme.spacing(4),
                zIndex: 1000,
                transform: 'scale(0.9)',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1)',
                }
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(107, 70, 193, 0.2)',
                  }
                }}
                onClick={() => setShowReviews(!showReviews)}
              >
                <Tooltip title={showReviews ? "Hide Reviews" : "Want Company Reviews?"}>
                  <IconButton sx={{ color: 'white' }} size="large">
                    <BusinessCenterIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{ 
                    mt: 1,
                    color: 'white',
                    fontWeight: 500
                  }}
                >
                  Company Reviews
                </Typography>
              </Paper>
            </Box>

            {/* Company Reviews Panel */}
            {showReviews && (
              <Paper
                elevation={4}
                sx={{
                  position: 'fixed',
                  right: 0,
                  top: 0,
                  width: { xs: '100%', sm: '400px' },
                  height: '100vh',
                  zIndex: 1100,
                  overflowY: 'auto',
                  bgcolor: 'background.paper',
                  boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: showReviews ? 'translateX(0)' : 'translateX(100%)',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CompanyReviews onClose={() => setShowReviews(false)} />
              </Paper>
            )}
          </Box>
        </div>

        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError("")}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setError("")} 
            severity="error"
            sx={{ 
              width: '100%',
              bgcolor: '#FED7D7',
              '& .MuiAlert-icon': {
                color: '#E53E3E'
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Status Snackbar */}
        <Snackbar 
          open={!!status && status !== 'Job Search Successful!'} 
          autoHideDuration={6000} 
          onClose={() => setStatus("")}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            severity="info"
            sx={{ 
              width: '100%',
              bgcolor: '#E9D8FD',
              '& .MuiAlert-icon': {
                color: '#6B46C1'
              }
            }}
          >
            {status}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
    </JobProvider>
  );
};

export default Dashboard;