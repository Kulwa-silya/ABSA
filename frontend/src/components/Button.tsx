import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    secondary: 'text-indigo-600 hover:text-indigo-500',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
}