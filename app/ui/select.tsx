'use client';

import { ChangeEvent } from 'react';

interface SelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  children: React.ReactNode;
}

export function Select({ id, name, value, onChange, className = '', children }: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
    >
      {children}
    </select>
  );
} 