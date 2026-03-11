import { Spin } from 'antd';

import './index.less';
interface LoadingProps {
  loadingText?: string;
}
export default function Loading({ loadingText }: LoadingProps) {
  return (
    <div className="Loading">
      <Spin size="large" />
      <h3 className="loadingText">{loadingText}</h3>
    </div>
  );
}
