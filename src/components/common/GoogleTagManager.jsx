// src/components/common/GoogleTagManager.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleTagManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Jab bhi route change hoto ye GTM ko naya page view send karega
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page: location.pathname + location.search,
      });
       console.log('Pageview tracked:', location.pathname);
    }
  }, [location]);

  return null;
};

export default GoogleTagManager;