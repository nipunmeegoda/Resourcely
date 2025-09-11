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
  maxWidth: 400, // keeps card a nice size in center
  padding: theme.spacing(4),
  gap: theme.spacing(2),

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
  const [passwordError, setPasswordErrorMessage] = useState(false);
  const [passwordErrorMessageText, setPasswordErrorMessageText] = useState("");
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const validateInputs = () => {
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;

    let isValid = true;

    if (!emailInput?.value || !/\S+@\S+\.\S+/.test(emailInput.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!passwordInput?.value || passwordInput.value.length < 6) {
      setPasswordErrorMessage(true);
      setPasswordErrorMessageText("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordErrorMessage(false);
      setPasswordErrorMessageText("");
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // center horizontally
        alignItems: "center", // center vertically
        minHeight: "100vh", // take full screen height
        width: "650%", // take full screen width
        background: "linear-gradient(to right, #021B35,rgb(4, 52, 86))", // optional bg
    
      }}
    >
      <Card  sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #04061fff 0%,rgb(214, 219, 227) 100%)",
        p: 2,
      }}
        variant="outlined"
        sx={{
          maxWidth: "450px",
          width: "100%",
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
          <FormControl>
            <FormLabel htmlFor="email" sx={{ color: 'white' }}>Email</FormLabel>
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
                  color: 'rgb(255, 255, 255)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgb(255, 255, 255)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(255, 255, 255)',
                  },
                },
              }}
            />
          </FormControl>

          <FormControl>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <FormLabel htmlFor="password" sx={{ color: 'white' }}>Password</FormLabel>
              <Link component="button" type="button" onClick={handleClickOpen} variant="body2"
              sx={{ color: 'white' }}
              >
                Forgot your password?
              </Link>
            </Box>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessageText}
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
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
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
              backgroundColor: "#f00b0bb9",
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
