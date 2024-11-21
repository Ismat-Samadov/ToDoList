// src/lib/analytics.ts
interface EventProps {
    action: string;
    category: string;
    label: string;
    value: number;
   }
   
   export const GA_TRACKING_ID = 'G-KS2H84HC'
   
   export const pageview = (url: string) => {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
   }
   
   export const event = ({ action, category, label, value }: EventProps) => {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
   }