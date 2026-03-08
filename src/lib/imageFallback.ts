export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Crect width='1200' height='900' fill='%23f3f4f6'/%3E%3Cpath d='M0 680l220-220 170 170 250-250 560 560H0z' fill='%23d1d5db'/%3E%3Ccircle cx='940' cy='210' r='86' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='52%25' text-anchor='middle' font-size='46' font-family='Arial,sans-serif' fill='%236b7280'%3EImage unavailable%3C/text%3E%3C/svg%3E";

export const getSafeImageSrc = (src?: string | null) => src?.trim() || IMAGE_PLACEHOLDER;
