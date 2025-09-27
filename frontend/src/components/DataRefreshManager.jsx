import { useEffect } from 'react';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { useMyServicesRefresh } from '../hooks/useMyServicesRefresh';

const DataRefreshManager = () => {
    const { fetchServices } = useDataRefresh();
    const { fetchMyServices } = useMyServicesRefresh();

    // Refresh data when the app becomes visible (user switches back to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Add a small delay to ensure Redux state is fully rehydrated
                setTimeout(() => {
                    fetchServices(true); // Force refresh when app becomes visible
                    fetchMyServices(true); // Also refresh my services
                }, 100);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchServices, fetchMyServices]);

    // Refresh data when the app regains focus
    useEffect(() => {
        const handleFocus = () => {
            // Add a small delay to ensure Redux state is fully rehydrated
            setTimeout(() => {
                fetchServices(true); // Force refresh when window regains focus
                fetchMyServices(true); // Also refresh my services
            }, 100);
        };

        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchServices, fetchMyServices]);

    return null; // This component doesn't render anything
};

export default DataRefreshManager;
