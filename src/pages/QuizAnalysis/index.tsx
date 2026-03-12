import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Select,
  Radio,
  Table,
  Tag,
  Space,
  Button,
  Drawer,
  Avatar,
  Image,
  Modal,
  Spin,
  Empty,
  Pagination,
} from 'antd';
import {
  ArrowRightOutlined,
  CloseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import api from '@/api'; // 根据你的项目路径调整

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// ============================================================
// 类型定义（与后端接口字段严格对应）
// ============================================================

interface QuizNameItem {
  quiz_id: number;
  quiz_name: string;
}

interface ScoreDistribution {
  '0_59': number;
  '60_69': number;
  '70_79': number;
  '80_89': number;
  '90_100': number;
}

interface QuestionAccuracyItem {
  question_id: number;
  content_md: string;
  accuracy_rate: number;
}

interface AnalysisSummary {
  total_quiz_count: number;
  ongoing_quiz_count: number;
  completed_quiz_count: number;
  expired_quiz_count: number;
  submitted_student_count: number;
  expected_student_count: number;
  unsubmitted_student_count: number;
  submit_rate: number;
  average_score: number;
  full_score: number;
  average_accuracy: number;
  score_compare_last_quiz: number;
  score_trend: 'up' | 'down' | 'same';
  average_duration_sec: number;
  fastest_duration_sec: number;
  score_distribution: ScoreDistribution;
  question_accuracy_list: QuestionAccuracyItem[];
}

interface ClassStatItem {
  class_id: number;
  class_name: string;
  student_count: number;
  submitted_student_count: number;
  submit_rate: number;
  average_score: number;
}

interface TypicalErrorSample {
  answer_id: number;
  student_id: number;
  student_name: string;
  answer_text: string;
  image_urls: string[];
  is_primary: boolean;
}

interface TypicalErrorPattern {
  pattern_id: number;
  pattern_name: string;
  pattern_desc: string;
  suggestion_text: string;
  hit_count: number;
  sample_answers: TypicalErrorSample[];
}

interface QuestionClassStat {
  question_id: number;
  content_md: string;
  question_image_urls: string[];
  answer_count: number;
  correct_count: number;
  accuracy_rate: number;
  typical_error_rate: number;
  correct_answer_samples: TypicalErrorSample[];
  typical_error_samples: TypicalErrorPattern[];
}

interface StudentAnswerItem {
  submission_id: number | null;
  student_id: number;
  student_no: string;
  student_name: string;
  submission_status: 'not_submitted' | 'submitted' | 'reviewed';
  grading_status: 'not_submitted' | 'grading' | 'graded';
  result: 'correct' | 'wrong' | 'unanswered';
  ai_score: number;
  final_score: number;
  ai_feedback: string | null;
  is_typical_error: boolean;
  submitted_at: string | null;
  duration_sec: number;
}

interface StudentAnswerListData {
  total: number;
  page: number;
  page_size: number;
  items: StudentAnswerItem[];
}

interface AnswerDetail {
  answer_id: number | null;
  question_id: number;
  question_content: string;
  question_image_urls: string[];
  answer_text: string | null;
  answer_image_urls: string[];
  result: 'correct' | 'wrong' | 'unanswered';
  grading_status: string;
  ai_score: number;
  score: number;
  ai_feedback: string | null;
  teacher_feedback: string | null;
  typical_errors: Array<{
    pattern_id: number;
    pattern_name: string;
    pattern_desc: string;
    suggestion_text: string;
    is_primary: boolean;
  }>;
}

interface StudentAnswerDetail {
  submission_id: number;
  quiz_id: number;
  quiz_name: string;
  class_id: number;
  class_name: string;
  student_id: number;
  student_no: string;
  student_name: string;
  submission_status: string;
  submitted_at: string;
  accuracy_rate: number;
  answers: AnswerDetail[];
}

// ============================================================
// 工具函数
// ============================================================

/** 秒数格式化为 "X分X秒" */
function formatDuration(sec: number): string {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s}秒`;
}

/** 提交时间格式化 */
function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${min}`;
}

/** result 字段 → 中文标签 */
function ResultTag({ result, isTypicalError }: { result: string; isTypicalError?: boolean }) {
  return (
    <Space>
      {result === 'correct' && (
        <Tag
          color="success"
          style={{ borderRadius: 10 }}
        >
          √ 正确
        </Tag>
      )}
      {result === 'wrong' && (
        <Tag
          color="error"
          style={{ borderRadius: 10 }}
        >
          × 错误
        </Tag>
      )}
      {result === 'unanswered' && (
        <Tag
          color="default"
          style={{ borderRadius: 10 }}
        >
          — 未答
        </Tag>
      )}
      {isTypicalError && (
        <Tag
          color="orange"
          icon={<WarningOutlined />}
          style={{ borderRadius: 10 }}
        >
          典型错误
        </Tag>
      )}
    </Space>
  );
}

// ============================================================
// 主组件
// ============================================================

export default function QuizAnalysis() {
  // ── 筛选状态 ──────────────────────────────────────────────
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');
  const [activeQuestion, setActiveQuestion] = useState<QuestionClassStat | null>(null);
  const [studentFilter, setStudentFilter] = useState<
    'all' | 'correct' | 'wrong' | 'unanswered' | 'typical'
  >('all');
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 10;

  // ── 控制学生列表是否展开 ────────────────────────────────────
  const [isStudentListVisible, setIsStudentListVisible] = useState(false);

  // ── 数据状态 ──────────────────────────────────────────────
  const [quizNameList, setQuizNameList] = useState<QuizNameItem[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [classList, setClassList] = useState<ClassStatItem[]>([]);
  const [questionList, setQuestionList] = useState<QuestionClassStat[]>([]);
  const [studentList, setStudentList] = useState<StudentAnswerListData | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentAnswerDetail | null>(null);

  // ── 加载状态 ──────────────────────────────────────────────
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingQuizList, setLoadingQuizList] = useState(false);

  // ── 抽屉 & 弹窗状态 ───────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStudentIndex, setDrawerStudentIndex] = useState(0);
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    title: string;
    content: string;
  }>({
    open: false,
    title: '',
    content: '',
  });

  // ============================================================
  // 数据加载函数
  // ============================================================

  /** 0. 实时请求下拉框测验列表 */
  const fetchQuizListRealtime = async () => {
    setLoadingQuizList(true);
    try {
      const res = await api.teacher.quiz_name_list();
      if (res && res.code === 200) {
        setQuizNameList(res.data || []);
      }
    } catch (e) {
      console.error('实时获取测验列表失败', e);
    } finally {
      setLoadingQuizList(false);
    }
  };

  /** 1. 初始化：拉取测验名称列表 + 全局摘要 */
  const loadInit = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const [nameRes, summaryRes] = await Promise.all([
        api.teacher.quiz_name_list(),
        api.teacher.analysis_summary(),
      ]);
      const names: QuizNameItem[] = nameRes?.data ?? [];
      setQuizNameList(names);
      setSummary(summaryRes?.data ?? null);
      // 默认选中第一个测验
      if (names.length > 0) {
        setSelectedQuizId(names[0].quiz_id);
      }
    } catch (e) {
      console.error('初始化失败', e);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    loadInit();
  }, [loadInit]);

  /** 2. 切换测验 → 拉取班级统计 */
  const loadClassStats = useCallback(async (quizId: number) => {
    setLoadingQuestions(true);
    setClassList([]);
    setQuestionList([]);
    setActiveQuestion(null);
    try {
      const res = await api.teacher.quiz_class_stats({ quiz_id: quizId });
      const classes: ClassStatItem[] = res?.data ?? [];
      setClassList(classes);
      // 默认选中"全部"，同时拉第一个班或全部
      setSelectedClassId('all');
      if (classes.length > 0) {
        await loadQuestionStats(quizId, classes[0].class_id);
      }
    } catch (e) {
      console.error('班级统计加载失败', e);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    if (selectedQuizId != null) {
      loadClassStats(selectedQuizId);
    }
  }, [selectedQuizId, loadClassStats]);

  /** 3. 切换班级 → 拉题目统计 */
  const loadQuestionStats = async (quizId: number, classId: number) => {
    setLoadingQuestions(true);
    setActiveQuestion(null);
    setStudentList(null); // 切换时清空旧学生数据
    try {
      const res = await api.teacher.quiz_class_question_stats({
        quiz_id: quizId,
        class_id: classId,
      });
      const list = res?.data ?? [];
      setQuestionList(list);

      // 如果题目列表有数据，自动选中第一题，让学生列表默认加载
      if (list.length > 0) {
        setActiveQuestion(list[0]);
        setStudentFilter('all');
        setStudentPage(1);
        // 传递最新的 classId 防止状态异步导致拉取到旧数据
        loadStudentList(list[0], classId);
      }
    } catch (e) {
      console.error('题目统计加载失败', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  /** 4. 点击"查看作答" → 一次性拉取该题的全量学生列表供本地过滤 */
  const loadStudentList = useCallback(
    async (question: QuestionClassStat, targetClassId: number | 'all' = selectedClassId) => {
      if (!selectedQuizId) return;
      setLoadingStudents(true);
      try {
        const res = await api.teacher.student_answer_list({
          quiz_id: selectedQuizId,
          class_id: targetClassId === 'all' ? undefined : targetClassId,
          question_id: question.question_id,
          // 强制请求第一页极大数据量，供前端纯本地筛选与分页
          page: 1,
          page_size: 1000,
        });
        setStudentList(res?.data ?? null);
      } catch (e) {
        console.error('学生列表加载失败', e);
      } finally {
        setLoadingStudents(false);
      }
    },
    [selectedQuizId, selectedClassId],
  );

  /** 5. 打开抽屉 → 拉学生作答详情 */
  const loadStudentDetail = async (submissionId: number | null, studentId: number) => {
    if (submissionId == null) {
      setStudentDetail(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const res = await api.teacher.student_answer_detail({ submission_id: submissionId });
      setStudentDetail(res?.data ?? null);
    } catch (e) {
      console.error('详情加载失败', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ============================================================
  // 事件处理 (纯前端操作为主)
  // ============================================================

  const handleQuizChange = (quizId: number) => {
    setSelectedQuizId(quizId);
    setActiveQuestion(null);
    setStudentList(null);
  };

  const handleClassChange = (e: any) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setActiveQuestion(null);
    setStudentList(null);
    if (!selectedQuizId) return;
    const targetClassId = classId === 'all' ? classList[0]?.class_id : classId;
    if (targetClassId) loadQuestionStats(selectedQuizId, targetClassId);
  };

  const handleViewAnswers = (question: QuestionClassStat) => {
    setIsStudentListVisible(true);
    setActiveQuestion(question);
    setStudentFilter('all');
    setStudentPage(1);
    loadStudentList(question);
  };

  const handleStudentFilterChange = (filter: any) => {
    setStudentFilter(filter);
    setStudentPage(1); // 仅本地切页
  };

  const handleStudentPageChange = (page: number) => {
    setStudentPage(page); // 仅本地切页
  };

  // ============================================================
  // 本地数据过滤与分页逻辑
  // ============================================================

  const filteredStudents = (studentList?.items ?? []).filter((s) => {
    if (studentFilter === 'all') return true;
    if (studentFilter === 'correct') return s.result === 'correct';
    if (studentFilter === 'wrong') return s.result === 'wrong';
    if (studentFilter === 'unanswered') return s.result === 'unanswered';
    if (studentFilter === 'typical') return s.is_typical_error;
    return true;
  });

  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * PAGE_SIZE,
    studentPage * PAGE_SIZE,
  );

  const openStudentDrawer = (index: number, item: StudentAnswerItem) => {
    // 根据当前页码和相对索引，计算在 filteredStudents 中的绝对索引
    const absoluteIndex = (studentPage - 1) * PAGE_SIZE + index;
    setDrawerStudentIndex(absoluteIndex);
    setDrawerOpen(true);
    loadStudentDetail(item.submission_id, item.student_id);
  };

  const navigateDrawer = (delta: number) => {
    const newIndex = drawerStudentIndex + delta;
    if (newIndex < 0 || newIndex >= filteredStudents.length) return;
    setDrawerStudentIndex(newIndex);
    const next = filteredStudents[newIndex];
    loadStudentDetail(next.submission_id, next.student_id);
  };

  const activeStudentItem = filteredStudents[drawerStudentIndex];

  // ============================================================
  // ECharts 配置
  // ============================================================

  const getScoreDistributionOption = () => {
    if (!summary) return {};
    const dist = summary.score_distribution;
    const data = [
      { name: '0-59', value: dist['0_59'] },
      { name: '60-69', value: dist['60_69'] },
      { name: '70-79', value: dist['70_79'] },
      { name: '80-89', value: dist['80_89'] },
      { name: '90-100', value: dist['90_100'] },
    ];
    const colors = ['#bae0ff', '#69c0ff', '#1890ff', '#0958d9', '#003eb3'];
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#8c8c8c' },
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
      series: [
        {
          name: '人数',
          type: 'bar',
          barWidth: '60%',
          data: data.map((d, i) => ({ value: d.value, itemStyle: { color: colors[i] } })),
        },
      ],
    };
  };

  const getAccuracyOption = () => {
    if (!summary || !summary.question_accuracy_list?.length) return {};
    const list = summary.question_accuracy_list.slice(0, 10).map((q) => ({
      name: q.content_md,
      value: q.accuracy_rate,
    }));
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div style="font-weight:bold;margin-bottom:4px;">${data.name}</div>
            <span style="display:inline-block;margin-right:4px;border-radius:10px;width:8px;height:8px;background-color:${data.color};"></span>
            正确率: <b>${data.value}%</b>
          `;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: list.map((q) => (q.name.length > 6 ? q.name.slice(0, 6) + '…' : q.name)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: {
          color: '#8c8c8c',
          interval: 0,
          rotate: list.length > 6 ? 30 : 0,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
        axisLabel: { color: '#8c8c8c', formatter: '{value}%' },
      },
      series: [
        {
          type: 'bar',
          data: list.map((q) => {
            const v = q.value;
            const color = v >= 80 ? '#52c41a' : v >= 60 ? '#faad14' : '#ff4d4f';
            return { value: v, itemStyle: { color } };
          }),
          barMaxWidth: 36,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: '#595959',
            fontWeight: 'bold',
          },
          markLine: {
            data: [{ type: 'average', name: '平均值' }],
            lineStyle: { type: 'dashed', color: '#1890ff' },
            label: { formatter: '平均 {c}%', position: 'insideEndTop' },
            symbol: ['none', 'none'],
          },
        },
      ],
    };
  };

  // ============================================================
  // 表格列定义
  // ============================================================

  const questionColumns = [
    {
      title: '题目',
      align: 'center',
      width: 80,
      dataIndex: 'content_md',
      key: 'content_md',
      render: (_: string, _r: QuestionClassStat, i: number) => `第${i + 1}题`,
    },
    {
      title: '题干预览',
      align: 'center',
      width: 150,
      key: 'preview',
      render: (_: any, record: QuestionClassStat) => (
        <Space style={{ display: 'flex', alignItems: 'center' }}>
          {record.question_image_urls?.length > 0 && (
            <Image
              width={28}
              height={28}
              src={record.question_image_urls[0]}
              style={{ borderRadius: 4, objectFit: 'cover' }}
              preview={{ mask: <EyeOutlined /> }}
            />
          )}
          <Text
            style={{ maxWidth: 200, fontFamily: 'monospace', cursor: 'pointer', color: '#595959' }}
            ellipsis={{ tooltip: '点击查看全文' }}
            onClick={() =>
              setPreviewModal({ open: true, title: '题目全文', content: record.content_md })
            }
          >
            {record.content_md}
          </Text>
        </Space>
      ),
    },
    {
      title: selectedClassId === 'all' ? '全局正确率' : '全班正确率',
      dataIndex: 'accuracy_rate',
      align: 'center',
      width: 60,
      key: 'accuracy_rate',
      render: (val: number) => {
        const color = val >= 80 ? 'success' : val >= 60 ? 'warning' : 'error';
        return (
          <Tag
            color={color}
            style={{ borderRadius: 10 }}
          >
            {Number(val).toFixed(2)}%
          </Tag>
        );
      },
    },
    {
      title: '典型错误率',
      align: 'center',
      width: 60,
      dataIndex: 'typical_error_rate',
      key: 'typical_error_rate',
      render: (val: number) =>
        val > 0 ? (
          <Tag
            color="orange"
            icon={<WarningOutlined />}
            style={{ borderRadius: 10 }}
          >
            {Number(val).toFixed(2)}%
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      title: '操作',
      align: 'center',
      width: 80,
      key: 'action',
      render: (_: any, record: QuestionClassStat) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => handleViewAnswers(record)}
        >
          查看作答 <ArrowRightOutlined />
        </Button>
      ),
    },
  ];

  const studentColumns = [
    {
      title: '姓名',
      align: 'center',
      width: 80,
      dataIndex: 'student_name',
      key: 'student_name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { title: '学号', align: 'center', width: 80, dataIndex: 'student_no', key: 'student_no' },
    {
      title: '结果',
      align: 'center',
      width: 80,
      key: 'result',
      render: (_: any, record: StudentAnswerItem) => (
        <ResultTag
          result={record.result}
          isTypicalError={record.is_typical_error}
        />
      ),
    },
    {
      title: '提交时间',
      align: 'center',
      width: 80,
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (val: string | null) => formatTime(val),
    },
    {
      title: '用时',
      align: 'center',
      width: 80,
      dataIndex: 'duration_sec',
      key: 'duration_sec',
      render: (val: number) => formatDuration(val),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_: any, record: StudentAnswerItem, index: number) => (
        <Button
          type="link"
          style={{ color: '#1890ff' }}
          onClick={() => openStudentDrawer(index, record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .hover-blue:hover { color: #1890ff !important; }
        .stat-card-title { font-size: 32px; font-weight: 600; color: #262626; margin: 0; }
        .stat-card-subtitle { color: #8c8c8c; font-size: 13px; }
        .custom-select .ant-select-selector { border-radius: 8px !important; }
        .custom-radio-group .ant-radio-button-wrapper { border-radius: 6px; margin-right: 8px; border: 1px solid #d9d9d9; }
        .custom-radio-group .ant-radio-button-wrapper:last-child { margin-right: 0; }
        .custom-radio-group .ant-radio-button-wrapper::before { display: none; }
        .custom-radio-group .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) { color: #1890ff; background: #e6f7ff; border-color: #1890ff; }
        .info-box { background: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0; }
        .ai-box-error { background: #fff1f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #ffa39e; }
        .ai-box-success { background: #f6ffed; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #b7eb8f; }
        .warning-box { background: #fff7e6; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #ffd591; }
      `}</style>

      <Layout style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
        <Content>
          {/* ── 顶部标题 + 测验选择 ───────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 4,
                  height: 18,
                  backgroundColor: '#1890ff',
                  marginRight: 8,
                  borderRadius: 2,
                }}
              />
              <Title
                level={4}
                style={{ margin: 0 }}
              >
                总览
              </Title>
            </div>
          </div>

          {/* ── 核心指标卡片 ──────────────────────────────────── */}
          <Spin spinning={loadingSummary}>
            <Row
              gutter={[16, 16]}
              style={{ marginBottom: 24 }}
            >
              {[
                {
                  color: '#e84a44',
                  label: '已提交',
                  value: summary?.submitted_student_count ?? '—',
                  sub: `应提交 ${summary?.expected_student_count ?? '—'} 人`,
                },
                {
                  color: '#2a9d8f',
                  label: '提交率',
                  value: summary ? `${Number(summary.submit_rate).toFixed(2)}%` : '—',
                  sub: `${summary?.unsubmitted_student_count ?? '—'} 人未提交`,
                },
                {
                  color: '#457b9d',
                  label: '平均正确率',
                  value: summary ? `${Number(summary.average_accuracy).toFixed(2)}%` : '—',
                  sub: summary
                    ? `较上次 ${
                        summary.score_trend === 'up'
                          ? '↑'
                          : summary.score_trend === 'down'
                            ? '↓'
                            : '—'
                      } ${Math.abs(summary.score_compare_last_quiz)}%`
                    : '—',
                },
              ].map((card) => (
                <Col
                  span={8}
                  key={card.label}
                >
                  <Card
                    variant="borderless"
                    styles={{ body: { padding: '20px 24px' } }}
                    style={{
                      borderTop: `4px solid ${card.color}`,
                      borderRadius: 8,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Text type="secondary">{card.label}</Text>
                    <div className="stat-card-title">{card.value}</div>
                    <div className="stat-card-subtitle">{card.sub}</div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* ── 图表区 ────────────────────────────────────────── */}
            <Row
              gutter={[16, 16]}
              style={{ marginBottom: 24 }}
            >
              <Col span={12}>
                <Card
                  variant="borderless"
                  title={
                    <>
                      <span style={{ marginRight: 8 }}>📊</span>分数段分布
                    </>
                  }
                  styles={{ header: { borderBottom: 'none' } }}
                >
                  {summary ? (
                    <ReactECharts
                      option={getScoreDistributionOption()}
                      style={{ height: 250 }}
                    />
                  ) : (
                    <Empty
                      style={{
                        height: 250,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    />
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  variant="borderless"
                  title={
                    <>
                      <span style={{ marginRight: 8 }}>📋</span>各题正确率
                    </>
                  }
                  styles={{ header: { borderBottom: 'none' } }}
                >
                  {summary?.question_accuracy_list?.length ? (
                    <ReactECharts
                      option={getAccuracyOption()}
                      style={{ height: 250 }}
                    />
                  ) : (
                    <Empty
                      style={{
                        height: 250,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </Spin>

          {/* ── 测验选择与班级列表 ───────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 4,
                  height: 18,
                  backgroundColor: '#1890ff',
                  marginRight: 8,
                  borderRadius: 2,
                }}
              />
              <Title
                level={4}
                style={{ margin: 0 }}
              >
                详情
              </Title>
            </div>
            <Select
              className="custom-select"
              value={selectedQuizId ?? undefined}
              onChange={handleQuizChange}
              style={{ width: 200 }}
              popupMatchSelectWidth={false}
              onDropdownVisibleChange={(open) => {
                if (open) fetchQuizListRealtime();
              }}
              loading={loadingSummary || loadingQuizList}
              placeholder="请选择测验"
            >
              {quizNameList.map((q) => (
                <Option
                  key={q.quiz_id}
                  value={q.quiz_id}
                >
                  {q.quiz_name}
                </Option>
              ))}
            </Select>
          </div>

          <Card
            variant="borderless"
            styles={{ body: { padding: 0 } }}
            style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Title
                level={5}
                style={{ margin: 0 }}
              >
                班级列表
              </Title>
              <Radio.Group
                className="custom-radio-group"
                value={selectedClassId}
                onChange={handleClassChange}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="all">全部班级</Radio.Button>
                {classList.map((c) => (
                  <Radio.Button
                    key={c.class_id}
                    value={c.class_id}
                  >
                    {c.class_name}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>
            <div style={{ padding: '24px' }}>
              <Spin spinning={loadingQuestions}>
                <Table
                  columns={questionColumns}
                  dataSource={questionList}
                  rowKey="question_id"
                  pagination={false}
                  size="middle"
                  locale={{ emptyText: <Empty description="暂无题目数据" /> }}
                />
              </Spin>
            </div>
          </Card>

          {/* ── 学生作答列表 ──────────────────────────────────── */}
          {isStudentListVisible && (
            <Card
              variant="borderless"
              styles={{ body: { padding: 0 } }}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Title
                  level={5}
                  style={{ margin: 0 }}
                >
                  {activeQuestion
                    ? `${activeQuestion.content_md.slice(0, 20)}${activeQuestion.content_md.length > 20 ? '…' : ''} · 学生作答列表`
                    : '学生作答列表'}
                </Title>
                <Space>
                  <Radio.Group
                    className="custom-radio-group"
                    value={studentFilter}
                    onChange={(e) => handleStudentFilterChange(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                    disabled={!activeQuestion}
                  >
                    <Radio.Button value="all">全部</Radio.Button>
                    <Radio.Button value="correct">正确</Radio.Button>
                    <Radio.Button value="wrong">错误</Radio.Button>
                    <Radio.Button value="unanswered">未答</Radio.Button>
                    <Radio.Button value="typical">典型错误</Radio.Button>
                  </Radio.Group>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      if (activeQuestion) loadStudentList(activeQuestion);
                    }}
                    disabled={!activeQuestion}
                  />
                </Space>
              </div>
              <div style={{ padding: '24px' }}>
                <Spin spinning={loadingStudents}>
                  <Table
                    columns={studentColumns}
                    dataSource={paginatedStudents}
                    rowKey={(r) => r.student_id}
                    pagination={false}
                    size="middle"
                    locale={{
                      emptyText: (
                        <Empty
                          description={
                            activeQuestion ? '暂无符合条件的记录' : '请先在上方选择题目以查看作答'
                          }
                        />
                      ),
                    }}
                  />
                  {/* {filteredStudents.length > PAGE_SIZE && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                      <Pagination
                        current={studentPage}
                        pageSize={PAGE_SIZE}
                        total={filteredStudents.length}
                        onChange={handleStudentPageChange}
                        showTotal={(t) => `共 ${t} 人`}
                        size="small"
                      />
                    </div>
                  )} */}
                </Spin>
              </div>
            </Card>
          )}

          {/* ── 学生作答详情抽屉 ──────────────────────────────── */}
          <Drawer
            title="学生作答详情"
            placement="right"
            width={650}
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            destroyOnClose
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={() => navigateDrawer(-1)}
                  disabled={drawerStudentIndex === 0}
                >
                  ← 上一位
                </Button>
                <Text
                  type="secondary"
                  style={{ lineHeight: '32px' }}
                >
                  {drawerStudentIndex + 1} / {filteredStudents.length || 1}
                </Text>
                <Button
                  onClick={() => navigateDrawer(1)}
                  disabled={drawerStudentIndex >= (filteredStudents.length || 1) - 1}
                >
                  下一位 →
                </Button>
              </div>
            }
          >
            <Spin spinning={loadingDetail}>
              {/* 未提交情况 */}
              {!loadingDetail && !studentDetail && activeStudentItem && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>该学生未提交答案</div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13 }}
                  >
                    {activeStudentItem.student_name}（{activeStudentItem.student_no}）
                  </Text>
                </div>
              )}

              {studentDetail && (
                <>
                  {/* 学生信息 */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#fafafa',
                      padding: 20,
                      borderRadius: 8,
                      marginBottom: 24,
                      border: '1px solid #e8e8e8',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        size={48}
                        style={{ backgroundColor: '#1890ff', fontSize: 20 }}
                      >
                        {studentDetail.student_name.charAt(0)}
                      </Avatar>
                      <div style={{ marginLeft: 16 }}>
                        <Title
                          level={5}
                          style={{ margin: 0 }}
                        >
                          {studentDetail.student_name}
                        </Title>
                        <Text
                          type="secondary"
                          style={{ fontSize: 13 }}
                        >
                          {studentDetail.student_no} · {studentDetail.class_name}
                        </Text>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: 4 }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          提交时间：{formatTime(studentDetail.submitted_at)}
                        </Text>
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        综合正确率：{Number(studentDetail.accuracy_rate).toFixed(2)}%
                      </Text>
                    </div>
                  </div>

                  {/* 逐题展示 */}
                  {studentDetail.answers.map((ans, idx) => (
                    <div
                      key={ans.question_id}
                      style={{ marginBottom: 32 }}
                    >
                      <Title
                        level={5}
                        style={{ marginBottom: 12 }}
                      >
                        第 {idx + 1} 题
                        <ResultTag result={ans.result} />
                      </Title>

                      {/* 题目内容 */}
                      <Text
                        strong
                        style={{ display: 'block', marginBottom: 8 }}
                      >
                        题目内容
                      </Text>
                      <div
                        className="info-box"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        <div style={{ marginBottom: ans.question_image_urls?.length ? 12 : 0 }}>
                          {ans.question_content}
                        </div>
                        {ans.question_image_urls?.length > 0 && (
                          <Image.PreviewGroup>
                            <Space wrap>
                              {ans.question_image_urls.map((url) => (
                                <Image
                                  key={url}
                                  src={url}
                                  style={{ borderRadius: 8, maxHeight: 180, objectFit: 'contain' }}
                                  preview={{ mask: <EyeOutlined /> }}
                                />
                              ))}
                            </Space>
                          </Image.PreviewGroup>
                        )}
                      </div>

                      {/* 学生作答 */}
                      <Text
                        strong
                        style={{ display: 'block', marginBottom: 8 }}
                      >
                        学生作答
                      </Text>
                      <div
                        className="info-box"
                        style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                      >
                        {ans.answer_text ? (
                          <div style={{ marginBottom: ans.answer_image_urls?.length ? 12 : 0 }}>
                            {ans.answer_text}
                          </div>
                        ) : (
                          <Text type="secondary">（未填写文字）</Text>
                        )}
                        {ans.answer_image_urls?.length > 0 && (
                          <Image.PreviewGroup>
                            <Space
                              wrap
                              style={{ marginTop: ans.answer_text ? 0 : 8 }}
                            >
                              {ans.answer_image_urls.map((url) => (
                                <Image
                                  key={url}
                                  src={url}
                                  style={{ borderRadius: 8, maxHeight: 180, objectFit: 'contain' }}
                                  preview={{ mask: <EyeOutlined /> }}
                                />
                              ))}
                            </Space>
                          </Image.PreviewGroup>
                        )}
                      </div>

                      {/* AI 批改结果 */}
                      <Text
                        strong
                        style={{ display: 'block', marginBottom: 8 }}
                      >
                        大模型批改结果
                      </Text>
                      {ans.result === 'correct' ? (
                        <div className="ai-box-success">
                          <Tag
                            color="success"
                            icon={<CheckCircleOutlined />}
                          >
                            正确
                          </Tag>
                          <Text
                            type="secondary"
                            style={{ marginLeft: 8, fontSize: 12 }}
                          >
                            得分：{ans.score} 分
                          </Text>
                          {ans.ai_feedback && (
                            <p style={{ marginTop: 12, marginBottom: 0 }}>{ans.ai_feedback}</p>
                          )}
                        </div>
                      ) : ans.result === 'unanswered' ? (
                        <div className="info-box">
                          <Tag color="default">未答</Tag>
                          <Text
                            type="secondary"
                            style={{ marginLeft: 8, fontSize: 13 }}
                          >
                            该题未作答，得 0 分
                          </Text>
                        </div>
                      ) : (
                        <div className="ai-box-error">
                          <div style={{ marginBottom: 12 }}>
                            <Tag
                              color="error"
                              icon={<CloseCircleOutlined />}
                            >
                              错误
                            </Tag>
                            <Text
                              type="secondary"
                              style={{ marginLeft: 8, fontSize: 12 }}
                            >
                              得分：{ans.score} 分
                            </Text>
                          </div>
                          {ans.ai_feedback && (
                            <p>
                              <strong>AI 反馈：</strong>
                              {ans.ai_feedback}
                            </p>
                          )}
                          {ans.teacher_feedback && (
                            <p>
                              <strong>教师批注：</strong>
                              {ans.teacher_feedback}
                            </p>
                          )}
                          {ans.typical_errors?.length > 0 && (
                            <div
                              style={{
                                marginTop: 12,
                                paddingTop: 12,
                                borderTop: '1px dashed #ffa39e',
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  fontSize: 13,
                                  color: '#cf1322',
                                  display: 'block',
                                  marginBottom: 8,
                                }}
                              >
                                典型错误分析：
                              </Text>
                              {/* 移除了之前的 .filter(e => e.is_primary)，直接遍历整个数组 */}
                              {ans.typical_errors.map((e) => (
                                <div
                                  key={e.pattern_id}
                                  style={{
                                    marginTop: 8,
                                    padding: '8px 12px',
                                    background: '#fff',
                                    borderRadius: 6,
                                    border: `1px solid ${e.is_primary ? '#ffccc7' : '#ffe7ba'}`,
                                  }}
                                >
                                  <div style={{ marginBottom: 4 }}>
                                    <Tag color={e.is_primary ? 'red' : 'orange'}>
                                      {e.pattern_name}
                                    </Tag>
                                    {e.is_primary && (
                                      <Text
                                        type="danger"
                                        style={{ fontSize: 12, marginLeft: 4 }}
                                      >
                                        (主要错误)
                                      </Text>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 4 }}>
                                    <Text strong>错误表现：</Text>
                                    {e.pattern_desc}
                                  </div>
                                  {e.suggestion_text && (
                                    <div style={{ fontSize: 12, color: '#1890ff' }}>
                                      <Text
                                        strong
                                        style={{ color: '#0958d9' }}
                                      >
                                        复习建议：
                                      </Text>
                                      {e.suggestion_text}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 典型错误标记提示 */}
                      {activeStudentItem?.is_typical_error && ans.result === 'wrong' && (
                        <div className="warning-box">
                          <Space style={{ marginBottom: 8 }}>
                            <WarningOutlined style={{ color: '#fa8c16' }} />
                            <Text
                              strong
                              style={{ color: '#d46b08' }}
                            >
                              典型错误标记
                            </Text>
                          </Space>
                          <p style={{ margin: 0, color: '#d46b08', fontSize: 13 }}>
                            该错误在本题中出现频率{' '}
                            <strong>
                              {Number(activeQuestion?.typical_error_rate).toFixed(2) ?? '—'}%
                            </strong>
                            ， 系统已自动聚类标记，可重点关注并推送复习建议。
                          </p>
                        </div>
                      )}

                      {idx < studentDetail.answers.length - 1 && (
                        <div style={{ height: 1, background: '#f0f0f0', margin: '24px 0' }} />
                      )}
                    </div>
                  ))}
                </>
              )}
            </Spin>
          </Drawer>

          {/* ── 题目全文预览弹窗 ──────────────────────────────── */}
          <Modal
            title={previewModal.title}
            open={previewModal.open}
            onCancel={() => setPreviewModal((p) => ({ ...p, open: false }))}
            footer={[
              <Button
                key="close"
                type="primary"
                onClick={() => setPreviewModal((p) => ({ ...p, open: false }))}
              >
                关闭
              </Button>,
            ]}
          >
            <div
              style={{
                background: '#fafafa',
                padding: 16,
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                border: '1px solid #f0f0f0',
                marginTop: 16,
              }}
            >
              {previewModal.content}
            </div>
          </Modal>
        </Content>
      </Layout>
    </>
  );
}
