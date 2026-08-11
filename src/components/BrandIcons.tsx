import React from 'react';

interface IconProps {
  className?: string;
}

export const GoogleIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const MicrosoftIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 21 21" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="1" y="1" width="9.5" height="9.5" fill="#f25022" />
    <rect x="11.5" y="1" width="9.5" height="9.5" fill="#7fba00" />
    <rect x="1" y="11.5" width="9.5" height="9.5" fill="#00a4ef" />
    <rect x="11.5" y="11.5" width="9.5" height="9.5" fill="#ffb900" />
  </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
    <path fill="#FFFFFF" opacity="0.2" d="M20 4H4c-1.1 0-2 .9-2 2v.5l10 6.5 10-6.5V6c0-1.1-.9-2-2-2z"/>
    <path fill="#E0E0E0" d="M12 13L2 6.5V18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6.5L12 13z"/>
    <path fill="#C5221F" d="M2 6.5V18c0 .35.1.67.26.95L8.5 13 2 6.5z"/>
    <path fill="#B01412" d="M22 6.5L15.5 13l6.24 5.95c.16-.28.26-.6.26-.95V6.5z"/>
    <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v1l10 6.5L22 7V6c0-1.1-.9-2-2-2z"/>
  </svg>
);
