import React from 'react';

interface VerificationLockGateProps {
  featureName?: string;
  description?: string;
  children?: React.ReactNode;
}

export const VerificationLockGate: React.FC<VerificationLockGateProps> = ({ children }) => {
  return <>{children || null}</>;
};

