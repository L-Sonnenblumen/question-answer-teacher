export interface FindPasswordType {
  phone: string;
  new_password: string;
  verification_code: string;
}

export interface LoginType {
  login_type?: number;
  prefix?: string;
  password?: string;
  username?: string;
  phone?: string;
  verification_code: string;
  image_code?: string;
  image_id?: string;
  device_id: string;
}
