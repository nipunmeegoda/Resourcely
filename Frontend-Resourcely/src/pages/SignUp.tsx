import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../assets/CustomIcons';
import api from '../api';
import axios from 'axios';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: 450,
  padding: theme.spacing(4),
  gap: theme.spacing(3), // Increased gap for better spacing
  backgroundColor: '#04263bae',
  backdropFilter: 'blur(10px)',
  border: '1px solid #07476eae',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.38)',
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 2
      : `calc(${theme.shape.borderRadius} * 2)`,
  transform: 'scale(0.9)',
  transformOrigin: 'top center',
}));

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  
  //states 
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    type: "success", // "success" | "error"
    message: ""
  });
  


  const validateName = (name: string): { isValid: boolean; error: string } => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return { isValid: false, error: 'Name is required.' };
    }
    
    if (trimmedName.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long.' };
    }
    
    if (trimmedName.length > 50) {
      return { isValid: false, error: 'Name cannot exceed 50 characters.' };
    }
    
    if (/\s{2,}/.test(name)) {
      return { isValid: false, error: 'Name cannot contain multiple spaces in a row.' };
    }
    
    if (/^\s|\s$/.test(name)) {
      return { isValid: false, error: 'Name cannot have leading or trailing spaces.' };
    }
    
    if (/[0-9]/.test(trimmedName)) {
      return { isValid: false, error: 'Name cannot contain numbers.' };
    }
    
    // Check for emoji and other non-printable characters
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(trimmedName)) {
      return { isValid: false, error: 'Name cannot contain emojis or special symbols.' };
    }
    
    return { isValid: true, error: '' };
  };

  const validateEmail = (email: string): { isValid: boolean; error: string } => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return { isValid: false, error: 'Email is required.' };
    }
    
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address (e.g., user@example.com).' };
    }
    
    // Check for multiple @ symbols or consecutive dots
    if ((trimmedEmail.match(/@/g) || []).length > 1) {
      return { isValid: false, error: 'Email cannot contain multiple @ symbols.' };
    }
    
    if (trimmedEmail.includes('..')) {
      return { isValid: false, error: 'Email cannot contain consecutive dots.' };
    }
    
    // Check length (typical max is 254 chars for the entire address)
    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'Email is too long (max 254 characters).' };
    }
    
    // Check domain part
    const domainPart = trimmedEmail.split('@')[1];
    if (domainPart.length < 2 || !domainPart.includes('.')) {
      return { isValid: false, error: 'Please enter a valid domain name.' };
    }
    
    return { isValid: true, error: '' };
  };

  const validatePassword = (password: string, email: string, name: string): { isValid: boolean; error: string } => {
    if (!password) {
      return { isValid: false, error: 'Password is required.' };
    }
    
    // Check length - updated to 6 characters to match test expectations
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters.' };
    }
    
    if (password.length > 128) {
      return { isValid: false, error: 'Password cannot exceed 128 characters.' };
    }
    
    // Check complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter.' };
    }
    
    if (!hasLowercase) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter.' };
    }
    
    if (!hasNumber) {
      return { isValid: false, error: 'Password must contain at least one number.' };
    }
    
    if (!hasSpecialChar) {
      return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*).' };
    }
    
    // Check for personal info in password
    const emailUsername = email ? email.split('@')[0] : '';
    if (emailUsername && password.toLowerCase().includes(emailUsername.toLowerCase())) {
      return { isValid: false, error: 'Password cannot contain your email address.' };
    }
    
    if (name) {
      const nameParts = name.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length > 2 && password.toLowerCase().includes(part)) {
          return { isValid: false, error: 'Password cannot contain your name.' };
        }
      }
    }
    
    return { isValid: true, error: '' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (name === 'name') {
      setNameError(false);
      setNameErrorMessage('');
    } else if (name === 'email') {
      setEmailError(false);
      setEmailErrorMessage('');
    } else if (name === 'password') {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
  };

  const validateInputs = (): boolean => {
    let isValid = true;

    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      setNameError(true);
      setNameErrorMessage(nameValidation.error);
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(true);
      setEmailErrorMessage(emailValidation.error);
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    // Validate password
    const passwordValidation = validatePassword(
      formData.password, 
      formData.email, 
      formData.name
    );
    
    if (!passwordValidation.isValid) {
      setPasswordError(true);
      setPasswordErrorMessage(passwordValidation.error);
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    //for backend forntend
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        username: formData.name, // assuming "name" field is used as username
      });

      setToast({ ////////////////
        open: true,
        type: "success",
        message: "✅ Registration successful! You can now log in."
      });
      // Optionally redirect to login page
      // window.location.href = '/login';

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Registration failed.";
        setToast({
          open: true,
          type: "error",
          message: errorMessage
        });
      } else {
        setToast({
          open: true,
          type: "error",
          message: "⚠️ Network error. Please try again."
        });
      }
      
    } finally {
      setIsSubmitting(false);
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

      {/* ------------ TOAST COMPONENT ------------ */}
      {/* This will overlay the screen when toast.open is true */}
      {toast.open && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: '45%' ,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            color: toast.type === "success" ? "#00ffcc" : "#ff4d4d",
            p: 2,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            fontWeight: 600,

            maxWidth: '80vw', // ensures it wraps on small screens
            textAlign: 'center', // center text inside

            zIndex: 9999

            
          }}
          onClick={() => setToast({ ...toast, open: false })}
        >
          {toast.message}
        </Box>
      )}

      <Card variant="outlined">
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center' ,
      
      }}>
          <SitemarkIcon />
        </Box>

        <Typography
          component="h1"
          variant="h4"
          sx={{  width: "100%", 
            fontSize: "clamp(2rem, 10vw, 2.15rem)", 
            textAlign: "center",
            color: 'white' }}
        >
          Sign up
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Full Name */}
          <FormControl fullWidth>
            <FormLabel 
              htmlFor="name" 
              sx={{ 
                color: 'white',
                fontSize: '0.9375rem',
                mb: 0.5,
                fontWeight: 500
              }}
            >
              Full Name
            </FormLabel>
            <TextField
              error={nameError}
              helperText={nameErrorMessage}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Janidu Pabasara"
              autoComplete="name"
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
                    borderColor: 'rgba(255, 255, 255, 0.23)' 
                  },
                  '&:hover fieldset': { 
                    borderColor: 'white' 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
          </FormControl>

          {/* Email */}
          <FormControl fullWidth>
            <FormLabel 
              htmlFor="email" 
              sx={{ 
                color: 'white',
                fontSize: '0.9375rem',
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
              value={formData.email}
              onChange={handleInputChange}
              placeholder="janidu@example.com"
              autoComplete="email"
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
                    borderColor: 'rgba(255, 255, 255, 0.23)' 
                  },
                  '&:hover fieldset': { 
                    borderColor: 'white' 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
          </FormControl>

          {/* Password */}
          <FormControl fullWidth>
            <FormLabel 
              htmlFor="password" 
              sx={{ 
                color: 'white',
                fontSize: '0.9375rem',
                mb: 0.5,
                fontWeight: 500
              }}
            >
              Password
            </FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              autoComplete="new-password"
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
                    borderColor: 'rgba(255, 255, 255, 0.23)' 
                  },
                  '&:hover fieldset': { 
                    borderColor: 'white' 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
          </FormControl>

          {/* ... */}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 2, mb: 2, 
              backgroundColor: '#f00b0bb9',
              color: '#fff',
              '&:hover': { backgroundColor: '#ff0000ff' },
            }}
          >
            Sign up
          </Button>

          <Typography sx={{ textAlign: 'center', color: 'white' }}>
            Already have an account? <Link href="/login" sx={{ color: 'white' }}>Sign in</Link>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }}>or</Divider>

        {/* Social Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button fullWidth variant="outlined" startIcon={<GoogleIcon />}>
            Sign up with Google
          </Button>
          <Button fullWidth variant="outlined" startIcon={<FacebookIcon />}>
            Sign up with Facebook
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
