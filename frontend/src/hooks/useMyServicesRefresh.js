import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMyServices, markMyServicesAsStale } from '../redux/serviceSlice';
import axios from 'axios';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for my services

export const useMyServicesRefresh = () => {
    const dispatch = useDispatch();
    const { myServices, myServicesLastFetchTime, myServicesStale } = useSelector(store => store.services);

    const fetchMyServices = async (forceRefresh = false) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/services/my-services`, 
                { withCredentials: true }
            );
            
            if (res.data.success) {
                dispatch(setMyServices(res.data.services));
            }
        } catch (error) {
            console.error('Error fetching my services:', error);
        }
    };

    const checkAndRefreshData = () => {
        const now = Date.now();
        const shouldRefresh = 
            !myServicesLastFetchTime || 
            (now - myServicesLastFetchTime) > CACHE_DURATION || 
            myServicesStale ||
            !myServices || 
            myServices.length === 0;

        if (shouldRefresh) {
            fetchMyServices();
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
    }, [myServicesLastFetchTime, myServicesStale, myServices]);

    return {
        fetchMyServices,
        markAsStale: () => dispatch(markMyServicesAsStale())
    };
};
