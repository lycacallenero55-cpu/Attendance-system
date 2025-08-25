// Lightweight monitoring hooks (placeholder for future integration)

export const initMonitoring = () => {
  // Attach global error handler
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', event.error || event.message);
    });
    window.addEventListener('unhandledrejection', (event) => {
      // eslint-disable-next-line no-console
      console.error('[UnhandledRejection]', event.reason);
    });
  }
};

