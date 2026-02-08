import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea: React.FC<TextAreaProps> = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`
        w-full h-full p-6 resize-none outline-none border-none bg-transparent 
        placeholder-academic-300 text-academic-800
        focus:ring-0
        ${className}
      `}
      spellCheck={false}
      {...props}
    />
  );
};