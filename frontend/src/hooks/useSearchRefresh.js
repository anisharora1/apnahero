import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchResults, markSearchAsStale } from '../redux/serviceSlice';
import axios from 'axios';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for search results

export const useSearchRefresh = (searchParams) => {
    const dispatch = useDispatch();
    const { searchResults, searchLastFetchTime, searchStale } = useSelector(store => store.services);

    const fetchSearchResults = async (forceRefresh = false) => {
        try {
            const params = {};
            if (searchParams.q) params.q = searchParams.q;
            if (searchParams.category) params.category = searchParams.category;
            if (searchParams.location) params.location = searchParams.location;

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/services/all-published-services`, 
                { 
                    withCredentials: true,
                    params
                }
            );
            
            if (res.data.success) {
                dispatch(setSearchResults(res.data.services));
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const checkAndRefreshData = () => {
        const now = Date.now();
        const shouldRefresh = 
            !searchLastFetchTime || 
            (now - searchLastFetchTime) > CACHE_DURATION || 
            searchStale ||
            !searchResults || 
            searchResults.length === 0;

        if (shouldRefresh) {
            fetchSearchResults();
        }
    };

    // Check data freshness when search params change
    useEffect(() => {
        if (searchParams.q || searchParams.category || searchParams.location) {
            // Add a small delay to ensure Redux state is fully rehydrated
            const timer = setTimeout(() => {
                checkAndRefreshData();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [searchParams.q, searchParams.category, searchParams.location]);

    // Set up periodic refresh
    useEffect(() => {
        if (searchParams.q || searchParams.category || searchParams.location) {
            const interval = setInterval(() => {
                checkAndRefreshData();
            }, CACHE_DURATION);

            return () => clearInterval(interval);
        }
    }, [searchLastFetchTime, searchStale, searchResults, searchParams.q, searchParams.category, searchParams.location]);

    return {
        fetchSearchResults,
        markAsStale: () => dispatch(markSearchAsStale())
    };
};
