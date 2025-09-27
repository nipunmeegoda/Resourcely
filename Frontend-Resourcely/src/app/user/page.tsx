

"use client";

import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";



const UserPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0b1b3a",
        background: "linear-gradient(160deg, #0b1b3a 0%, #0a1630 40%, #071024 100%)",
        color: "#E6F0FF",
      }}
    >
      {/* Decorative blurred glass cards in the background */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: { xs: 120, md: 80 },
            left: { xs: -40, md: 80 },
            width: { xs: 220, md: 300 },
            height: { xs: 140, md: 180 },
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            transform: "rotate(-6deg)",
            transition: "transform 600ms ease",
            ":hover": { transform: "rotate(-4deg) translateY(-2px)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 160, md: 120 },
            right: { xs: -30, md: 60 },
            width: { xs: 180, md: 260 },
            height: { xs: 120, md: 160 },
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 4,
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            transform: "rotate(8deg)",
            transition: "transform 600ms ease",
            ":hover": { transform: "rotate(6deg) translateY(-2px)" },
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, flex: 1, py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left: Headline, Subtitle, CTAs */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SchoolOutlinedIcon sx={{ color: "#9EC1FF" }} />
                <Typography variant="overline" sx={{ letterSpacing: 2, color: "#9EC1FF" }}>
                  SLIIT RESOURCE MANAGER
                </Typography>
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 34, sm: 42, md: 52 },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  textShadow: "0 2px 24px rgba(0,0,0,0.35)",
                }}
              >
                Manage Your Campus Resources Easily
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#C9D6FF",
                  maxWidth: 700,
                  opacity: 0.95,
                }}
              >
                Book lecture halls, labs, and see live availability of campus resources.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={1}>
                <Button
                  href="/signup"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.2,
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: "#2563eb",
                    color: "#fff",
                    boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
                    transition: "all 200ms ease",
                    ":hover": {
                      bgcolor: "#1d4ed8",
                      transform: "translateY(-1px)",
                      boxShadow: "0 14px 30px rgba(37,99,235,0.45)",
                    },
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  href="/login"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.2,
                    fontWeight: 700,
                    borderRadius: 2,
                    borderColor: "rgba(255,255,255,0.35)",
                    color: "#E6F0FF",
                    backdropFilter: "blur(8px)",
                    background: "rgba(255,255,255,0.04)",
                    transition: "all 200ms ease",
                    ":hover": {
                      borderColor: "rgba(255,255,255,0.65)",
                      background: "rgba(255,255,255,0.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>

              {/* Feature hints */}
              <Stack direction="row" spacing={2} pt={3} flexWrap="wrap">
                <SmallBadge icon={<MeetingRoomOutlinedIcon fontSize="small" />} label="Lecture Halls" />
                <SmallBadge icon={<ScienceOutlinedIcon fontSize="small" />} label="Labs" />
                <SmallBadge icon={<SchoolOutlinedIcon fontSize="small" />} label="Resources" />
              </Stack>
            </Stack>
          </Grid>

          {/* Right: Illustration / Glass Card */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 4,
                background: "linear-gradient(135deg,rgb(238, 76, 192) 0%,rgb(42, 84, 250) 100%)", // light pink → dark pink
                border: "1px solid rgba(243, 14, 178, 0.06)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                transition: "transform 250ms ease, box-shadow 250ms ease",
                ":hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                },
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 88, sm: 110 },
                      height: { xs: 88, sm: 110 },
                      borderRadius: "24% 76% 61% 39% / 41% 36% 64% 59%",
                      background: "linear-gradient(135deg, rgba(0, 45, 226, 0.6), rgba(147,197,253,0.35))",
                      border: "1px solid rgba(255,255,255,0.25)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "inset 0 0 25px rgba(255,255,255,0.15), 0 10px 25px rgba(0,0,0,0.35)",
                    }}
                  >
                    <SchoolOutlinedIcon sx={{ fontSize: { xs: 40, sm: 56 }, color: "#ffffff" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    University Resources at a Glance
                  </Typography>
                  <Typography sx={{ color: "#C9D6FF", textAlign: "center" }}>
                    Quick view of lecture halls, labs, and equipment availability with real-time updates.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ px: 2, py: 4, borderTop: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.15)" }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Button href="#" color="inherit" startIcon={<InfoOutlinedIcon />} sx={{ textTransform: "none", opacity: 0.9 }}>
                  About SLIIT
                </Button>
                <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", display: { xs: "none", sm: "block" } }} />
                <Button href="#" color="inherit" startIcon={<MailOutlineOutlinedIcon />} sx={{ textTransform: "none", opacity: 0.9 }}>
                  Contact Us
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                <IconButton color="inherit" aria-label="GitHub" sx={{ color: "#E6F0FF", opacity: 0.9 }}>
                  <GitHubIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="LinkedIn" sx={{ color: "#E6F0FF", opacity: 0.9 }}>
                  <LinkedInIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="Twitter" sx={{ color: "#E6F0FF", opacity: 0.9 }}>
                  <TwitterIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

function SmallBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.5,
        borderRadius: 999,
        fontSize: 13,
        color: "#DDE8FF",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", color: "#9EC1FF" }}>{icon}</Box>
      <Box component="span">{label}</Box>
    </Box>
  );
}

export default UserPage;
