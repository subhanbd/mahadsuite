
import React from 'react';

interface IconProps {
  className?: string;
}

const UserGroupIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-3.741-1.066M18 18.72m-12 0a5.971 5.971 0 013.741-1.066m0 0M12 15a3 3 0 100-6 3 3 0 000 6zm0 0a9 9 0 100-18 9 9 0 000 18zm-9.003-3.188A11.957 11.957 0 0112 3c1.258 0 2.447.197 3.543.553m-6.086 3.447A6.002 6.002 0 0112 6c1.23 0 2.37.352 3.287.947M6 18.719a6.012 6.012 0 013.741-1.066" />
  </svg>
);

export default UserGroupIcon;
