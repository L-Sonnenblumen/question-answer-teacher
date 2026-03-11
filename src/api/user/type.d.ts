import type { QueryBaseParams } from '@/api/type';

export interface GetUsersType extends QueryBaseParams {
  phone_substring: string;
  user_status: number | null;
}

export interface AddUserType {
  username: string;
  phone: string;
  password: string;
  user_status: number;
}

export interface UpdateUserStatusType {
  user_id: string;
  user_status: number;
}

export interface UpdateUserType {
  user_id: string;
  username: string;
  phone: string;
}
