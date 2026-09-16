import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // App renders a Router with routes; the default route redirects to /login.
  // The login page contains the text "SAT Monitor" in its header.
  const heading = screen.getByText(/SAT Monitor/i);
  expect(heading).toBeInTheDocument();
});
