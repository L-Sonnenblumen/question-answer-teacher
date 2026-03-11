import { Pagination, Table } from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd';

import useFetchTableData from '@/hooks/useFetchTableData';

// 定义 Props 接口
interface CustomTableProps<T, P> extends Omit<TableProps<T>, 'columns'> {
  fetchMethod: (params: P) => Promise<any>;
  requestParam: P & { current?: number; pageSize?: number };
  onParamChange: (params: Partial<P>) => void;
  columns: TableProps<T>['columns'];
}

const CustomTable = <T extends object, P extends Record<string, any>>({
  fetchMethod,
  columns,
  requestParam,
  onParamChange,
  ...resetTableProps
}: CustomTableProps<T, P>) => {
  // 调用 Hook
  const { loading, tableData } = useFetchTableData<T, P>(fetchMethod, requestParam, onParamChange);

  const handlePaginationChange = (current: number, pageSize: number) => {
    onParamChange({
      ...requestParam,
      current,
      pageSize,
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination) {
      onParamChange({
        ...requestParam,
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
    }
  };

  return (
    <>
      <Table<T>
        className="table"
        {...resetTableProps}
        onChange={handleTableChange}
        loading={loading}
        dataSource={tableData.tableData}
        columns={columns}
        pagination={false}
        bordered={false}
        scroll={{
          y: 'calc(100vh - 24px - 24px - 40px - 64px - 96px - 48px - 55px)',
        }}
      />
      <div className="table-pagination">
        <Pagination
          current={requestParam.current ?? 1}
          pageSize={requestParam.pageSize ?? 10}
          total={tableData.total}
          pageSizeOptions={['10', '20']}
          // showSizeChanger
          showTotal={(total) => <span style={{ color: '#333' }}>共{total}条</span>}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
        />
      </div>
    </>
  );
};

export default CustomTable;
