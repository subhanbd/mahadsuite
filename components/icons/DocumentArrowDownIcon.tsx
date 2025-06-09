
import React from 'react';

interface IconProps {
  className?: string;
}

const DocumentArrowDownIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.158 12.458a3.375 3.375 0 01-3.375-3.375V11.25a3.375 3.375 0 013.375-3.375m0 6.75h.008v.008H8.408m0-6.75v.008H8.25m6.75 3.375h.008v.008H15m0-3.375H15M8.25 15h7.5M12 17.25h.008v.008H12v-.008Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default DocumentArrowDownIcon;
