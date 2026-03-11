import { accountApi } from '@/api/account';
import { loginApi } from '@/api/login';
import { menuApi } from '@/api/menu';
import { roleApi } from '@/api/role';
import { userApi } from '@/api/user';

import { teacherApi } from './teacher';

const api = {
  user: userApi,
  account: accountApi,
  role: roleApi,
  menu: menuApi,
  login: loginApi,
  teacher: teacherApi,
};
export default api;
