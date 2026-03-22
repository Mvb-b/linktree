'use client';

import { useCallback } from 'react';

export function useAnalytics() {
  const trackClick = useCallback(async (platform: string, url: string) => {
    try {
      // Don't await, fire and forget for better UX
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, url }),
        keepalive: true,
      }).catch(err => {
        console.debug('Analytics tracking failed:', err);
      });
    } catch (error) {
      console.debug('Analytics error:', error);
    }
  }, []);

  const trackEvent = useCallback(async (eventType: string, metadata?: Record<string, string>) => {
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: eventType,
          url: metadata?.url || (typeof window !== 'undefined' ? window.location.href : ''),
          ...metadata
        }),
        keepalive: true,
      }).catch(err => {
        console.debug('Analytics event tracking failed:', err);
      });
    } catch (error) {
      console.debug('Analytics error:', error);
    }
  }, []);

  return { trackClick, trackEvent };
}
