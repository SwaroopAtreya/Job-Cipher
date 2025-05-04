import { useEffect, useState } from 'react';
import { Alert, Snackbar, Typography } from '@mui/material';
import { Upload, Search, Briefcase } from 'lucide-react';

const welcomeMessages = [
  {
    message: "Upload your resume to start your personalized job search journey",
    icon: <Upload className="h-5 w-5" />
  },
  {
    message: "Let AI find your perfect job match across multiple platforms",
    icon: <Search className="h-5 w-5" />
  },
  {
    message: "One click away from your dream job - Upload resume now!",
    icon: <Briefcase className="h-5 w-5" />
  }
];

const WelcomeToast = () => {
  const [open, setOpen] = useState(true);
  const [message] = useState(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert 
        severity="info"
        icon={message.icon}
        sx={{
          width: '100%',
          bgcolor: 'white',
          color: 'primary.main',
          '& .MuiAlert-icon': {
            color: 'primary.main'
          },
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {message.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default WelcomeToast;