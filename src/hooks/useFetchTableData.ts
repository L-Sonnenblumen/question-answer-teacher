import { useEffect, useState } from 'react';

// 统一的返回类型
interface FetchResult<T> {
  data: T[];
  total: number;
}

// 另一种返回类型
interface CountRows<T> {
  data: { count: number; rows: T[] };
}

type FetchMethod<T, P> = (params: P) => Promise<FetchResult<T> | CountRows<T>>;
type FetchResultLike<T> = FetchResult<T> | CountRows<T>;
// 真正能让 TS 区分的类型守卫
const isFetchResult = <T>(res: FetchResultLike<T>): res is FetchResult<T> =>
  Array.isArray(res.data);

const useFetchTableData = <T, P extends { current?: number; pageSize?: number }>(
  fetchMethod: FetchMethod<T, P>,
  params: P,
  onParamChange: (newParams: Partial<P>) => void
) => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<{ tableData: T[]; total: number }>({
    tableData: [],
    total: 0,
  });

  const fetchTableData = async () => {
    setLoading(true);
    try {
      // 拼装后端需要的字段名（示例：current_Page）
      const requestParams = { ...params, current_Page: params.current } as P;
      const response = await fetchMethod(requestParams);

      if (isFetchResult<T>(response)) {
        // 🔧 分支 1：{ data: T[], total: number }
        setTableData({ tableData: response.data, total: response.total });
      } else {
        // 🔧 分支 2：{ data: { count, rows } }
        const { count, rows } = response.data;
        setTableData({ tableData: rows, total: count });

        // 🔧 删到 0 条且不在第一页 → 回退一页
        if (!rows.length && (params.current ?? 1) > 1) {
          onParamChange({
            ...params,
            current: (params.current ?? 1) - 1,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [params]);

  return { loading, tableData };
};

export default useFetchTableData;
