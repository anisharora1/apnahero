import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setServices, markAsStale, markMyServicesAsStale, clearSearchResults } from '../redux/serviceSlice';
import axios from 'axios';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useDataRefresh = () => {
    const dispatch = useDispatch();
    const { services, lastFetchTime, isStale } = useSelector(store => store.services);

    const fetchServices = async (forceRefresh = false) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/services/all-published-services`, 
                { withCredentials: true }
            );
            
            if (res.data.success) {
                dispatch(setServices(res.data.services));
                // Clear search results when refreshing all services
                dispatch(clearSearchResults());
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const checkAndRefreshData = () => {
        const now = Date.now();
        const shouldRefresh = 
            !lastFetchTime || 
            (now - lastFetchTime) > CACHE_DURATION || 
            isStale ||
            !services || 
            services.length === 0;

        if (shouldRefresh) {
            fetchServices();
        }
    };

    // Check data freshness on mount
    useEffect(() => {
        // Add a small delay to ensure Redux state is fully rehydrated
        const timer = setTimeout(() => {
            checkAndRefreshData();
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    // Set up periodic refresh
    useEffect(() => {
        const interval = setInterval(() => {
            checkAndRefreshData();
        }, CACHE_DURATION);

        return () => clearInterval(interval);
    }, [lastFetchTime, isStale, services]);

    return {
        fetchServices,
        markAsStale: () => {
            dispatch(markAsStale());
            dispatch(markMyServicesAsStale()); // Also mark my services as stale
        }
    };
};
