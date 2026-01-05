import React from 'react';

interface UWiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UWiLogo({ size = 'md', className = '' }: UWiLogoProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <span className={`inline-flex items-center font-semibold ${sizeClasses[size]} ${className}`}>
      <span className="text-blue-600">uw</span>
      <span className="text-orange-500">i</span>
    </span>
  );
}

