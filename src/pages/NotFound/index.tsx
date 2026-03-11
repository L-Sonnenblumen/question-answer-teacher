import { useNavigate } from 'react-router-dom';

import { Button, Result } from 'antd';

import { getToken } from '@/utils/auth';
export default function NotFound() {
  const navigate = useNavigate();
  const backHome = () => {
    const token = getToken();
    if (!token) navigate('/', { replace: true });
    else navigate('/manage', { replace: true });
  };
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，你访问的页面不存在"
      extra={
        <Button type="primary" onClick={backHome}>
          回到首页
        </Button>
      }
    />
  );
}
