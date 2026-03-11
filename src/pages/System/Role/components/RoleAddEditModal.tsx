import { Modal, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';

import apiClient from '@/client';
import api from '@/api';

const { Item } = Form;

/**
 * 添加/编辑角色弹窗
 * @param {Object} props
 * @param {Boolean} props.visible 是否显示
 * @param {Object|null} props.record 编辑时传入的角色对象；新增时传 null
 * @param {Function} props.onCancel 点击取消/关闭的回调
 * @param {Function} props.onOk 点击确定的回调，参数为表单值
 */
const RoleAddEditModal = ({ visible, record, onCancel, onOk }) => {
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 点击确定，校验并提交
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      setIsLoading(true);
      if (record) {
        await api.role.updateRole({
          role_id: record.id,
          role_name: values.role_name,
          role_description: values.description,
        });
        message.success('编辑角色成功');
        onOk('edit');
      } else {
        await api.role.createRole({
          role_name: values.role_name,
          role_description: values.description,
        });
        message.success('新增角色成功');
        onOk('add');
      }
      onCancel();
    } catch (error: unknown) {
      // 校验未通过
    } finally {
      setIsLoading(false);
    }
  };

  // 弹窗打开时，如果是编辑，则回填数据；如果是新增，则重置表单
  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          role_name: record.role_name,
          description: record.description,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, record, form]);

  return (
    <Modal
      title={record ? '编辑角色' : '新增角色'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={isLoading}
      style={{ top: '20vh' }}
      maskClosable={false}
    >
      <Form form={form} layout="horizontal" preserve={false}>
        <Item
          label="角色名称"
          name="role_name"
          rules={[
            { required: true, message: '请输入角色名称' },
            {
              pattern: /^[A-Za-z0-9_]+$/,
              message: '只能包含字母、数字和下划线',
            },
          ]}
        >
          <Input placeholder="请输入角色名称" maxLength={30} showCount />
        </Item>

        <Item
          label="角色描述"
          name="description"
          rules={[{ required: true, message: '请输入角色描述' }]}
        >
          <Input.TextArea placeholder="请输入角色描述" maxLength={200} showCount rows={5} />
        </Item>
      </Form>
    </Modal>
  );
};

export default RoleAddEditModal;
