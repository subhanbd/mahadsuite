
import React from 'react';

interface IconProps {
  className?: string;
}

const UserMinusIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM7.5 7.5h9M7.5 16.5h9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25a.75.75 0 0 0 0-1.5H12a.75.75 0 0 0 0 1.5Zm0-9a.75.75 0 0 0 0-1.5H12a.75.75 0 0 0 0 1.5Z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A18.75 18.75 0 0 1 12 22.5c-2.786 0-5.433-.608-7.499-1.632Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12H6.75" />
  </svg>
);

export default UserMinusIcon;
