import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
} from '@mui/material';
import { AccountCircle, School } from '@mui/icons-material';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    enqueueSnackbar('Logged out successfully!', { variant: 'success' });
    navigate('/', { replace: true });
  };

  // Define public routes where login/register should be visible
  const publicRoutes = ['/', '/library', '/verify-email', '/forgot-password', '/reset-password', '/application-status'];
  const isPublicRoute = publicRoutes.some(route => location.pathname === route || location.pathname.startsWith(route));

  // Define protected routes where dashboard/admin/profile/logout should be visible
  const protectedRoutes = ['/dashboard', '/admin', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

  return (
    <AppBar position="static">
      <Toolbar>
        <School sx={{ mr: 2 }} />
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Academic Resource Hub
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/library">
            Library
          </Button>

          {/* Show authentication buttons for non-authenticated users on public routes */}
          {!isAuthenticated && isPublicRoute && (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}

          {/* Show user-specific buttons for authenticated users */}
          {isAuthenticated && (
            <>
              {/* Dashboard/Admin Panel buttons */}
              {!isAdmin && (
                <Button color="inherit" component={Link} to="/dashboard">
                  Dashboard
                </Button>
              )}
              {isAdmin && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Panel
                </Button>
              )}
              
              {/* Profile and Logout buttons */}
              {/* Only show Profile for non-admin users */}
              {!isAdmin && (
                <Button color="inherit" component={Link} to="/profile">
                  Profile
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 