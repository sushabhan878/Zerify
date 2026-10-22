'use client';

import React from 'react';
import InfluencerWithdrawFundsModal from './InfluencerWithdrawFundsModal';

export interface ClaimPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onClaimSuccess?: () => void;
  payableAmount?: number;
  availableAmount?: number;
  currencyCode?: string;
  beneficiary?: any;
  isCredentialsLinked?: boolean;
  onOpenLinkModal?: () => void;
}

export default function ClaimPayoutModal({
  isOpen,
  onClose,
  onSuccess,
  onClaimSuccess,
  payableAmount,
  availableAmount,
}: ClaimPayoutModalProps) {
  const effectiveAvailable = availableAmount ?? payableAmount ?? 0;

  return (
    <InfluencerWithdrawFundsModal
      isOpen={isOpen}
      onClose={onClose}
      availableBalance={effectiveAvailable}
      onSuccess={() => {
        onClaimSuccess?.();
        onSuccess?.();
      }}
    />
  );
}
