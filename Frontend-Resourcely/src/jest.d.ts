/// <reference types="@testing-library/jest-dom" />

// Extend the jest expect with jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeRequired(): R;
      toHaveAttribute(attr: string, value?: any): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      // Add other custom matchers as needed
    }
  }
}
