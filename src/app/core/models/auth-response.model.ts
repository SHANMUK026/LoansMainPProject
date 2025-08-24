import { User } from './roles.model';

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}
