import { Tree, Button, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
// 导入apiClient

import { useSelector } from 'react-redux';

import apiClient from '@/client';
import type { RootState } from '@/stores';
import api from '@/api';

type CheckedKeys = { checked: React.Key[]; halfChecked: React.Key[] };

const RoleAuthTree = ({ role_id, roleAuths, open, onClose }) => {
  // 权限
  const rolePermission = useSelector((state: RootState) => state.user.userinfo?.buttons);

  // 权限树的数据
  const [treeData, setTreeData] = useState([]);
  // 勾选的复选框数组
  const [checkedKeys, setCheckedKeys] = useState<CheckedKeys>({
    checked: [],
    halfChecked: [],
  });

  // 提交loading
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);

  // 勾选复选框回调
  const onCheck = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue);
  };

  const onCancel = () => {
    setCheckedKeys({ checked: [], halfChecked: [] });
    onClose(false);
  };

  const onSubmit = async () => {
    setIsSubmitLoading(true);
    await api.role.bindRoleAndPermission({
      role_id: role_id,
      permissions: checkedKeys.checked,
    });

    message.success('分配角色权限成功');
    setIsSubmitLoading(false);
    onCancel();
  };

  useEffect(() => {
    const fetchAuthTree = async () => {
      const { data } = await api.menu.getSysPermission();
      setTreeData(data);
      // 设置勾选复选框为传入角色权限数据
      setCheckedKeys((checkedKeys) => ({ ...checkedKeys, checked: roleAuths }));
    };
    fetchAuthTree();
  }, [role_id, roleAuths]);

  return (
    <Modal
      title="分配角色权限"
      open={open}
      style={{ top: '10vh' }}
      footer={
        rolePermission?.includes('role:auth:bind') ? (
          <div>
            <Button onClick={onCancel}>取消</Button>
            <Button
              type="primary"
              style={{ marginLeft: 20 }}
              onClick={onSubmit}
              loading={isSubmitLoading}
            >
              确认
            </Button>
          </div>
        ) : null
      }
      onCancel={onCancel}
    >
      <div style={{ height: '70vh', overflowY: 'auto' }}>
        {treeData.length > 0 && (
          <Tree
            checkable
            defaultExpandAll={true}
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            checkStrictly
            treeData={treeData}
          />
        )}
      </div>
    </Modal>
  );
};
export default RoleAuthTree;
