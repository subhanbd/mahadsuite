
import React from 'react';

interface IconProps {
  className?: string;
}

const DatabaseIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5M3.75 7.5h16.5M3.75 10.5h16.5M3.75 13.5h16.5M3.75 16.5h16.5M3.75 19.5h16.5M6.75 21a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 006.75 3H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h1.5zm9-18a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 0015.75 21h1.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0017.25 3h-1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
  </svg>
);

export default DatabaseIcon;
