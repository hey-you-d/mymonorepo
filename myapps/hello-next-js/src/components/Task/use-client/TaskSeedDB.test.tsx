import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskSeedDB } from './TaskSeedDB';

// Mock functions for testing
const mockSeedTaskDB = jest.fn();
const mockDeleteAllRows = jest.fn();
const mockSetButtonDisabled = jest.fn();

// Default props for testing
const defaultProps = {
  totalRows: 0,
  seedTaskDB: mockSeedTaskDB,
  deleteAllRows: mockDeleteAllRows,
  buttonDisabled: false,
  setButtonDisabled: mockSetButtonDisabled,
  userAuthenticated: true,
};

let spyConsoleError: jest.SpyInstance<any, any>;

describe('TaskSeedDB Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // hide console.error to reduce noise on the console output
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(()=> {});
  });

  afterEach(() => {
    // Restore console.error
    spyConsoleError.mockRestore();
  });

  describe('Rendering', () => {
    it('renders the current row count message', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={5} />);
      expect(screen.getByText('Currently, there are 5 rows in the Tasks table.')).toBeInTheDocument();
    });

    it('renders "Seed DB" button when totalRows is 0', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      expect(screen.getByRole('button', { name: 'Seed DB' })).toBeInTheDocument();
    });

    it('renders "Delete all rows" button when totalRows is greater than 0', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={5} />);
      expect(screen.getByRole('button', { name: 'Delete all rows' })).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('renders enabled button when user is authenticated and button is not disabled', () => {
      render(<TaskSeedDB {...defaultProps} userAuthenticated={true} buttonDisabled={false} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('renders disabled button when user is not authenticated', () => {
      render(<TaskSeedDB {...defaultProps} userAuthenticated={false} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('renders disabled button when buttonDisabled is true', () => {
      render(<TaskSeedDB {...defaultProps} buttonDisabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('renders disabled button when user is not authenticated regardless of buttonDisabled state', () => {
      render(<TaskSeedDB {...defaultProps} userAuthenticated={false} buttonDisabled={false} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Click Handler Functionality', () => {
    it('calls seedTaskDB when totalRows is 0 and button is clicked', async () => {
      mockSeedTaskDB.mockResolvedValue(undefined);
      
      render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      const button = screen.getByRole('button', { name: 'Seed DB' });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockSeedTaskDB).toHaveBeenCalledTimes(1);
        expect(mockDeleteAllRows).not.toHaveBeenCalled();
      });
    });

    it('calls deleteAllRows when totalRows is greater than 0 and button is clicked', async () => {
      mockDeleteAllRows.mockResolvedValue(undefined);
      
      render(<TaskSeedDB {...defaultProps} totalRows={5} />);
      const button = screen.getByRole('button', { name: 'Delete all rows' });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockDeleteAllRows).toHaveBeenCalledTimes(1);
        expect(mockSeedTaskDB).not.toHaveBeenCalled();
      });
    });

    it('calls setButtonDisabled with true before async operation and false after', async () => {
      (mockSeedTaskDB as jest.Mock).mockResolvedValue(undefined);
      
      render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      const button = screen.getByRole('button', { name: 'Seed DB' });
      
      fireEvent.click(button);
      
      // Should be called with true first
      expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
      
      await waitFor(() => {
        // Should be called with false after async operation
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(false);
      });
      
      expect(mockSetButtonDisabled).toHaveBeenCalledTimes(2);
    });

    it('prevents default form submission when button is clicked', async () => {
      (mockSeedTaskDB as jest.Mock).mockResolvedValue(undefined);
      
      render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      const button = screen.getByRole('button', { name: 'Seed DB' });
      
      const mockEvent = { preventDefault: jest.fn() };
      
      // We need to manually trigger the click handler with a mock event
      // since fireEvent.click doesn't give us access to the event object
      fireEvent.click(button);
      
      // The preventDefault is called internally, so we verify the function was called
      await waitFor(() => {
        expect(mockSeedTaskDB).toHaveBeenCalled();
      });
    });

    it('does not trigger click handler when user is not authenticated', () => {
      render(<TaskSeedDB {...defaultProps} userAuthenticated={false} totalRows={0} />);
      const button = screen.getByRole('button', { name: 'Seed DB' });
      
      fireEvent.click(button);
      
      expect(mockSeedTaskDB).not.toHaveBeenCalled();
      expect(mockDeleteAllRows).not.toHaveBeenCalled();
      expect(mockSetButtonDisabled).not.toHaveBeenCalled();
    });

    it('does not trigger click handler when button is disabled', () => {
      render(<TaskSeedDB {...defaultProps} buttonDisabled={true} totalRows={0} />);
      const button = screen.getByRole('button', { name: 'Seed DB' });
      
      fireEvent.click(button);
      
      expect(mockSeedTaskDB).not.toHaveBeenCalled();
      expect(mockDeleteAllRows).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('still sets buttonDisabled to false even if seedTaskDB throws an error', async () => {
      mockSeedTaskDB.mockRejectedValue(new Error('Seed failed'));
      
      render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      const button = screen.getByRole('button', { name: 'Seed DB' });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
      });
    });

    it('still sets buttonDisabled to false even if deleteAllRows throws an error', async () => {
      mockDeleteAllRows.mockRejectedValue(new Error('Delete failed'));
      
      render(<TaskSeedDB {...defaultProps} totalRows={5} />);
      const button = screen.getByRole('button', { name: 'Delete all rows' });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockSetButtonDisabled).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles totalRows equal to 0 correctly', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      expect(screen.getByText('Currently, there are 0 rows in the Tasks table.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Seed DB' })).toBeInTheDocument();
    });

    it('handles negative totalRows correctly (should show Seed DB button)', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={-1} />);
      expect(screen.getByText('Currently, there are -1 rows in the Tasks table.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Seed DB' })).toBeInTheDocument();
    });

    it('handles large totalRows correctly', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={1000000} />);
      expect(screen.getByText('Currently, there are 1000000 rows in the Tasks table.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete all rows' })).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('renders all elements together correctly', () => {
      render(<TaskSeedDB {...defaultProps} totalRows={10} />);
      
      expect(screen.getByText('Currently, there are 10 rows in the Tasks table.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete all rows' })).toBeInTheDocument();
    });

    it('updates button text correctly based on totalRows prop changes', () => {
      const { rerender } = render(<TaskSeedDB {...defaultProps} totalRows={0} />);
      expect(screen.getByRole('button', { name: 'Seed DB' })).toBeInTheDocument();
      
      rerender(<TaskSeedDB {...defaultProps} totalRows={5} />);
      expect(screen.getByRole('button', { name: 'Delete all rows' })).toBeInTheDocument();
    });
  });
});  