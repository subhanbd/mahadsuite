
import React from 'react';
import { AppView } from '../types';

interface PlaceholderViewProps {
  title: AppView | string; 
  message?: string;
  subMessage?: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, message, subMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-0 pb-16 bg-base-100 rounded-xl shadow-lg">
      <svg className="mx-auto h-20 w-20 text-secondary mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 19.4a9 9 0 11-12.73-12.73 9 9 0 0112.73 12.73zm-1.41-1.41a7 7 0 10-9.9-9.9 7 7 0 009.9 9.9z" />
      </svg>
      <h2 className="text-3xl font-semibold text-neutral-content mb-3">Halaman {title}</h2>
      <p className="text-base-content/80 text-lg">
        {message || "Fitur ini sedang dalam tahap pengembangan."}
      </p>
      <p className="text-sm text-base-content/60 mt-2">
        {subMessage || "Kami sedang bekerja keras untuk menghadirkannya untuk Anda. Terima kasih atas kesabaran Anda!"}
      </p>
    </div>
  );
};

export default PlaceholderView;
