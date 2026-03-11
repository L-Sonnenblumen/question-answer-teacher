import { Modal, Descriptions, Spin } from 'antd';
import { useEffect, useState } from 'react';

import apiClient from '@/client';
import api from '@/api';

interface ResType {
  code: number;
  message: string;
  res: boolean;
  total: number;
  data: RoleListItemType;
}

interface RoleListItemType {
  id: string;
  no: number;
  role_name: string;
  description: string;
  creater_user_name: string;
  created_at: string;
  updated_at: string;
}

const RoleDetailModal = ({ visible, roleId, onCancel }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<RoleListItemType>();

  const getDetail = async () => {
    try {
      setIsLoading(true);
      const res: ResType = await api.role.getRole(roleId);
      setDetailData({
        ...res.data,
        created_at: `${res.data.created_at.slice(0, 10)} ${res.data.created_at.slice(11, 19)}`,
        updated_at: `${res.data.updated_at.slice(0, 10)} ${res.data.updated_at.slice(11, 19)}`,
      });
    } catch (error: unknown) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!roleId) return;
    getDetail();
  }, [roleId]);

  return (
    <Modal
      title={'角色详情'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ top: '20%' }}
    >
      <Spin spinning={isLoading}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label={'角色名称'}>{detailData?.role_name || '--'}</Descriptions.Item>
          <Descriptions.Item label={'创建人'}>
            {detailData?.creater_user_name || '--'}
          </Descriptions.Item>
          <Descriptions.Item label={'创建时间'}>{detailData?.created_at || '--'}</Descriptions.Item>
          <Descriptions.Item label={'更新时间'}>{detailData?.updated_at || '--'}</Descriptions.Item>
          <Descriptions.Item label={'角色描述'}>
            {detailData?.description || '--'}
          </Descriptions.Item>
        </Descriptions>
      </Spin>
    </Modal>
  );
};

export default RoleDetailModal;
