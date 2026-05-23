export interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  birthday: string | null;
  roleId: string;
  isVerified: boolean;
  isBlocked: boolean;
  balance: number;
  rating: number;
  createdAt: string;
  // join
  roleName: string | null;
  // mapped fields
  role: string;
  status: 'active' | 'blocked';
  joinDate: string;
  totalBids: number;
  totalSpent: number;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'blocked';
