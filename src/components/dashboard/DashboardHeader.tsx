import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Avatar, 
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import { 
  Home, 
  ChevronRight, 
  LogOut, 
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { styled, alpha } from '@mui/material/styles';

// Theme constants
const THEME_COLORS = {
  primaryPurple: '#6B46C1',
  lightPurple: '#9F7AEA',
  darkPurple: '#553C9A',
  purpleGradient: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
};

// Styled components
const StyledHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(107, 70, 193, 0.06)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 24px rgba(107, 70, 193, 0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  }
}));

const StyledBreadcrumb = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: alpha('#6B46C1', 0.7),
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#6B46C1',
    transform: 'translateY(-1px)',
  }
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 44,
  height: 44,
  border: '2px solid transparent',
  backgroundImage: THEME_COLORS.purpleGradient,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 0 2px white, 0 0 0 4px #9F7AEA',
  }
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(THEME_COLORS.primaryPurple, 0.08),
    transform: 'translateX(4px)',
  }
}));

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <StyledHeader>
      <Box>
        <Breadcrumbs 
          separator={
            <ChevronRight 
              size={16} 
              style={{ color: alpha(THEME_COLORS.darkPurple, 0.4) }} 
            />
          }
          sx={{ mb: 1 }}
        >
          <StyledBreadcrumb href="/">
            <Home size={16} />
            Home
          </StyledBreadcrumb>
          <Typography 
            color={THEME_COLORS.darkPurple}
            fontWeight={500}
          >
            Dashboard
          </Typography>
        </Breadcrumbs>
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 700,
            background: THEME_COLORS.purpleGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome back, {user?.name || 'User'}!
        </Typography>
      </Box>

      <Box>
        <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
          <StyledAvatar 
            src={user?.photoURL || undefined}
            alt={user?.name || 'User'}
          />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 180,
              overflow: 'visible',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <StyledMenuItem onClick={handleProfileClick}>
            <User size={18} color={THEME_COLORS.primaryPurple} />
            Profile
          </StyledMenuItem>
          <Divider sx={{ my: 1 }} />
          <StyledMenuItem 
            onClick={() => { 
              handleMenuClose(); 
              signOut?.(); 
            }}
            sx={{ color: '#E53E3E' }}
          >
            <LogOut size={18} />
            Sign out
          </StyledMenuItem>
        </Menu>
      </Box>
    </StyledHeader>
  );
};