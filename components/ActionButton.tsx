import React from 'react';
import { ButtonProps } from '../types';

export const ActionButton: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  disabled, 
  className = '',
  ...props 
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={`
        relative overflow-hidden group flex items-center justify-center gap-2
        bg-academic-800 hover:bg-academic-900 text-white
        disabled:bg-academic-200 disabled:text-academic-400 disabled:cursor-not-allowed
        px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 ease-out
        font-medium text-sm tracking-wide
        active:scale-[0.98]
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <div className="absolute inset-0 flex items-center justify-center">
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          {children}
        </>
      )}
    </button>
  );
};