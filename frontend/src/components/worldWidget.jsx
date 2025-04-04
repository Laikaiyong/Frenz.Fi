'use client';

import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';

export default function WorldIDVerification() {
  const onSuccess = (result) => {
    console.log(result);
  };

  const handleVerify = async (proof) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proof),
      });
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID}
      action={process.env.NEXT_PUBLIC_WORLDCOIN_ACTION_ID}
      onSuccess={onSuccess}
      handleVerify={handleVerify}
      verification_level={VerificationLevel.Orb}
    >
      {({ open }) => (
        <button
          onClick={open}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Verify with World ID
        </button>
      )}
    </IDKitWidget>
  );
}