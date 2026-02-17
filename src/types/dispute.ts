export type DisputeStatus = 'open' | 'awaiting_response' | 'under_review' | 'escalated' | 'resolved' | 'closed';
export type DisputeReason = 'damage' | 'late_return' | 'wrong_equipment' | 'no_show' | 'quality_issue' | 'billing_issue' | 'safety_concern' | 'penalty_challenge' | 'other';
export type DisputePriority = 'low' | 'medium' | 'high' | 'critical';

export interface DisputeResolution {
  outcome: 'in_favor_of_claimant' | 'in_favor_of_respondent' | 'mutual_agreement' | 'no_action';
  refundAmount?: number;
  penaltyAmount?: number;
  penaltyTarget?: 'claimant' | 'respondent';
  securityDepositAction?: 'release' | 'claim_partial' | 'claim_full';
  securityDepositAmount?: number;
  compensationAmount?: number;
  compensationTarget?: 'claimant' | 'respondent';
  adminNotes?: string;
  resolvedBy?: string;
}

export interface Dispute {
  id: string;
  disputeNumber: string;
  bookingId: string;
  contractId?: string;
  claimantId: string;
  respondentId: string;
  assignedAdminId?: string;
  reason: DisputeReason;
  status: DisputeStatus;
  priority: DisputePriority;
  description: string;
  claimantEvidence?: string[];
  respondentResponse?: string;
  respondentEvidence?: string[];
  responseDeadline?: string;
  resolutionDeadline?: string;
  resolution?: DisputeResolution;
  adminNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  claimant?: { id: string; fullName: string; email?: string; mobileNumber?: string };
  respondent?: { id: string; fullName: string; email?: string; mobileNumber?: string };
  assignedAdmin?: { id: string; fullName: string };
  booking?: { id: string; startDate: string; endDate: string; status: string; finalPrice: number };
}

export interface DisputeActivity {
  id: string;
  disputeId: string;
  actorId: string;
  activityType: string;
  description?: string;
  metadata?: Record<string, unknown>;
  isInternal: boolean;
  createdAt: string;
  actor?: { id: string; fullName: string };
}

export interface DisputeStats {
  total: number;
  open: number;
  awaitingResponse: number;
  underReview: number;
  escalated: number;
  resolved: number;
  closed: number;
}

export interface CreateDisputePayload {
  bookingId: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
  priority?: DisputePriority;
}

export interface ResolveDisputePayload {
  outcome: DisputeResolution['outcome'];
  refundAmount?: number;
  penaltyAmount?: number;
  penaltyTarget?: 'claimant' | 'respondent';
  securityDepositAction?: 'release' | 'claim_partial' | 'claim_full';
  securityDepositAmount?: number;
  compensationAmount?: number;
  compensationTarget?: 'claimant' | 'respondent';
  adminNotes?: string;
}
