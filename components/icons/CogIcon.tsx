import React from 'react';

interface IconProps {
  className?: string;
}

const CogIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.273 1.255.12c.42-.158.883-.027 1.175.295l.708.707a1.125 1.125 0 010 1.591l-.707.707a1.125 1.125 0 01-1.175.295c-.41-.153-.875-.008-1.255.12s-.71.505-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894a1.125 1.125 0 01-.78-.93c-.374-.167-.786-.273-1.255-.12a1.125 1.125 0 01-1.175-.295l-.708-.707a1.125 1.125 0 010-1.591l.707-.707c.292-.292.755-.453 1.175-.295.41.153.875.008 1.255-.12s.71-.505.78-.93l.149-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default CogIcon;