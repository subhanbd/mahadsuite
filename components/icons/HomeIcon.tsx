
import React from 'react';

interface IconProps {
  className?: string;
}

const HomeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.954 8.955M6.75 21.75V13.5M17.25 21.75V13.5M2.25 12l-.004-.004A1.5 1.5 0 013.75 10.5h16.5a1.5 1.5 0 011.504 1.504L21.75 12M12 21.75V16.5m0 0V9.75M12 16.5a2.25 2.25 0 002.25-2.25h-4.5a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export default HomeIcon;
