import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  Rating,
  Chip,
  Link,
} from '@mui/material';
import { X, Search, Building, ExternalLink, Star } from 'lucide-react';

interface CompanyReviewsProps {
  onClose: () => void;
}

// Update the interface to match the actual AWS response structure
interface ReviewResponse {
  reviews: string;
  links: string;
}

// Update the ReviewData interface to match the actual API response
interface ReviewData {
  review: string;
}

// Add this validation helper
const validateCompanyName = (name: string): boolean => {
  // Regex to allow only letters, spaces, and common company name characters
  const companyNameRegex = /^[a-zA-Z0-9\s&.-]{2,50}$/;
  return companyNameRegex.test(name.trim());
};

// Update the review state type to include description and link
interface ReviewDetails {
  description: string;
  link: string;
}

const CompanyReviews = ({ onClose }: CompanyReviewsProps) => {
  const [companyName, setCompanyName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [review, setReview] = useState<{ AmbitionBox?: ReviewDetails; Glassdoor?: ReviewDetails } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanyName(value);
    if (value === '' || validateCompanyName(value)) {
      setError('');
    } else {
      setError('Please enter a valid company name');
    }
  };

  // Update the handleGetReviews function
  const handleGetReviews = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setLoading(true);
    setError('');
    setReview(null);

    try {
      const response = await fetch('http://13.232.124.175:5002/get_reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: ReviewData = await response.json();
      console.log('Raw response:', data);

      if (!data.review) {
        throw new Error('No review data found');
      }

      // Parse review sources
      const sources = [
        { name: 'AmbitionBox', regex: /AmbitionBox:(.*?)(?=Glassdoor:|$)/s },
        { name: 'Glassdoor', regex: /Glassdoor:(.*?)(?=Link:|$)/s },
      ];

      // Extract links
      const linkRegex = /Link:\s*(https?:\/\/[^\s]+)/g;
      const links: Record<string, string> = {};
      let match;
      while ((match = linkRegex.exec(data.review)) !== null) {
        const url = match[1];
        if (url.includes('ambitionbox')) {
          links['AmbitionBox'] = url;
        } else if (url.includes('glassdoor')) {
          links['Glassdoor'] = url;
        }
      }

      const parsedReview: { AmbitionBox?: ReviewDetails; Glassdoor?: ReviewDetails } = {};

      sources.forEach((source) => {
        const contentMatch = data.review.match(source.regex);
        if (contentMatch && contentMatch[1]) {
          const content = contentMatch[1].trim();
          parsedReview[source.name as keyof typeof parsedReview] = {
            description: content,
            link: links[source.name] || '',
          };
        }
      });

      if (Object.keys(parsedReview).length === 0) {
        throw new Error('No review content found');
      }

      setReview(parsedReview);
    } catch (err) {
      console.error('Review fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderReview = () => {
    if (!review) return null;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* AmbitionBox Review */}
        {review.AmbitionBox && (
          <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" component="div" gutterBottom>
              AmbitionBox Review
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {review.AmbitionBox.description}
            </Typography>
            {review.AmbitionBox.link && (
              <Button
                variant="contained"
                color="primary"
                href={review.AmbitionBox.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  bgcolor: '#6B46C1',
                  '&:hover': { bgcolor: '#553C9A' },
                }}
              >
                View Review on AmbitionBox
              </Button>
            )}
          </Card>
        )}

        {/* Glassdoor Review */}
        {review.Glassdoor && (
          <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Glassdoor Review
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {review.Glassdoor.description}
            </Typography>
            {review.Glassdoor.link && (
              <Button
                variant="contained"
                color="primary"
                href={review.Glassdoor.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  bgcolor: '#6B46C1',
                  '&:hover': { bgcolor: '#553C9A' },
                }}
              >
                View Review on Glassdoor
              </Button>
            )}
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8F9FC',
        borderRadius: 2,
        maxHeight: '90vh',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Building size={24} className="text-purple-600" />
          <Typography variant="h6" fontWeight="600">
            Company Reviews
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(107, 70, 193, 0.08)',
            },
          }}
        >
          <X size={20} className="text-gray-500" />
        </IconButton>
      </Box>

      {/* Search Box */}
      <Box sx={{ p: 3, bgcolor: 'white' }}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <TextField
            id="companyReviewInput"
            fullWidth
            value={companyName}
            onChange={handleInputChange}
            placeholder="Enter company name (e.g., Amazon, Google)..."
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: <Search size={20} className="text-purple-500 mr-2" />,
              sx: {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleGetReviews}
            disabled={loading || !validateCompanyName(companyName)}
            sx={{
              mt: 2,
              bgcolor: '#6B46C1',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#553C9A',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Search Reviews'
            )}
          </Button>
        </Card>
      </Box>

      {/* Reviews Display */}
      <Box
        sx={{
          p: 3,
          flex: 1,
          overflowY: 'auto',
          gap: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : review ? (
          renderReview()
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Building size={48} className="text-gray-300 mx-auto mb-4" />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Reviews Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a company name above to see reviews from multiple platforms.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CompanyReviews;