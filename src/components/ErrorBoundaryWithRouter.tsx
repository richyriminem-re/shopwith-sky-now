import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

/**
 * Wrapper component that provides navigate function to ErrorBoundary
 */
const ErrorBoundaryWithRouter = ({ children }: { children: React.ReactNode }) => {
  // Add error boundary around useNavigate to handle context issues
  let navigate;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn('useNavigate failed, ErrorBoundary will use fallback navigation:', error);
    navigate = undefined;
  }
  
  return (
    <ErrorBoundary navigate={navigate}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWithRouter;