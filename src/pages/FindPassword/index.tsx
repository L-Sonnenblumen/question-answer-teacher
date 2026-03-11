import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Form, Input, message, Select } from 'antd';

import api from '@/api';
import Logo from '@/assets/images/logo/logo1.png';
const { Option } = Select;
import type { FindPasswordType } from '@/pages/FindPassword/type';
import type { RootState } from '@/stores';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setLoginIsHidden } from '@/stores/slices/loginSlice';
import { apiErrorMessage } from '@/utils/apiErrorMessage';

import './index.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const FindPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAdminFindPassword = useAppSelector((state: RootState) => state.login.isAdminFindPassword);
  // 提交验证码
  const [isSending, setIsSending] = useState(false);
  const [count, setCount] = useState(0);
  // 按钮loading
  const [, setLoading] = useState(false);
  // 发送验证码
  // 发送验证码
  const handleSendSms = () => {
    const prefix = form.getFieldValue('prefix') ?? '86';
    const phone = form.getFieldValue('phone');
    if (!phone) {
      message.error('请先输入手机号');
      return;
    }
    const fullPhone = `+${prefix}${phone}`;
    // 模拟发送验证码（实际项目中替换为API调用）
    setIsSending(true);
    setCount(60);
    // 请求后端发送验证码
    api.login.sendSms(fullPhone).catch((e) => message.error(e));
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onFinish = async (values: FindPasswordType) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { prefix, phone, confirm, ...otherValues } = values;
    const submitValues = { ...otherValues, phone: '+' + prefix + phone };

    try {
      setLoading(true);
      await api.login.findPassword(submitValues);
      if (isAdminFindPassword) navigate('/scholar-guard');
      else navigate('/custom');

      dispatch(setLoginIsHidden(false));
      message.success('密码修改成功！');
    } catch (error: unknown) {
      // form.resetFields();
      form.setFieldsValue({
        phone: form.getFieldValue('phone'),
        confirm: '',
        new_password: '',
        verification_code: '',
      });
      console.log(error);
      apiErrorMessage(error);
    }
  };
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
      </Select>
    </Form.Item>
  );
  return (
    <>
      <div className="findPassword">
        <div className="nav">
          <div>
            <img src={Logo} alt="logo" height="30px" />
          </div>
          <div>咨询、反馈</div>
        </div>
        <Form
          {...formItemLayout}
          form={form}
          name="findPassword"
          onFinish={onFinish}
          className="findPassword-form-box"
          scrollToFirstError
          initialValues={{
            prefix: '86',
          }}
        >
          <div className="findPassword-form">
            <div className="title">找回密码</div>

            <Form.Item
              // label="用户名"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号码!' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' },
              ]}
            >
              <Input placeholder="手机号码" allowClear addonBefore={prefixSelector} />
            </Form.Item>

            <Form.Item
              name="verification_code"
              rules={[{ required: true, message: '请输入短信验证码!' }]}
            >
              <Input
                placeholder="短信验证码"
                allowClear
                suffix={
                  <Button
                    type="link"
                    style={{ padding: 0 }}
                    onClick={handleSendSms}
                    disabled={isSending}
                  >
                    {isSending ? `${count}s` : '发送验证码'}
                  </Button>
                }
              />
            </Form.Item>
            <Form.Item
              name="new_password"
              rules={[
                { required: true, message: '请输入新的密码!' },
                { min: 8, message: '密码至少 8 位!' },
                {
                  // 大写、小写、数字各至少 1 个，其余字符不限
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                  message: '至少包含一个大写字母、一个小写字母和一个数字!',
                },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="新的密码" />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={['new_password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: '请再次输入你的新密码!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="再次输入新的密码" />
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <div className="btn-box">
                <Button type="primary" htmlType="submit" className="submit-btn">
                  提交
                </Button>
                <Button
                  className="back-custom-btn"
                  onClick={() =>
                    // console.log(isAdminFindPassword);
                    isAdminFindPassword ? navigate('/scholar-guard') : navigate('/custom')
                  }
                >
                  返回
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
};

export default FindPassword;
