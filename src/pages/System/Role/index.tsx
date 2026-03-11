import './index.css';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Space, Popconfirm, message, Table, Input, Button, Pagination, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// 导入apiClient
import apiClient from '@/client';
// 导入自定义字典hook
import AuthComponent from '@/components/AuthComponent';
import NoViewAuthComponent from '@/components/NoViewAuthComponent';
import RoleAddEditModal from '@/pages/System/Role/components/RoleAddEditModal';
import RoleAuthModal from '@/pages/System/Role/components/RoleAuthTree';
import RoleDetailModal from '@/pages/System/Role/components/RoleDetailModal';
import type { RootState } from '@/stores';
import { apiErrorMessage } from '@/utils/apiErrorMessage';
import api from '@/api';

// 导入组件

interface ResType {
  code: number;
  message: string;
  res: boolean;
  total: number;
}

interface RoleListItemType {
  id: string;
  no: number;
  role_name: string;
  description: string;
  creater_user_name: string;
  created_at: string;
}

interface RoleListType extends ResType {
  data: RoleListItemType[];
}

const Role = () => {
  const rolePermission = useSelector((state: RootState) => state.user.userinfo?.buttons);

  // 筛选条件
  const [keyword, setKeyword] = useState<string>('');

  // 表格
  const pageSize = 10;
  const [tableData, setTableData] = useState<RoleListItemType[]>([]);
  const [recordData, setRecordData] = useState<RoleListItemType>();
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // 是否处于点击了查询按钮状态
  const [isSearch, setIsSearch] = useState<boolean>(false);

  // 模态框
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showRoleAuthModal, setShowRoleAuthModal] = useState<boolean>(false);
  const [showRoleAddEditModal, setShowRoleAddEditModal] = useState<boolean>(false);

  // 当前编辑角色id
  const [role_id, setRoleId] = useState<string>();

  /** 表格参数及表格配置 */
  const columns: TableProps<RoleListItemType>['columns'] = [
    {
      title: '序号',
      dataIndex: 'no',
      key: 'no',
      width: 80,
      align: 'center',
    },
    {
      title: '角色名称',
      dataIndex: 'role_name',
      key: 'role_name',
      align: 'center',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creater_user_name',
      key: 'creater_user_name',
      align: 'center',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 350,
      render: (text, row) => (
        <Space
          style={{
            cursor: 'pointer',
            color: '#2378f7',
            fontSize: '15px',
          }}
        >
          {!rolePermission.includes('role:base:detai') &&
          !rolePermission.includes('role:base:edit') &&
          !rolePermission.includes('role:base:del') &&
          (!rolePermission.includes('role:auth:system-list') ||
            !rolePermission.includes('role:auth:user-list')) ? (
            <span style={{ color: '#000' }}>暂无操作</span>
          ) : (
            <>
              <span onClick={() => visibleRow(row.id)}>
                <AuthComponent permission="role:base:detail" type="link" title="查看">
                  查看
                </AuthComponent>
              </span>
              <span onClick={() => editRow(row)}>
                <AuthComponent permission="role:base:edit" type="link" title="编辑">
                  编辑
                </AuthComponent>
              </span>
              <Popconfirm
                title="删除角色"
                description="删除后数据无法恢复，请确认是否继续。"
                onConfirm={() => deleteRow(row.id)}
              >
                <AuthComponent permission="role:base:del" type="link" title="删除" danger>
                  删除
                </AuthComponent>
              </Popconfirm>
              {rolePermission.includes('role:auth:system-list') &&
                rolePermission.includes('role:auth:user-list') && (
                  <span onClick={() => assignRoleAuth(row.id)}>
                    <AuthComponent permission="role:auth:system-list" type="link" title="分配权限">
                      分配权限
                    </AuthComponent>
                  </span>
                )}
            </>
          )}
        </Space>
      ),
      align: 'center',
    },
  ];
  /** 表格操作方法 */
  // 查询
  const handleSearch = () => {
    setIsSearch(true);
    getTableData(true, 1);
    setCurrentPage(1);
  };

  // 重置
  const handleInitialization = () => {
    setKeyword('');
    if (!isSearch && currentPage === 1) return;
    setIsSearch(false);
    setCurrentPage(1);
    getTableData(false, 1);
  };
  // 新增角色按钮
  const addRow = () => {
    setRecordData(null);
    setShowRoleAddEditModal(true);
  };
  // 查看
  const visibleRow = (id: string) => {
    console.log('你好111');
    setRoleId(id);
    setShowDetailModal(true);
  };
  // 编辑角色按钮
  const editRow = async (item: RoleListItemType) => {
    console.log('RoleListItemType', item);
    setRecordData(item);
    setShowRoleAddEditModal(true);
  };
  // 删除角色
  const deleteRow = async (role_id: string) => {
    try {
      const res = await api.role.deleteRole(role_id);
      message.success('删除角色成功');
      if (tableData.length === 1) {
        getTableData(isSearch, 1);
      } else {
        getTableData(isSearch, currentPage);
      }
    } catch (error: unknown) {
      apiErrorMessage(error);
    }
  };
  const assignRoleAuth = async (role_id: string) => {
    // 获取该角色id的权限数据
    const { data } = await api.role.getRolePermission(role_id);
    setAssignRoleId(role_id);
    setRoleAuths(data);
    setShowRoleAuthModal(true);
  };

  /** 分配角色权限 */
  const [assignRoleId, setAssignRoleId] = useState();
  // 当前行角色权限数据
  const [roleAuths, setRoleAuths] = useState([]);

  // 获取表格数据
  const getTableData = async (isWithCondition: boolean, page: number) => {
    try {
      setTableLoading(true);
      let payload = {};
      if (isWithCondition) {
        payload = {
          skip: pageSize * (page - 1),
          limit: pageSize,
          ...(keyword ? { keyword: keyword } : {}),
        };
      } else {
        payload = {
          skip: pageSize * (page - 1),
          limit: pageSize,
        };
      }
      const res: RoleListType = await apiClient.post('/role/roles/list', {
        ...payload,
      });
      const tempTableData = res.data.map((item, index) => {
        return {
          ...item,
          no: pageSize * (page - 1) + index + 1,
          created_at: `${item.created_at.slice(0, 10)} ${item.created_at.slice(11, 19)}`,
        };
      });
      setTableData(tempTableData);
      setTotal(res.total);
    } catch (error: unknown) {
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getTableData(isSearch, 1);
  }, []);

  return (
    <>
      {rolePermission.includes('role:base:query') ? (
        <div>
          <div className={'role-head'}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                关键词
                <Tooltip
                  title="输入关键词后点击查询，系统会同时检索「角色名称」和「角色描述」并合并结果"
                  placement="topLeft"
                >
                  <QuestionCircleOutlined
                    style={{ cursor: 'help', color: '#999', margin: '0 3px' }}
                  />
                </Tooltip>
                ：
              </div>
              <Input
                // disabled={isSearch}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入关键词"
                style={{ width: 200 }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 20,
              }}
            >
              <Button
                disabled={keyword === ''}
                color={'primary'}
                variant={'solid'}
                onClick={() => handleSearch()}
              >
                查询
              </Button>
              <Button onClick={() => handleInitialization()}>重置</Button>
              <AuthComponent permission="role:base:add" onClick={addRow}>
                新增
              </AuthComponent>
            </div>
          </div>
          <div className={'role-body'}>
            <Table<RoleListItemType>
              loading={tableLoading}
              columns={columns}
              dataSource={tableData}
              pagination={false}
              scroll={{
                y: 'max(70px, calc(100vh - 104px - 48px - 80px - 56px - 30px - 55px))',
              }}
            />
          </div>
          <div className={'role-foot'}>
            <Pagination
              align="end"
              current={currentPage}
              total={total}
              pageSize={pageSize}
              showTotal={(total) => `共 ${total} 条`}
              showSizeChanger={false}
              onChange={(page) => {
                getTableData(isSearch, page);
                setCurrentPage(page);
              }}
            />
          </div>

          <RoleDetailModal
            visible={showDetailModal}
            roleId={role_id}
            onCancel={() => setShowDetailModal(false)}
          />

          <RoleAddEditModal
            visible={showRoleAddEditModal}
            record={recordData}
            onCancel={() => setShowRoleAddEditModal(false)}
            onOk={(type) => {
              if (type === 'edit') {
                getTableData(isSearch, currentPage);
              } else {
                handleInitialization();
                if (currentPage === 1) getTableData(false, 1);
              }
            }}
          />

          <RoleAuthModal
            role_id={assignRoleId}
            roleAuths={roleAuths}
            open={showRoleAuthModal}
            onClose={setShowRoleAuthModal}
          />
        </div>
      ) : (
        <NoViewAuthComponent />
      )}
    </>
  );
};
export default Role;
