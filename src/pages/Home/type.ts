export interface HomeStats {
  teacher_count: number;
  library_document_count: number;
  check_document_count: number;
  task_completed_count: number;
  task_running_count: number;
  task_pending_count: number;
  task_failed_count: number;
  high_risk_document_count: number;
}

export interface LevelStatsItem {
  level_id: string;
  level_name: string;
  library_document_count: number;
  check_document_count: number;
}
export interface CategoryStatsItem {
  category_id: string;
  category_name: string;
  library_document_count: number;
  check_document_count: number;
}
interface TaskStatItem {
  task_status: string;
  task_count: number;
}
export interface TaskStats {
  total_task_count: number;
  task_stats: TaskStatItem[];
}
export interface YearlyStatsItem {
  month: number;
  library_document_count: number;
  check_document_count: number;
}

// 1. 学院文档统计信息 (/home_page/department_docs_stats)
export interface DepartmentDocsStatItem {
  department_name: string;
  library_document_count: number;
  check_document_count: number;
  total_document_count: number;
}

// 2. 重复率分布统计 (/home_page/duplicate_rate_distribution)
export interface DuplicateRateDistributionItem {
  rate_range: string;
  document_count: number;
}

// 3. 任务成功率 (/home_page/task_success_rate)
// 注意：该接口 data 直接返回字符串，例如 "100.00%"，通常不需要单独写 interface，在使用时直接指明类型为 string 即可。
export type TaskSuccessRate = string;

// 4. 文档状态统计 (/home_page/document_status_stats)
export interface DocumentStatusStatItem {
  status: string;
  status_desc: string;
  document_count: number;
  percentage: string;
}

// 5. 教师待查重文档统计信息 (/home_page/top_teachers_by_check_document_count)
export interface TopTeacherStatItem {
  teacher_id: string;
  teacher_name: string;
  employee_no: string;
  check_document_count: number;
  rank: number;
}

// 6. 指定年份待查重文档数量 (/home_page/check_document_count_by_year)
export interface CheckDocumentCountByYearData {
  year: number;
  document_count: number;
}

// 7. 最近8年待查重文档数量 (/home_page/check_document_count_last_8_years)
export interface YearlyCheckDocumentCountItem {
  year: number;
  document_count: number;
}

// 8. 最近6个月风险文档分布统计 (/home_page/risk_document_count_last_6_months)
export interface RiskDocumentMonthlyItem {
  month: string;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  total_count: number;
}

// 9. 风险文档分布统计信息 (/home_page/risk_document_distribution)
export interface RiskDocumentDistributionData {
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  total_count: number;
  high_risk_percentage: string;
  medium_risk_percentage: string;
  low_risk_percentage: string;
}
