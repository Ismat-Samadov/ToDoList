// src/lib/utils.ts
export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  export const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };