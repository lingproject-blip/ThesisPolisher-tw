import React from 'react';

export interface PolishResult {
  original: string;
  polished: string;
  timestamp: number;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}