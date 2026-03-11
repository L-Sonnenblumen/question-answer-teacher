import { Space, Tag, Popconfirm, message, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

// 导入组件

// 导入api
import api from '@/api';
import AuthComponent from '@/components/AuthComponent';
import CustomTable from '@/components/CustomTable';
import AdminEditForm from '@/pages/UserManage/Back/components/AdminEditForm';
import type { ApiResponse } from '@/pages/UserManage/type';
import { strip86 } from '@/utils/phone';

import SearchBar from './SearchBar';
import { apiErrorMessage } from '@/utils/apiErrorMessage';
const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

interface AdminMangementPageProps {
  adminId: string;
}
const AdminMangementPage = ({ adminId }: AdminMangementPageProps) => {
  // 状态字典
  const statusDict = STATUS_OPTIONS;

  // 模态框显示状态
  const [modalVisible, setModalVisible] = useState(false);
  // 当前操作类型
  const [editType, setEditType] = useState('');
  // 当前用户ID
  const [userId, setUserId] = useState();
  // 当前用户数据
  const [currentUser, setCurrentUser] = useState(null);

  /** 搜索栏参数 */
  // 搜索栏表单项数组
  const formItemList = [
    {
      formItemProps: { name: 'phone_substring', label: '手机号' },
      valueCompProps: {},
    },

    {
      formItemProps: { name: 'user_status', label: '状态' },
      valueCompProps: { type: 'select', selectvalues: statusDict },
    },
  ];

  /** 表格参数 */
  // 表格配置项
  const columns = [
    {
      title: '序号',
      align: 'center',
      width: 90,
      render: (_, __, index) => (requestParam.current - 1) * requestParam.pageSize + index + 1,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 90,
      align: 'center',
    },

    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
      align: 'center',
      ellipsis: { showTitle: false }, // 关闭默认 title
      className: 'ellipsis-col', // 上面样式
      render: (text) => (
        <Tooltip placement="topLeft" title={strip86(text)}>
          {strip86(text)}
        </Tooltip>
      ),
    },

    {
      title: '状态',
      width: 90,
      dataIndex: 'status',
      render: (status) => {
        return status === 1 ? <Tag color={'green'}>启用</Tag> : <Tag color={'red'}>禁用</Tag>;
      },
      align: 'center',
    },
    // 创建时间列
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 120,
      align: 'center',
      ellipsis: { showTitle: false }, // 关闭默认 title
      className: 'ellipsis-col', // 上面样式
      render: (text) => (
        <Tooltip placement="topLeft" title={dayjs(text).format('YYYY-MM-DD')}>
          {dayjs(text).format('YYYY-MM-DD')}
        </Tooltip>
      ),
    },

    // 更新时间列
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 120,
      align: 'center',
      ellipsis: { showTitle: false }, // 关闭默认 title
      className: 'ellipsis-col', // 上面样式
      render: (text) => (
        <Tooltip placement="topLeft" title={dayjs(text).format('YYYY-MM-DD')}>
          {dayjs(text).format('YYYY-MM-DD')}
        </Tooltip>
      ),
    },
    {
      title: '上次登录时间',
      dataIndex: 'last_login_at',
      width: 120,
      align: 'center',
      ellipsis: { showTitle: false }, // 关闭默认 title
      className: 'ellipsis-col', // 上面样式
      render: (text) => {
        if (text === null)
          return (
            <Tooltip placement="topLeft" title={'该账号没有登录过管理系统'}>
              {'——'}
            </Tooltip>
          );
        else
          return (
            <Tooltip placement="topLeft" title={dayjs(text).format('YYYY-MM-DD')}>
              {dayjs(text).format('YYYY-MM-DD')}
            </Tooltip>
          );
      },
    },
    {
      title: '在线状态',
      dataIndex: 'is_online',
      width: 90,
      align: 'center',
      render: (status) => {
        return status === true ? <Tag color={'green'}>在线</Tag> : <Tag color={'red'}>下线</Tag>;
      },
    },
    {
      title: '操作',
      width: 120,
      key: 'action',
      render: (text, row) => (
        <Space
          style={{
            cursor: 'pointer',
            color: '#2378f7',
            fontSize: '15px',
          }}
        >
          <AuthComponent
            permission="user:admin:edit"
            title="编辑"
            type="link"
            onClick={() => {
              editRow(row);
            }}
          >
            编辑
          </AuthComponent>
          <Popconfirm
            title="删除用户"
            description="确定要删除吗？"
            onConfirm={() => {
              deleteRow(row.id);
              // console.log(row.id);
            }}
          >
            <AuthComponent permission="user:admin:del" title="删除" type="link" danger>
              删除
            </AuthComponent>
          </Popconfirm>
        </Space>
      ),
      align: 'center',
    },
  ];

  // 表格请求参数
  const [requestParam, setRequestParam] = useState({
    phone_substring: '',
    user_status: null,
    pageSize: 10,
    current: 1,
  });

  /** 表格事件 */
  // 改变参数 - 处理搜索和分页
  const onParamChange = (searchParams) => {
    // console.log('搜索参数:', searchParams);

    // 将搜索参数转换为接口需要的格式
    const apiParams = {
      phone_substring: searchParams.phone_substring || '',
      user_status: searchParams.user_status ?? null, // 使用 ?? 运算符
      pageSize: requestParam.pageSize,
      current: 1, // 搜索时重置到第一页
    };

    setRequestParam(apiParams);
  };

  // 处理表格分页和排序变化
  const handleTableChange = (pagination) => {
    const newParams = {
      ...requestParam,
      current: pagination.current,
      pageSize: pagination.pageSize,
    };
    setRequestParam(newParams);
  };

  // 新增
  const addRow = () => {
    setEditType('add');
    setCurrentUser(null);
    setModalVisible(true);
  };

  // 编辑
  const editRow = (user) => {
    setEditType('edit');
    setUserId(user.id);
    setCurrentUser(user);
    setModalVisible(true);
  };

  // 删除
  const deleteRow = async (user_id: string) => {
    // console.log('删除用户ID:', user_id);

    try {
      await api.user.deleteUser(user_id);
      message.success('删除成功');
      // 重新请求表格
      onParamChange({});
    } catch (error: unknown) {
      apiErrorMessage(error);
    }
  };

  // 关闭模态框
  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentUser(null);
  };

  // 获取表格数据的方法
  const fetchTableData = async (params) => {
    try {
      // 将参数转换为后端需要的格式
      const backendParams = {
        phone_substring: params.phone_substring || '',
        user_status: params.user_status ?? null, // 使用 ?? 运算符
        skip: (params.current - 1) * 10, // 转换为后端参数名
        limit: params.pageSize, // 转换为后端参数名
      };
      const res = (await api.user.getUser(backendParams)) as unknown as ApiResponse;

      return {
        data: res.data || [], // ✅ 只拿数组
        total: res.total || 0, // ✅ 总条数
      };
    } catch (error: unknown) {
      console.error('获取用户数据失败:', error);
      apiErrorMessage(error);
      return {
        data: [],
        total: 0,
      };
    }
  };
  return (
    <div>
      <SearchBar
        formItemList={formItemList}
        getSearchParams={onParamChange}
        onReset={() => onParamChange({})}
        addRow={addRow}
      />
      <div className="space"></div>
      <div className="user-table">
        <CustomTable
          columns={columns}
          rowKey="id" // 修正为正确的行键，假设用户数据有id字段
          bordered
          fetchMethod={fetchTableData}
          requestParam={requestParam}
          onParamChange={handleTableChange}
        />
      </div>

      {/* 使用UserEditForm组件作为模态框 */}
      <AdminEditForm
        editType={editType}
        user_id={userId}
        admin_id={adminId}
        visible={modalVisible}
        onCancel={handleModalCancel}
        currentUser={currentUser}
        onRefreshTable={() => onParamChange({})}
        key={userId}
      />
    </div>
  );
};
export default AdminMangementPage;
