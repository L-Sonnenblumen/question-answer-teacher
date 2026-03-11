import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from '@/App';
import store from '@/stores';

import '@/styles/variables.less';
import '@/styles/global.less';

// 1. 先获取节点并存入变量
const rootElement = document.getElementById('root');

// 2. 严谨判断：如果拿不到节点，直接抛出明确的错误
if (!rootElement) {
  throw new Error('Failed to find the root element. Please check your index.html.');
}
createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
