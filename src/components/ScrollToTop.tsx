import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route-aware Scroll Restoration Component.
 * Automatically and instantly resets the window and document scroll position to the top (0, 0)
 * whenever the route pathname changes, ensuring pages like /about always load from the top.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Reset window scroll position immediately without animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    // Also ensure document element / body positions are reset
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
