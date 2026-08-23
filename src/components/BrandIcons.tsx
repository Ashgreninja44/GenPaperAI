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

export const YouTubeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    <path 
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      fill="#FF0000"
    />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <radialGradient id="ig-radial" cx="30%" cy="107%" r="150%">
      <stop offset="0%" stopColor="#fdf497" />
      <stop offset="10%" stopColor="#fdf497" />
      <stop offset="50%" stopColor="#fd5949" />
      <stop offset="60%" stopColor="#d6249f" />
      <stop offset="100%" stopColor="#285AEB" />
    </radialGradient>
    <rect width="24" height="24" rx="6" fill="url(#ig-radial)"/>
    <path 
      d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
      fill="#FFFFFF"
    />
  </svg>
);

export const XTwitterIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const GitHubIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
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
