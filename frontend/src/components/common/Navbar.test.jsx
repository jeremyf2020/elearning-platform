import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust path if needed
import { describe, it, expect, vi } from 'vitest';

// Helper to render with Router (since Navbar uses <Link>)
const renderNavbar = (props) => {
  return render(
    <BrowserRouter>
      <Navbar {...props} />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  
  it('shows Login and Register links when no user is logged in', () => {
    renderNavbar({ user: null, onLogout: vi.fn() });

    // Check if Login link exists
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    // Check if Register link exists
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    // Ensure "Hello" message is NOT there
    expect(screen.queryByText(/hello/i)).not.toBeInTheDocument();
  });

  it('shows Username and Logout button when logged in', () => {
    const mockLogout = vi.fn(); // Create a fake function
    renderNavbar({ user: 'TestUser', onLogout: mockLogout });

    // Check if Username is displayed
    expect(screen.getByText(/hello, testuser/i)).toBeInTheDocument();
    
    // Check if Logout button exists
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();

    // Click the logout button and see if it fired
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

});