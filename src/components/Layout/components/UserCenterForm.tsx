import React, { useEffect, useState } from 'react';

import { Button, Form, Input, message, Modal, Spin } from 'antd';

import api from '@/api';
import { apiErrorMessage } from '@/utils/apiErrorMessage';
import { strip86 } from '@/utils/phone';

interface Props {
  visible: boolean;
  onClose: () => void; // 父组件只关心关闭
}

const UserCenterModal: React.FC<Props> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [oldUsername, setOldUsername] = useState<string>('');
  const [ableOk, setAbleOk] = useState<boolean>(false);
  const [loading, setLoading] = useState(false); // 拉取/提交 loading
  const [, setInitial] = useState({}); // 原始用户信息

  /* 1. 每次打开重新拉最新数据 */
  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    api.user
      .getMeInfo()
      .then((res) => {
        const { username, phone } = res.data;
        setInitial(res.data);
        form.setFieldsValue({ username, phone: strip86(phone) });
        setOldUsername(username);
      })
      .catch((error: unknown) => apiErrorMessage(error))
      .finally(() => setLoading(false));
  }, [visible, form]);

  /* 2. 提交 */
  const handleFinish = async (values: { username: string }) => {
    setLoading(true);
    try {
      await api.account.modifyMe({ username: values.username });
      message.success('保存成功');
      onClose(); // 关闭弹窗
    } catch (error: unknown) {
      apiErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    const username = form.getFieldValue('username');
    // console.log(username);

    if (oldUsername === username) setAbleOk(false);
    else setAbleOk(true);
  };
  return (
    <Modal
      title="个人中心"
      open={visible}
      footer={null}
      onCancel={onClose}
      maskClosable={false}
      destroyOnHidden // 关闭即销毁，保证下次重新挂载
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          onChange={handleChange}
        >
          <Form.Item label="手机号" name="phone">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={onClose}>取消</Button>

            <Button type="primary" htmlType="submit" disabled={!ableOk} style={{ marginLeft: 16 }}>
              确认
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UserCenterModal;
