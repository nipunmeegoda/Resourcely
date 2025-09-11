const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');
const LoginPage = require('../LoginPage').default;
const { BrowserRouter: Router } = require('react-router-dom');

describe('Login Component', () => {
  const renderLogin = () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );
  };

  beforeEach(() => {
    renderLogin();
  });

  // Helper function to get form elements
  const getFormElements = () => {
    // Using getByRole for email and password inputs since they might not have explicit labels
    const emailInput = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input[type="password"]' }) as HTMLInputElement;
    // Get all buttons with 'Sign in' text and take the first one (the main form button)
    const submitButtons = screen.getAllByRole('button', { name: /sign in/i });
    const submitButton = submitButtons[0];
    
    return {
      emailInput,
      passwordInput,
      submitButton,
      // Check if remember me exists before trying to get it
      rememberMe: screen.queryByRole('checkbox', { name: /remember me/i })
    };
  };

  // Happy Path Tests
  test('renders login form with all fields', () => {
    const { emailInput, passwordInput, submitButton } = getFormElements();
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    // Check if email and password fields are required
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  test('allows users to fill out the form', () => {
    const { emailInput, passwordInput } = getFormElements();
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // Edge Cases / Negative Testing
  test('shows error for empty email', async () => {
    const { emailInput, submitButton } = getFormElements();
    
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  test('shows error for invalid email format', async () => {
    const { emailInput, submitButton } = getFormElements();
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  test('shows error for empty password', async () => {
    const { passwordInput, submitButton } = getFormElements();
    
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
  });

  test('shows error for short password', async () => {
    const { passwordInput, submitButton } = getFormElements();
    
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
  });

  // Form Submission
  test('submits form with valid data', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { emailInput, passwordInput, submitButton } = getFormElements();
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    consoleSpy.mockRestore();
  });

  // Test form submission with valid data
  test('submits form with valid data', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { emailInput, passwordInput, submitButton } = getFormElements();
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    consoleSpy.mockRestore();
  });

  // Test form validation
  test('shows validation errors for empty fields', async () => {
    const { submitButton } = getFormElements();
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
  });
});
