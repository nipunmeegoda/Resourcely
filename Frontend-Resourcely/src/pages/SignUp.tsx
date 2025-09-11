import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../assets/CustomIcons';
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

export default function SignUpPage() {
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');


  const validateInputs = () => {
    const name = document.getElementById('name') as HTMLInputElement | null;
    const email = document.getElementById('email') as HTMLInputElement | null;
    const password = document.getElementById('password') as HTMLInputElement | null;
    let isValid = true;

    if (!name?.value || name.value.trim().length < 2) {
      setNameError(true);
      setNameErrorMessage('Please enter your full name.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email?.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password?.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    console.log({
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: "linear-gradient(to right, #021B35,rgb(4, 52, 86))", // optional bg
        p: 2,
        width: "205vh",
      }}
    >
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
              placeholder="your@email.com"
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
              placeholder="••••••"
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

          <FormControlLabel
            control={<Checkbox value="updates" color="primary" />}
            label={<Typography sx={{ color: 'white' }}>I want to receive updates via email</Typography>}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
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
