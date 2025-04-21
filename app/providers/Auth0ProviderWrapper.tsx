'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

interface Auth0WrapperProps {
  children: React.ReactNode;
}

export function Auth0Wrapper({ children }: Auth0WrapperProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  if (!domain) {
    console.error('Auth0 domain is not set in environment variables.');
  }
  if (!clientId) {
    console.error('Auth0 client ID is not set in environment variables.');
  }

  const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';

  if (!domain || !clientId) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      // Consider adding cacheLocation="localstorage" for better persistence
      // cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
