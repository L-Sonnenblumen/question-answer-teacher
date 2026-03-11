export interface ChangePasswordType {
  old_password: string;
  new_password: string;
}

export interface ModifyMeType {
  username: string;
}

export interface ModifyPhoneType {
  verification_code: string;
  phone: string;
}
