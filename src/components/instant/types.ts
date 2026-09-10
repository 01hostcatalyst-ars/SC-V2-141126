// src/components/instant/types.ts

export interface DeliverableItem {
  type: string;
  quantity: number;
  duration: string;
  notes: string;
}

export interface InstantContractFormState {
  // Step 1: Relationship & Law
  contractType: string;
  jurisdictionCountryCode: string;
  currency: string;
  brandName?: string;
  brandHandle?: string;
  campaignName?: string;
  creatorName?: string;
  creatorHandle?: string;

  // Step 2: Deliverables & Scope
  deliverables: DeliverableItem[];
  deliveryTimeframeDays: number;
  taggingRequirements: string;
  contentOwnership: string;

  // Step 3: Usage Rights & Distribution
  platforms: string[];
  usageType: string;
  paidBoostingDuration: string;
  deemedApproval48h: boolean;
  revisionLimit: number;
  revisionRounds: number;
  revisionTurnaroundDays: number;
  brandApprovalRequired: boolean;

  // Step 4: Financials & Protection
  totalAmount: string;
  advancePercent: number;
  advancePaymentDate?: string;
  remainingPaymentDate?: string;
  taxTreatment: string;
  taxRatePct?: number;
  paymentMethod: string;
  bankAccountIban: string;
  mobileWalletNumber: string;
  swiftBic: string;
  achRouting: string;
  paypalEmail: string;
  wiseTag: string;
  latePaymentPenaltyPct: number;
  lateContentPenaltyPct: number;
  penaltyCapPct: number;
  unauthorizedUsagePenaltyPct: number;
  advanceRefundable: boolean;
  advanceRefundTimeframeDays: number;
  nonDeliveryCutoffDays: number;
  cancellationFeePct: number;
  collabProduct?: string;
  collabProductProvisionType: string;
  collabDeliveryAddress?: string;
  collabDeliveryDate?: string;
  collabProductReturnDays?: number;
  collabProductReturnAddress?: string;
  collabProductReturnShippingBy?: string;
  collabProductNonReturnFee: string;
  exclusivityClause: boolean;
  exclusivityDuration: string;
  exclusivityCompetitors: string;
  confidentialityRequired: boolean;
  embargoDate: string;
  earlyDisclosurePenalty: string;

  // Step 5: Party A (Initiator) Identity
  initiatorName: string;
  initiatorEmail: string;
  initiatorPhone: string;
  initiatorCompany: string;
  initiatorDesignation: string;
  initiatorAddress: string;
  initiatorTaxId: string;
  initiatorNationalId: string;
  initiatorRole?: "CREATOR" | "BRAND" | "AGENCY";
  creatorRepresentationCapacity: "CREATOR_SELF" | "TALENT_MANAGER";
  creatorLegalName: string;
  confirmHandleOwnership: boolean;

  // Step 6: Signature & OTP
  initiatorSignatureB64: string;
  initiatorFingerprint: string;
  initiatorOtpCode: string;
  initiatorOtpDispatched: boolean;
  initiatorOtpVerified: boolean;
}

export interface CreatedContractResult {
  shareUrl: string;
  shareToken: string;
  contractNumber: string;
}
