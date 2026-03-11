import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import { message } from 'antd';

import api from '@/api';
import type { LoginType } from '@/api/login/type';
import { useAppDispatch } from '@/stores/hooks';
import { emptyTabs } from '@/stores/slices/tabSlice';
import { apiErrorMessage } from '@/utils/apiErrorMessage';
import { useDeviceId } from '@/utils/deviceID';

// import type { AppDispatch } from '../../../store';
import './login.less';

const BackendLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isUsernameLogin] = useState(true);
  const deviceId = useDeviceId();
  const [form] = Form.useForm();
  // 按钮loading
  const [loading, setLoading] = useState(false);
  // 验证码svg标签
  const onFinish = async (values: LoginType) => {
    const { prefix, phone, ...otherValues } = values;
    const submitValues = isUsernameLogin
      ? { ...otherValues }
      : { ...otherValues, phone: '+' + prefix + phone };

    // 开始loading
    setLoading(true);

    try {
      const res = await api.teacher.login(
        isUsernameLogin
          ? {
              ...submitValues,
              device_id: deviceId,
            }
          : {
              ...submitValues,
              device_id: deviceId,
            },
      );
      console.log('登录接口返回值', res);
      dispatch(emptyTabs());
      localStorage.setItem('ACCESS-TOKEN', res.data.token_info.access_token);
      localStorage.setItem('LOGIN-TYPE', 'admin');
      // navigate('/consumer', { replace: true });
      message.success('登录成功！');

      navigate('/manage');
    } catch (error: unknown) {
      // 方法 1：判断是 Error 实例

      apiErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="login">
        <div className="login-container">
          <Form
            name="login"
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              prefix: '86',
            }}
            onFinish={onFinish}
            autoComplete="on"
          >
            {/* <Segmented
              style={{ marginLeft: '5%' }}
              options={['用户名登录', '手机号登录']}
              onChange={() => {
                setIsUsernameLogin(!isUsernameLogin);
                form.resetFields();
                getCode();
              }}
            /> */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 'bolder',
              }}
            >
              答题系统教师端
            </div>
            {isUsernameLogin ? (
              <div className="login-form">
                <Form.Item
                  className="form-item"
                  name="username"
                  rules={[{ required: true, max: 12, message: '请输入用户名!' }]}
                >
                  <Input
                    placeholder="用户名"
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  className="form-item"
                  // label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码!' },
                    { min: 8, message: '密码至少 8 位!' },
                  ]}
                >
                  <Input.Password
                    placeholder="密码"
                    allowClear
                  />
                </Form.Item>

                <Form.Item className="form-item btn-item">
                  <Button
                    style={{ height: '40px' }}
                    type="primary"
                    htmlType="submit"
                    className="login-btn"
                    loading={loading}
                  >
                    登录
                  </Button>
                </Form.Item>
              </div>
            ) : (
              <div className="login-form"> </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingRight: '30px',
                paddingLeft: '10px',
              }}
            >
              <div />
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default BackendLogin;
