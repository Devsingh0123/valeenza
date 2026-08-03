import { useState, useEffect, useCallback } from 'react';
import { COUNTRY_CODES } from '@/constants/countryCodes';

/**
 * Custom hook to fetch country codes.
 * Currently uses static data, but can be easily switched to an API.
 */
export const useCountryCodes = () => {
  const [countryCodes, setCountryCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching (or actually fetch from API)
  const fetchCountryCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate network delay (optional – remove for instant)
      // await new Promise((resolve) => setTimeout(resolve, 300));
      // Use static data
      setCountryCodes(COUNTRY_CODES);
    } catch (err) {
      setError(err.message || 'Failed to load country codes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCountryCodes();
  }, [fetchCountryCodes]);

  // Refetch function (if needed)
  const refetch = useCallback(() => {
    fetchCountryCodes();
  }, [fetchCountryCodes]);

  return { countryCodes, loading, error, refetch };
};






