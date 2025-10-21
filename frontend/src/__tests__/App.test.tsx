import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: any) => <div data-testid="monaco-editor">{value}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with correct title', () => {
    render(<App />);
    expect(screen.getByText('IAM Policy Generator')).toBeInTheDocument();
    expect(screen.getByText(/Generate secure, least-privilege policies/)).toBeInTheDocument();
  });

  it('renders input textarea with placeholder', () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(/Lambda function needs read-only access/);
    expect(textarea).toBeInTheDocument();
  });

  it('renders generate button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Generate Policy/ });
    expect(button).toBeInTheDocument();
  });

  it('disables generate button when input is empty', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Generate Policy/ });
    expect(button).toBeDisabled();
  });

  it('enables generate button when input is provided', async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(/Lambda function needs read-only access/);
    const button = screen.getByRole('button', { name: /Generate Policy/ });

    expect(button).toBeDisabled();

    fireEvent.change(textarea, {
      target: { value: 'Lambda function needs S3 access' },
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('displays policy output after generation', async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(/Lambda function needs read-only access/);
    const button = screen.getByRole('button', { name: /Generate Policy/ });

    fireEvent.change(textarea, {
      target: { value: 'Lambda function needs S3 access' },
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows copy button when policy is generated', async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(/Lambda function needs read-only access/);
    const generateBtn = screen.getByRole('button', { name: /Generate Policy/ });

    fireEvent.change(textarea, {
      target: { value: 'Lambda function needs S3 access' },
    });

    fireEvent.click(generateBtn);

    await waitFor(() => {
      const copyBtn = screen.getByRole('button', { name: /Copy/ });
      expect(copyBtn).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('displays security feature info cards', () => {
    render(<App />);
    expect(screen.getByText('Least-Privilege Policy')).toBeInTheDocument();
    expect(screen.getByText('AI-Generated')).toBeInTheDocument();
    expect(screen.getByText(/Specific actions, scoped resources/)).toBeInTheDocument();
  });
});
