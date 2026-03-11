import { CloseOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Button,
  message,
  Select,
  Modal,
  Checkbox,
  Space,
  Card,
  Tooltip,
  Spin,
  Popconfirm,
} from 'antd';
import React, { useEffect, useState } from 'react';

import api from '@/api';
import Auth from '@/components/Auth';
import { add86, strip86 } from '@/utils/phone';
import type { ApiErrorResponse } from '@/types/global';
import { apiErrorMessage } from '@/utils/apiErrorMessage';

interface RoleItem {
  id: string;
  role_name: string;
  description: string;
}

export default function AdminEditForm({
  admin_id,
  user_id,
  editType,
  onRefreshTable,
  visible,
  onCancel,
  currentUser,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]); // 全部角色
  const [checked, setChecked] = useState<string[]>([]); // 已勾选角色 id
  const [prevChecked, setPrevChecked] = useState<string[]>([]); // 用于“取消”时回滚
  const [changeSelf, setChangeSelf] = useState<boolean>(true);
  // 拉取所有角色
  const getAdminRoles = async () => {
    const res = await api.role.getUserRole({
      skip: 0,
      limit: 10,
      keyword: '',
    });
    if (res?.data) setAllRoles(res.data);
  };
  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      getAdminRoles();
      if (editType === 'edit' && currentUser) {
        // 编辑模式，填充当前用户数据（保持原有字段不变）
        form.setFieldsValue({
          username: currentUser.username,
          phone: strip86(currentUser.phone),
          status: currentUser.status?.toString(),
        });
        if (admin_id === user_id) setChangeSelf(false);
        const boundIds = (currentUser.bound_roles || []).map((r) => r.id);
        setChecked(boundIds);
        setPrevChecked(boundIds);
      } else {
        // 新增模式，重置表单并设置默认值
        form.resetFields();
        form.setFieldsValue({
          status: '1',
        });
        setChecked([]);
        setPrevChecked([]);
      }
    }
  }, [visible, editType, currentUser, form]);

  // 每次点击 checkbox 都二次确认
  const onRoleChange = async (newChecked: string[]) => {
    const added = newChecked.filter((id) => !checked.includes(id));
    const removed = checked.filter((id) => !newChecked.includes(id));
    if (!added.length && !removed.length) return;

    const actionText = added.length ? '绑定' : '解绑';
    const role = allRoles.find((r) => r.id === (added[0] || removed[0]))!;
    Modal.confirm({
      title: '提示',
      content: `确定${actionText}角色「${role.role_name}」吗？`,
      onOk: async () => {
        setRoleLoading(true); // ❗只转角色
        try {
          if (added.length) {
            await api.role.addUserRole({ user_id, role_id: added[0] });
          } else {
            await api.role.deleteUserRole({
              user_id,
              role_id: removed[0],
            });
          }
          message.success(`${actionText}成功`);
          setChecked(newChecked);
          setPrevChecked(newChecked);
          onRefreshTable({}); // 刷新列表
        } catch (error: unknown) {
          apiErrorMessage(error);
          setChecked(prevChecked); // 回滚
        } finally {
          setRoleLoading(false);
        }
      },
      onCancel: () => setChecked(prevChecked),
    });
  };
  // 取消按钮事件
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 提交表单
  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editType === 'add') {
        // 新增用户 - 包含所有必需字段
        await api.user.addUser({
          username: values.username,
          phone: add86(values.phone),
          password: values.password,
          user_status: parseInt(values.status),
        });
        message.success('新增管理员成功');
        message.warning('请为新建管理员绑定角色');
      } else if (editType === 'edit') {
        // 编辑用户 - 保持原有字段不变
        await api.user.updateUser({
          user_id: user_id,
          username: values.username,
          phone: add86(values.phone),
        });
        if (changeSelf)
          await api.user.updateUserStatus({
            user_id: user_id,
            user_status: parseInt(values.status),
          });
        message.success('更新用户成功');
      }

      // 刷新表格
      onRefreshTable({});
      // 关闭模态框
      handleCancel();
    } catch (error: unknown) {
      apiErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };
  const confirm = async (e: React.MouseEvent<HTMLElement>) => {
    // console.log(2222);

    try {
      const res = await api.user.forceUserLogout(user_id);
      // console.log(11111111111);

      console.log(res);

      onRefreshTable({}); // 可选：刷新列表
      message.success('强制下线成功');
    } catch (error: unknown) {
      apiErrorMessage(error);
    }
  };
  const cancel = (e: React.MouseEvent<HTMLElement>) => {};
  // 获取角色数据
  useEffect(() => {
    getAdminRoles();
  }, [visible]);
  return (
    <Modal
      title={editType === 'add' ? '新增管理员' : '编辑管理员'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        name="userInfoForm"
        onFinish={onFinish}
        initialValues={{
          status: '1',
        }}
      >
        {/* 编辑和新增共有的字段 */}
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 1, max: 50, message: '用户名长度在1-50个字符之间' },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            {
              pattern: /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\d|9\d)\d{8}$/,
              message: '请输入正确的手机号格式',
            },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
        {/* 新增用户特有的字段 */}
        {editType === 'add' && (
          <>
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少 8 位!' },
                {
                  // 大写、小写、数字各至少 1 个，其余字符不限
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                  message: '至少包含一个大写字母、一个小写字母和一个数字!',
                },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请确认密码" />
            </Form.Item>
          </>
        )}
        <Auth permission="user:admin:state">
          {changeSelf && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select
                style={{ width: '100%' }}
                options={[
                  {
                    value: '1',
                    label: '启用',
                  },
                  {
                    value: '0',
                    label: '禁用',
                  },
                ]}
              />
            </Form.Item>
          )}
        </Auth>

        {/* 角色区域 –– 一行展示 + 悬浮描述 */}
        <Auth permission="user:admin:bind">
          {editType === 'edit' && (
            <Form.Item label="角色" required={true}>
              <Spin spinning={roleLoading} delay={200}>
                <Checkbox.Group value={checked} onChange={onRoleChange} style={{ width: '100%' }}>
                  <Space wrap size={16}>
                    {allRoles.map((role) =>
                      role.role_name === 'admin' ? (
                        <Tooltip key={role.id} title={role.description} mouseEnterDelay={0.2}>
                          <Checkbox value={role.id} disabled>
                            {role.role_name}
                          </Checkbox>
                        </Tooltip>
                      ) : (
                        <Tooltip key={role.id} title={role.description} mouseEnterDelay={0.2}>
                          <Checkbox value={role.id} disabled={roleLoading}>
                            {role.role_name}
                          </Checkbox>
                        </Tooltip>
                      )
                    )}
                  </Space>
                </Checkbox.Group>
              </Spin>
            </Form.Item>
          )}
        </Auth>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {editType === 'edit' && (
                <Auth permission="user:admin:force_logot">
                  <Popconfirm
                    title={`确定将管理员“${currentUser?.username}”强制下线？`}
                    onConfirm={confirm}
                    onCancel={cancel}
                    okText="确定"
                    cancelText="取消"
                  >
                    {changeSelf && (
                      <Button danger style={{ marginRight: '8px' }}>
                        强制下线
                      </Button>
                    )}
                  </Popconfirm>
                </Auth>
              )}
            </div>
            <div>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认
              </Button>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
