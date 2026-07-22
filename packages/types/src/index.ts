export enum UserRole {
  ADMIN = 'ADMIN',
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
