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
  // Name validation tests
  test.each([
    ['empty string', '', 'Name is required.'],
    ['too short', 'A', 'Name must be at least 2 characters long.'],
    ['too long', 'A'.repeat(51), 'Name cannot exceed 50 characters.'],
    ['with numbers', 'John123', 'Name cannot contain numbers.'],
    ['with emoji', 'John 😊', 'Name cannot contain emojis or special symbols.'],
    ['leading space', ' John', 'Name cannot have leading or trailing spaces.'],
    ['trailing space', 'John ', 'Name cannot have leading or trailing spaces.'],
    ['multiple spaces', 'John  Doe', 'Name cannot contain multiple spaces in a row.']
  ])('shows error when name is %s', async (_, value, expectedError) => {
    const { nameInput, submitButton } = getFormElements();
    fireEvent.change(nameInput, { target: { value } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });
  });

  test('allows valid names with special characters', async () => {
    const { nameInput } = getFormElements();
    const validNames = ["John Doe", "O'Connor", "Jean-Luc", "Maria Garcia"];
    
    for (const name of validNames) {
      fireEvent.change(nameInput, { target: { value: name } });
      await waitFor(() => {
        // Just verify the input value is set correctly
        expect(nameInput.value).toBe(name);
      });
    }
  });

  // Email validation tests
  test.each([
    ['empty', '', 'Email is required.'],
    ['missing @', 'invalid-email.com', 'Please enter a valid email address (e.g., user@example.com).'],
    ['missing domain', 'user@', 'Please enter a valid email address (e.g., user@example.com).'],
    ['missing tld', 'user@example', 'Please enter a valid email address (e.g., user@example.com).'],
    ['multiple @', 'user@name@example.com', 'Please enter a valid email address (e.g., user@example.com).'],
    ['consecutive dots', 'user..name@example.com', 'Email cannot contain consecutive dots.'],
    ['too long', 'a'.repeat(246) + '@example.com', 'Email is too long (max 254 characters).'],
    ['with spaces', 'user name@example.com', 'Please enter a valid email address (e.g., user@example.com).'],
  ])('shows error when email is %s', async (_, value, expectedError) => {
    const { emailInput, submitButton } = getFormElements();
    fireEvent.change(emailInput, { target: { value } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });
  });

  test('accepts valid email formats', async () => {
    const { emailInput } = getFormElements();
    const validEmails = [
      'user@example.com',
      'user.name@example.com',
      'user-name@example.co.uk',
      'user+tag@example.io',
      'user@sub.domain.com',
    ];

    for (const email of validEmails) {
      fireEvent.change(emailInput, { target: { value: email } });
      await waitFor(() => {
        expect(emailInput.value).toBe(email);
      });
    }
  });

  // Password validation tests
  test.each([
    ['empty', '', 'Password is required.'],
    ['too short', 'Aa1!', 'Password must be at least 6 characters.'],
    ['too long', 'A'.repeat(129) + 'a1!', 'Password cannot exceed 128 characters.'],
    ['no uppercase', 'password1!', 'Password must contain at least one uppercase letter.'],
    ['no lowercase', 'PASSWORD1!', 'Password must contain at least one lowercase letter.'],
    ['no number', 'Password!', 'Password must contain at least one number.'],
    ['no special char', 'Password1', 'Password must contain at least one special character (!@#$%^&*).'],
    ['contains email', 'User@example1!', 'Password cannot contain your email address.'],
    ['contains name', 'JohnDoe1!', 'Password cannot contain your name.'],
  ])('shows error when password is %s', async (_, value, expectedError) => {
    const { nameInput, emailInput, passwordInput, submitButton } = getFormElements();
    
    // Set up name and email first
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    
    // Test the password
    fireEvent.change(passwordInput, { target: { value } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });
  });

  test('accepts valid passwords', async () => {
    const { passwordInput } = getFormElements();
    const validPasswords = [
      'ValidPass1!',
      'Another@123',
      'Str0ngP@ss',
      'Test123#',
      'P@ssw0rd',
    ];

    for (const password of validPasswords) {
      fireEvent.change(passwordInput, { target: { value: password } });
      await waitFor(() => {
        expect(passwordInput.value).toBe(password);
      });
    }
  });

  test('shows error for short password', async () => {
    const { nameInput, emailInput, passwordInput, submitButton } = getFormElements();
    
    // Set up name and email first to avoid other validation errors
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    // Test empty password
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
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
    // Mock console.log before the test runs
    const originalConsoleLog = console.log;
    const mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;
    
    try {
      const { nameInput, emailInput, passwordInput, submitButton } = getFormElements();
      
      // Fill out the form
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'ValidPass1!' } });
      
      // Submit the form
      fireEvent.click(submitButton);
      
      // Wait for the form submission to complete
      await waitFor(() => {
        // Check that console.log was called with the expected data
        expect(mockConsoleLog).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'ValidPass1!',
        });
      });
    } finally {
      // Restore the original console.log after the test
      console.log = originalConsoleLog;
    }
  });
});
