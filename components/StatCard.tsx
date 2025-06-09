
import React from 'react';

interface IconProps {
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactElement<IconProps>;
  bgColorClass?: string; 
  textColorClass?: string;
  iconColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColorClass = 'bg-base-100', 
  textColorClass = 'text-neutral-content',
  iconColorClass = 'text-secondary'
}) => {
  return (
    <div className={`shadow-lg rounded-xl p-6 flex items-center space-x-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${bgColorClass}`}>
      {icon && React.cloneElement(icon, { className: `w-10 h-10 ${iconColorClass} flex-shrink-0` })}
      <div className="flex-grow">
        <p className={`text-sm font-medium truncate ${textColorClass} opacity-80`}>{title}</p>
        <p className={`text-3xl font-bold ${textColorClass}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
