import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Typography,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Stack,
  Tooltip,
  Switch,
  List,
  ListItem,
  Paper,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  NotificationsActive as AlertIcon,
  Close as CloseIcon,
  DeleteOutline as UnsubscribeIcon,
  Settings as ManageIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { Box } from '@mui/material';
import { jobAlertService, JobAlert as JobAlertType } from '@/services/jobAlertService';

const LOCATIONS = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Noida',
  'Gurgaon',
  'Kolkata',
  'India',
  // Add more locations as needed
];

const JOB_KEYWORDS = [
  'Software Developer',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Hardware Engineer',
  'System Engineer'
  // Add more keywords as needed
];

interface JobAlertProps {
  keyword?: string;
  location?: string;
}

const JobAlert: React.FC<JobAlertProps> = ({ keyword: initialKeyword, location: initialLocation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showManageAlertsDialog, setShowManageAlertsDialog] = useState(false);
  const [alerts, setAlerts] = useState<JobAlertType[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>(initialKeyword || 'Software Developer');
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation || 'India');
  const [actionType, setActionType] = useState<'create' | 'unsubscribe'>('create');
  const [unsubscribeLoading, setUnsubscribeLoading] = useState<string | null>(null);
  const [alertsFetchStatus, setAlertsFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fetchAlerts = async () => {
    if (!user?.email) {
      setError('Please login to view your job alerts');
      return;
    }

    try {
      setAlertsFetchStatus('loading');
      setLoading(true);
      const userAlerts = await jobAlertService.getUserAlerts(user.email);
      setAlerts(userAlerts);
      setAlertsFetchStatus('success');
    } catch (err) {
      setError('Failed to fetch your job alerts. Please try again.');
      console.error('Error fetching alerts:', err);
      setAlertsFetchStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!user?.email) {
      setError('Please login to create job alerts');
      return;
    }

    if (!selectedKeyword.trim() || !selectedLocation.trim()) {
      setError('Please select both job role and location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use jobAlertService instead of direct API call
      await jobAlertService.createJobAlert({
        keyword: selectedKeyword,
        location: selectedLocation,
        email: user.email
      });

      setActionType('create');
      setSuccessMessage(`You will receive job alerts at 12 pm for ${selectedKeyword} in ${selectedLocation}`);
      setSuccess(true);
      setIsDialogOpen(false);
      await fetchAlerts(); // Refresh alerts after creation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (alert: JobAlertType) => {
    if (!user?.email) {
      setError('Please login to manage your alerts');
      return;
    }

    try {
      setUnsubscribeLoading(alert.User_id);
      setError('');
      setSuccess(false);
      
      await jobAlertService.deleteJobAlert(alert.User_id, user.email);
      
      // Remove from local state to give immediate feedback
      setAlerts(prev => prev.filter(a => a.User_id !== alert.User_id));
      
      setActionType('unsubscribe');
      setSuccessMessage(`You will not receive job alerts for ${alert.keyword} in ${alert.location}`);
      setSuccess(true);
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe from alert. Please try again.');
    } finally {
      setUnsubscribeLoading(null);
    }
  };

  // Add useEffect for initial fetch
  useEffect(() => {
    if (user?.email) {
      fetchAlerts();
    }
  }, [user?.email]);

  // Add ManageAlertsDialog component
  const ManageAlertsDialog = () => (
    <Dialog
      open={showManageAlertsDialog}
      onClose={() => setShowManageAlertsDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '500px'
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <AlertIcon sx={{ color: '#6B46C1', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              Manage Job Alerts
            </Typography>
          </Stack>
          <IconButton
            onClick={() => setShowManageAlertsDialog(false)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {alertsFetchStatus === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#6B46C1' }} />
          </Box>
        ) : alertsFetchStatus === 'error' ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography color="error">
              Failed to load your alerts
            </Typography>
            <Button 
              onClick={fetchAlerts} 
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Try Again
            </Button>
          </Box>
        ) : alerts.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You don't have any active job alerts
            </Typography>
            <Button 
              onClick={() => {
                setShowManageAlertsDialog(false);
                setIsDialogOpen(true);
              }}
              variant="outlined"
              sx={{
                color: '#6B46C1',
                borderColor: '#6B46C1',
              }}
            >
              Create Your First Alert
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {alerts.map((alert, index) => (
              <div key={alert.User_id}>
                <ListItem
                  sx={{
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={alert.keyword}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(107, 70, 193, 0.1)',
                          color: '#6B46C1',
                          fontWeight: 500
                        }}
                      />
                      <Chip
                        label={alert.location}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(107, 70, 193, 0.05)',
                          color: '#6B46C1'
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(alert.timestamp).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleUnsubscribe(alert)}
                    startIcon={unsubscribeLoading === alert.User_id ? <CircularProgress size={16} color="error" /> : <UnsubscribeIcon />}
                    disabled={unsubscribeLoading === alert.User_id}
                    sx={{
                      ml: 2,
                      '&:hover': {
                        bgcolor: 'error.lighter'
                      }
                    }}
                  >
                    {unsubscribeLoading === alert.User_id ? 'Unsubscribing...' : 'Unsubscribe'}
                  </Button>
                </ListItem>
                {index < alerts.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setShowManageAlertsDialog(false)}
          sx={{
            color: 'grey.600'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Modify the return statement to add Manage Alerts button
  return (
    <>
      {/* Existing bell icon and create alert button */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Create Job Alert">
          <IconButton
            onClick={() => setIsDialogOpen(true)}
            sx={{
              color: '#6B46C1',
              '&:hover': {
                backgroundColor: 'rgba(107, 70, 193, 0.08)',
              }
            }}
          >
            <AlertIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>

        {/* Add Manage Alerts button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setShowManageAlertsDialog(true);
            fetchAlerts(); // Refresh alerts when opening manage dialog
          }}
          startIcon={<ManageIcon />}
          sx={{
            borderColor: '#6B46C1',
            color: '#6B46C1',
            '&:hover': {
              borderColor: '#553C9A',
              bgcolor: 'rgba(107, 70, 193, 0.04)',
            }
          }}
        >
          Manage Alerts
        </Button>
      </Stack>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <AlertIcon
                sx={{
                  color: '#6B46C1',
                  fontSize: 20
                }}
              />
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                Customize Job Alert
              </Typography>
            </Stack>
            <IconButton
              onClick={() => setIsDialogOpen(false)}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              fontSize: '0.875rem',
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}
          >
            You will receive daily updates at 12 PM for {selectedKeyword} jobs in {selectedLocation}
          </Typography>

          <Stack spacing={2}>
            <Autocomplete
              value={selectedKeyword}
              onChange={(_, newValue) => setSelectedKeyword(newValue || 'Software Developer')}
              options={JOB_KEYWORDS}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Job Role"
                  variant="outlined"
                  size="small"
                  required
                  error={selectedKeyword.trim() === ''}
                />
              )}
              freeSolo
              fullWidth
            />

            <Autocomplete
              value={selectedLocation}
              onChange={(_, newValue) => setSelectedLocation(newValue || 'India')}
              options={LOCATIONS}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  variant="outlined"
                  size="small"
                  required
                  error={selectedLocation.trim() === ''}
                />
              )}
              freeSolo
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            sx={{
              color: 'grey.600',
              mr: 1
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAlert}
            disabled={loading || !user?.email || selectedKeyword.trim() === '' || selectedLocation.trim() === ''}
            sx={{
              bgcolor: '#6B46C1',
              '&:hover': {
                bgcolor: '#553C9A',
              },
              textTransform: 'none',
              px: 3
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                Creating Alert...
              </>
            ) : 'Create Alert'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Manage Alerts Dialog */}
      <ManageAlertsDialog />

      {/* Success Notification */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          '& .MuiSnackbar-root': {
            position: 'relative'
          }
        }}
      >
        <Alert
          severity="success"
          icon={<SuccessIcon fontSize="inherit" />}
          sx={{
            width: '400px',
            bgcolor: '#F0FDF4',
            border: '1px solid',
            borderColor: '#BBF7D0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-icon': {
              color: '#22C55E'
            }
          }}
        >
          <Stack spacing={0.5}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#166534',
                fontWeight: 600
              }}
            >
              {actionType === 'create' 
                ? 'Job alert created successfully!' 
                : 'Job alert unsubscribed successfully!'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#166534',
                fontSize: '0.815rem'
              }}
            >
              {successMessage}
            </Typography>
          </Stack>
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error"
          icon={<ErrorIcon fontSize="inherit" />}
          sx={{ 
            maxWidth: '300px',
            bgcolor: '#FEF2F2',
            border: '1px solid',
            borderColor: '#FECACA',
            '& .MuiAlert-icon': {
              color: '#DC2626'
            }
          }}
        >
          <Typography color="error.dark">{error}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default JobAlert;