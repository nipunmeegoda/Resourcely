const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');
const LoginPage = require('../LoginPage').default;
const { BrowserRouter: Router } = require('react-router-dom');

// Mock the global fetch
const mockFetch = jest.fn();
// @ts-ignore - Mocking global fetch
global.fetch = mockFetch;

// Mock the console methods to prevent test output pollution
const originalConsole = { ...console };
const mockConsole = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn()
};

// Mock the entire console object
global.console = mockConsole;

describe('Login Component', () => {
  const renderLogin = () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );
  };

  // Setup and teardown
  beforeEach(() => {
    // Reset all mocks
    mockFetch.mockClear();
    jest.clearAllMocks();
    
    // Reset console mocks
    mockConsole.error.mockClear();
    mockConsole.log.mockClear();
    
    // Render the component
    renderLogin();
  });

  afterAll(() => {
    // Restore original console
    global.console = originalConsole;
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



  test('submits form with valid data', async () => {
    // Mock a successful login response
    const mockResponse = { token: 'test-token' };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchPromise = Promise.resolve({
      ok: true,
      json: () => mockJsonPromise,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });
    
    mockFetch.mockImplementation(() => mockFetchPromise);

    const { emailInput, passwordInput, submitButton } = getFormElements();
    
    // Fill out and submit the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Check if fetch was called with the right arguments
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            rememberMe: false,
          }),
        })
      );
      
      // Check that success was logged
      expect(mockConsole.log).toHaveBeenCalledWith('Login successful:', mockResponse);
    });
  });

  test('handles login error', async () => {
    // Mock a failed login response
    const errorMessage = 'Invalid credentials';
    const mockErrorResponse = { error: errorMessage };
    const mockJsonPromise = Promise.resolve(mockErrorResponse);
    const mockFetchPromise = Promise.resolve({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => mockJsonPromise,
      text: () => Promise.resolve(JSON.stringify(mockErrorResponse)),
    });
    
    mockFetch.mockImplementation(() => mockFetchPromise);
    
    const { emailInput, passwordInput, submitButton } = getFormElements();
    
    // Fill out and submit the form with invalid credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    // Check that error was logged
    await waitFor(() => {
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Login error:',
        errorMessage
      );
    });
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