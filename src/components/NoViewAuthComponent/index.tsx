import { EyeInvisibleOutlined } from '@ant-design/icons';

const NoViewAuthComponentPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 152px)',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '30px',
        color: 'rgba(0,0,0,0.5)',
      }}
    >
      <EyeInvisibleOutlined />
      <div style={{ marginLeft: 8 }}>暂无查看权限，请联系管理员开通</div>
    </div>
  );
};

export default NoViewAuthComponentPage;
