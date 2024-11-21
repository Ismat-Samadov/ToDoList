// src/lib/analytics.ts
export const GA_TRACKING_ID = 'G-XXXXXXXXXX' // Your GA4 ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}