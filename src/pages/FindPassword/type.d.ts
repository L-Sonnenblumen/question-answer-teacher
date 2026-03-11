import type { LoginType } from '@/api/login/type';

export interface FindPasswordType extends LoginType {
  confirm?: string;
  new_password: string;
}
