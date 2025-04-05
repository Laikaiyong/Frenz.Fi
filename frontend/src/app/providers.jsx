'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { addRpcUrlOverrideToChain } from '@privy-io/react-auth';

export default function Providers({ children }) {
  // Optional: Create a chain with a custom RPC URL
  const baseChain = addRpcUrlOverrideToChain(
    base, 
    "https://mainnet.base.org" // Consider using your own RPC URL for production
  );

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        // appearance: {
        //   theme: 'light',
        //   accentColor: '#000000', // Adjust to match your theme
        //   logo: '/your-logo.png'
        // },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        },
        // Add these chain configurations
        defaultChain: baseChain,
        supportedChains: [baseChain]
      }}
    >
      {children}
    </PrivyProvider>
  );
}