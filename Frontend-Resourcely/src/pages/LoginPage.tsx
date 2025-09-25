import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";

// Custom imports
import ForgotPassword from "../assets/ForgotPassword";
import { GoogleIcon, FacebookIcon, SitemarkIcon } from "../assets/CustomIcons";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  maxWidth: 450, // Standardized width with SignUp
  padding: theme.spacing(4),
  gap: theme.spacing(3), // Increased gap for better spacing

  // Glassmorphism styles
  backgroundColor: "#04263bae",
  backdropFilter: "blur(10px)",
  border: "1px solid #07476eae",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.38)",
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 2
      : `calc(${theme.shape.borderRadius} * 2)`,
}));

export default function LoginPage(): JSX.Element {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  

  const validateEmail = (email: string): { isValid: boolean; error: string } => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address.' };
    }
    return { isValid: true, error: '' };
  };

  const validatePassword = (password: string): { isValid: boolean; error: string } => {
    if (!password || password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long.' };
    }
    return { isValid: true, error: '' };
  };

  const validateInputs = () => {
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;

    // Validate email
    const emailValidation = validateEmail(emailInput?.value || '');
    if (!emailValidation.isValid) {
      setEmailError(true);
      setEmailErrorMessage(emailValidation.error);
      // Don't return yet, validate password as well to show all errors
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    // Validate password
    const passwordValidation = validatePassword(passwordInput?.value || '');
    if (!passwordValidation.isValid) {
      setPasswordError(true);
      setPasswordErrorMessage(passwordValidation.error);
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return emailValidation.isValid && passwordValidation.isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {    //frontend backend connection
  event.preventDefault();
  if (!validateInputs()) return;

  const data = new FormData(event.currentTarget);
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const rememberMe = data.get("remember") === "on"; 

  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
      rememberMe 
     }),
    });

    // Try to parse JSON first
    let data;
    const text = await response.text();

    try {
      data = JSON.parse(text);
    } catch {
      // If parsing fails, treat it as plain text
      data = { error: text };
    }

    if (!response.ok) {
      // Handle server error
      console.error("Login error:", data.error || "Unknown error");
      return;
    }

    // Success
    console.log("Login successful:", data);
    // TODO: Save user info, redirect, etc.

  } catch (err) {
    console.error("Login request failed:", err);
  }
};

  return (
    <Box
    sx={{
      minHeight: '100vh',
      width: '100vw',                       // full screen width
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to right, #021B35, rgb(4, 52, 86))',
      p: 2,
      border: '2px solid red',              // border around entire screen
      boxSizing: 'border-box'               // makes padding + border included in width/height
    }}
    >
      <Card
        variant="outlined"
        sx={{
          transform: 'scale(1.0)',
          transformOrigin: 'top center',
          border: '2px solid red',    // see the boder 
          width: { xs: "90%", sm: "400px" }, // responsive width
        }}
      >
        <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center" }}>
          <SitemarkIcon />
        </Box>

        <Typography
          component="h1"
          variant="h4"
          sx={{ 
            width: "100%", 
            fontSize: "clamp(2rem, 10vw, 2.15rem)", 
            textAlign: "center",
            color: 'white'
          }}
        >
          Sign in
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl fullWidth>
            <FormLabel 
              htmlFor="email" 
              sx={{ 
                color: 'white',
                fontSize: '0.9375rem', // Standardized size
                mb: 0.5,
                fontWeight: 500
              }}
            >
              Email
            </FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              required
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9375rem',
                  py: 1.5,
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.75rem',
                  mx: 0,
                  mt: 0.5,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 0.5 }}>
              <FormLabel 
                htmlFor="password" 
                sx={{ 
                  color: 'white',
                  fontSize: '0.9375rem', // Standardized size
                  m: 0,
                  fontWeight: 500
                }}
              >
                Password
              </FormLabel>
              <Link 
                component="button" 
                type="button" 
                onClick={handleClickOpen} 
                variant="body2"
                sx={{ 
                  color: 'white',
                  fontSize: '0.8125rem', // Standardized size
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Forgot your password?
              </Link>
            </Box>
            <TextField
              error={passwordError}
              helperText={passwordError ? passwordErrorMessage : ""}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9375rem',
                  py: 1.5,
                  '&:-webkit-autofill': {
                    WebkitTextFillColor: 'white',
                    WebkitBoxShadow: '0 0 0 100px #04263b inset',
                  },
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.75rem',
                  mx: 0,
                  mt: 0.5,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
          </FormControl>

          <FormControlLabel 
            control={
              <Checkbox 
                value="remember" 
                color="primary"
                sx={{
                  color: 'white',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            } 
            label={
              <Typography sx={{ color: 'white' }}>
                Remember me
              </Typography>
            } 
          />

          <ForgotPassword open={open} handleClose={handleClose} />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: " #f00b0bb9",
              color: "#fff",
              "&:hover": { backgroundColor: "#ff0000ff" },
            }}
          >
            Sign in
          </Button>

          <Typography sx={{ textAlign: "center" ,
             color: "white" 
           }}>
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </Typography>
        </Box>

        <Divider>or</Divider>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button fullWidth variant="outlined" startIcon={<GoogleIcon />}>
            Sign in with Google
          </Button>
          <Button fullWidth variant="outlined" startIcon={<FacebookIcon />}>
            Sign in with Facebook
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
