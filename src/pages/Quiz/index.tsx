import { useState, useEffect } from 'react';

import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Layout,
  Progress,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';

// 请确保引入 api 的路径正确
import api from '../../api';
import CreateQuizModal from '../../components/Layout/components/CreatQuizModal';

const { Content } = Layout;
const { Title, Text } = Typography;

// --- 主页面组件 ---
function Quiz() {
  const [filterStatus, setFilterStatus] = useState('全部');
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 获取接口数据 ---
  const fetchQuizzes = async (currentStatus = filterStatus) => {
    setLoading(true);
    try {
      // 映射前端中文状态到后端英文状态
      let apiStatus = '';
      if (currentStatus === '进行中') apiStatus = 'ongoing';
      if (currentStatus === '已完成') apiStatus = 'completed';
      if (currentStatus === '已过期') apiStatus = 'expired';

      const res = await api.teacher.quiz_list({
        status: apiStatus,
        page: 1,
        page_size: 1000, // 此处先拉取大量数据满足本地展示，后续可加真实分页
      });

      if (res && res.code === 200) {
        // 将后端数据映射为你原本 mock 数据所需的字段结构
        const mappedData = (res.data.items || []).map((item) => {
          let cnStatus = '未知';
          if (item.status === 'ongoing') cnStatus = '进行中';
          if (item.status === 'completed') cnStatus = '已完成';
          if (item.status === 'expired') cnStatus = '已过期';

          return {
            id: item.quiz_id,
            name: item.quiz_name,
            classes: (item.class_list || []).map((c) => c.class_name),
            questionCount: item.question_count,
            // 格式化时间为 YYYY-MM-DD HH:mm
            deadline: item.deadline_at ? item.deadline_at.replace('T', ' ').substring(0, 16) : '-',
            submitRate: item.submit_rate,
            avgScore: item.average_score,
            status: cnStatus,
          };
        });
        setQuizData(mappedData);
      }
    } catch (error) {
      console.error('获取测验列表失败', error);
      message.error('获取测验列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 表格列配置 ---
  const columns = [
    {
      title: '测验名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 80,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '班级',
      dataIndex: 'classes',
      key: 'classes',
      align: 'center',
      width: 80,
      render: (classes) => (
        <Space
          size={[0, 8]}
          wrap
        >
          {classes.map((cls) => (
            <Tag
              key={cls}
              color="blue"
              style={{ margin: '0 2px' }}
            >
              {cls}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '题目数',
      align: 'center',
      width: 80,
      dataIndex: 'questionCount',
      key: 'questionCount',
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      align: 'center',
      width: 80,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '提交率',
      dataIndex: 'submitRate',
      key: 'submitRate',
      align: 'center',
      width: 80,
      render: (rate) => (
        <Space>
          <Progress
            percent={rate}
            showInfo={false}
            size="small"
            style={{ width: 80 }}
            strokeColor={rate === 100 ? '#52c41a' : '#1890ff'}
          />
          <Text type="secondary">{rate}%</Text>
        </Space>
      ),
    },
    {
      title: '平均分',
      align: 'center',
      width: 80,
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score) => (score ? <Text>{score}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 80,
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === '进行中') color = 'processing';
        if (status === '已过期') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    // {
    //   title: '操作',
    //   align: 'center',
    //   width: 80,
    //   key: 'action',
    //   render: () => (
    //     <Button
    //       type="link"
    //       style={{ padding: 0, color: '#8c8c8c' }}
    //       className="hover-blue"
    //     >
    //       查看 <ArrowRightOutlined />
    //     </Button>
    //   ),
    // },
  ];

  // --- 交互与过滤 ---
  const handleStatusChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    fetchQuizzes(status);
  };

  return (
    <>
      {/* 简单的悬浮变色样式 */}
      <style>
        {`
          .hover-blue:hover { color: #1890ff !important; }
          .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
            z-index: 1;
            color: #1890ff;
            background: #e6f7ff;
            border-color: #1890ff;
          }
        `}
      </style>

      <Layout style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
        <Content>
          {/* --- 顶部 Header --- */}
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
                测验管理
              </Title>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setQuizVisible(true)}
            >
              发起新测验
            </Button>
          </div>

          {/* --- 状态筛选与列表区 --- */}
          <Card
            bordered={false}
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          >
            {/* 状态筛选 Tabs */}
            <div
              style={{
                padding: '16px 0px',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa',
              }}
            >
              <Radio.Group
                value={filterStatus}
                onChange={handleStatusChange}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="全部">全部</Radio.Button>
                <Radio.Button value="进行中">进行中</Radio.Button>
                <Radio.Button value="已完成">已完成</Radio.Button>
                <Radio.Button value="已过期">已过期</Radio.Button>
              </Radio.Group>
            </div>

            {/* 列表 Table */}
            <Table
              columns={columns}
              dataSource={quizData}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Content>
      </Layout>

      {/* --- 发起新测验弹窗 --- */}
      <CreateQuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        onSuccess={() => fetchQuizzes()} // 测验发布成功后刷新列表
      />
    </>
  );
}

export default Quiz;
