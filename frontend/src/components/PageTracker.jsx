import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever route changes
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null; // This component doesn't render anything
}

export default PageTracker;