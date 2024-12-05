// src/types/gtag.d.ts

interface Window {
    gtag: (
      type: string,
      trackingId: string,
      config: {
        page_path?: string;
        event_category?: string;
        event_label?: string;
        value?: number;
      }
    ) => void;
  }