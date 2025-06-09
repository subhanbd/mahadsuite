
import React from 'react';
import SearchIcon from './icons/SearchIcon';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="my-6 px-4 sm:px-0">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari santri (nama, wali, alamat, daerah, status...)"
          className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 bg-base-100 text-base-content rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm transition-all duration-150 ease-in-out"
          aria-label="Cari santri"
        />
      </div>
    </div>
  );
};

export default SearchBar;