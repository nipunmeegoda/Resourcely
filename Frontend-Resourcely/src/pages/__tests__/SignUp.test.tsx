const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');
const SignUpPage = require('../SignUp').default;
const { BrowserRouter: Router } = require('react-router-dom');

describe('SignUp Component', () => {
  const renderSignUp = () => {
    render(
      <Router>
        <SignUpPage />
      </Router>
    );
  };

  beforeEach(() => {
    renderSignUp();
  });

  // Helper function to get form elements
  const getFormElements = () => ({
    nameInput: screen.getByRole('textbox', { name: /full name/i }) as HTMLInputElement,
    emailInput: screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement,
    passwordInput: screen.getByLabelText(/^password/i, { selector: 'input[type="password"]' }) as HTMLInputElement,
    // Get all buttons with 'Sign up' text and take the first one (the main form button)
    submitButton: screen.getAllByRole('button', { name: /sign up/i })[0],
  });

  // Happy Path Tests
  test('renders sign up form with all fields', () => {
    const { nameInput, emailInput, passwordInput, submitButton } = getFormElements();
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test('allows users to fill out the form', () => {
    const { nameInput, emailInput, passwordInput } = getFormElements();
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // Edge Cases / Negative Testing
  test('shows error when name is empty', async () => {
    const { nameInput, submitButton } = getFormElements();
    
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter your full name.')).toBeInTheDocument();
    });
  });

  test('shows error for invalid email format', async () => {
    const { emailInput, submitButton } = getFormElements();
    
    // Test empty email
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
    
    // Test invalid email format
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  test('shows error for short password', async () => {
    const { passwordInput, submitButton } = getFormElements();
    
    // Test empty password
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    });
    
    // Test short password
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    });
  });

  test('allows special characters in name', () => {
    const { nameInput } = getFormElements();
    const specialName = "O'Connor-Smith, Jr.";
    
    fireEvent.change(nameInput, { target: { value: specialName } });
    expect(nameInput.value).toBe(specialName);
  });

  // Form Submission
  test('submits form with valid data', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { nameInput, emailInput, passwordInput, submitButton } = getFormElements();
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });
    
    consoleSpy.mockRestore();
  });
});
