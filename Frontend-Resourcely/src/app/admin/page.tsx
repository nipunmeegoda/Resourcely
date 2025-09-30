
"use client";

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Paper,
  AppBar,
  Toolbar,
  styled
} from '@mui/material';
import { 
  CalendarMonth,
  MeetingRoom,
  Settings,
  People,
  AccessTime,
  EventAvailable,
  CheckCircle,
  PendingActions,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Glassmorphic Card Component
const GlassCard = styled(Card)(({ theme }) => ({
  backdropFilter: 'blur(12px)',
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '16px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  }
}));

// Glassmorphic Stat Card
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: 'white',
  backdropFilter: 'blur(12px)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  }
}));

// Glassmorphic Button
const GlassButton = styled(Button)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
  }
}));

const AdminPage = () => {
  const stats = [
    { title: 'Total Bookings', value: '124', icon: <EventAvailable sx={{ fontSize: 40 }} /> },
    { title: 'Active Rooms', value: '24', icon: <CheckCircle sx={{ fontSize: 40 }} /> },
    { title: 'Available Now', value: '18', icon: <MeetingRoom sx={{ fontSize: 40 }} /> },
    { title: 'Pending Approvals', value: '7', icon: <PendingActions sx={{ fontSize: 40 }} /> }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(5, 39, 134) 0%,rgb(9, 4, 103) 50%,rgb(1, 0, 43) 100%)',
      color: 'white',
      pb: 8
    }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ 
        background: 'rgba(15, 32, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            SLIIT Resource Management - Admin
          </Typography>
          <Button color="inherit" sx={{ 
            backdropFilter: 'blur(10px)',
            '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
          }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <GlassCard sx={{ mb: 6, p: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage bookings, resources, and system settings
          </Typography>
        </GlassCard>

        {/* Quick Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard elevation={0}>
                <Box sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  {stat.title}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Admin Action Cards */}
        <Grid container spacing={4}>
          {/* Manage Bookings Card */}
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ color: '#1976D2', mb: 2 }}>
                    <CalendarMonth sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Manage Bookings
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    View and manage all room bookings
                  </Typography>
                </Box>
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <GlassButton 
                    variant="contained"
                    fullWidth
                    startIcon={<CalendarMonth />}
                  >
                    View All Bookings
                  </GlassButton>
                  <GlassButton 
                    variant="outlined"
                    fullWidth
                    startIcon={<AccessTime />}
                    sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}
                  >
                    Pending Approvals
                  </GlassButton>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>

          {/* Manage Resources Card */}
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ color: '#0D47A1', mb: 2 }}>
                    <MeetingRoom sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Manage Resources
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Add, edit, and manage hierarchical resources
                  </Typography>
                </Box>
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Link to="/admin/resources" style={{ textDecoration: 'none' }}>
                    <GlassButton 
                      variant="contained"
                      fullWidth
                      startIcon={<MeetingRoom />}
                    >
                      Resource Management
                    </GlassButton>
                  </Link>
                  <GlassButton 
                    variant="outlined"
                    fullWidth
                    startIcon={<MeetingRoom />}
                    sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}
                  >
                    View All Resources
                  </GlassButton>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>

          {/* System Settings Card */}
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ color: '#1565C0', mb: 2 }}>
                    <Settings sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    System Settings
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Configure system preferences and user management
                  </Typography>
                </Box>
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <GlassButton 
                    variant="contained"
                    fullWidth
                    startIcon={<Settings />}
                  >
                    General Settings
                  </GlassButton>
                  <GlassButton 
                    variant="outlined"
                    fullWidth
                    startIcon={<People />}
                    sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}
                  >
                    User Management
                  </GlassButton>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminPage;
