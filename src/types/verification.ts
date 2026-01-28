export interface Verification {
  id: string;
  storeId: string;
  userId: string;
  isVerified: boolean;
  comment?: string;
  evidenceImageUrl?: string;
  createdAt: string;
  user?: {
    nickname: string;
    avatarUrl?: string;
    trustLevel: number;
  };
}

export interface VerificationCreateInput {
  storeId: string;
  isVerified: boolean;
  comment?: string;
  evidenceImageUrl?: string;
}

export interface VerificationStats {
  total: number;
  positive: number;
  negative: number;
  trustScore: number;
}

// 가맹점 댓글/평가
export interface Comment {
  id: string;
  storeId: string;
  userId: string;
  content: string;
  rating?: number; // 1-5점
  paymentSuccess?: boolean;
  visitDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    nickname: string;
    avatarUrl?: string;
  };
}

export interface CommentCreateInput {
  storeId: string;
  content: string;
  rating?: number;
  paymentSuccess?: boolean;
  visitDate?: string;
}
