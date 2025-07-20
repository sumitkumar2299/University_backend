import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Paper, CircularProgress } from '@mui/material';
import { School, LibraryBooks, Upload } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Don't render the home content for authenticated users (they will be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Academic Resource Hub
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          Share and discover academic content with students worldwide
        </Typography>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/library"
            startIcon={<LibraryBooks />}
            sx={{ mr: 2 }}
          >
            Browse Library
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/register"
            startIcon={<Upload />}
          >
            Start Sharing
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Academic Content
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access notes, previous year questions, handbooks, and study materials
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <LibraryBooks sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Organized by Branch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find content specific to your branch, semester, and subjects
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Share Your Knowledge
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload and share your academic resources with the community
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 