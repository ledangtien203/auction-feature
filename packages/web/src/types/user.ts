export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  joinDate: Date;
  totalBids: number;
  totalSpent: number;
  phone?: string;
  avatar?: string;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';
