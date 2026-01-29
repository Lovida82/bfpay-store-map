export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  trustLevel: number;
  totalRegistrations: number;
  totalVerifications: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  nickname: string;
  avatarUrl?: string;
}
