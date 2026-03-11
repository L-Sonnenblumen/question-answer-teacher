// src/hooks/useKick.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { message } from 'antd';
const TokenKey = 'ACCESS-TOKEN';
export default function useKick() {
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return; // 没登录不连

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onopen = () => console.log('[kick-ws] connected');

    ws.onmessage = (e) => {
      try {
        const { type, msg } = JSON.parse(e.data);
        if (type === 'KICK') {
          // 后端推的禁用事件
          message.error(msg || '账号已被禁用');
          window.localStorage.removeItem(TokenKey); // 清 token / redux / 菜单
          nav('/custom', { replace: true });
        }
      } catch {
        /* empty */
      }
    };

    ws.onclose = () => console.log('[kick-ws] closed');
    ws.onerror = () => ws.close();

    return () => ws.close(); // 组件卸载时关闭
  }, [nav]);
}
