import React, { useState, useEffect } from 'react';

import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Layout,
  List,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Spin,
} from 'antd';
import api from '../../api';

// TODO: 请确保此处的 api 引用路径与你项目中的一致

const { Content } = Layout;
const { Title, Text } = Typography;

// 将 Table columns 移出组件外部，或根据具体需求放在内部
const recentTestsColumns = [
  {
    title: '测验名称',
    dataIndex: 'quiz_name',
    key: 'quiz_name',
    render: (text) => <Text strong>{text}</Text>,
  },
  {
    title: '班级',
    dataIndex: 'class_names',
    key: 'class_names',
    render: (classes) => (
      <Space
        size={[0, 8]}
        wrap
      >
        {classes?.map((cls) => (
          <Tag
            color="cyan"
            key={cls}
          >
            {cls}
          </Tag>
        ))}
      </Space>
    ),
  },
  {
    title: '提交率',
    dataIndex: 'submit_rate',
    key: 'submit_rate',
    render: (rate) => (
      <Space>
        <Progress
          percent={rate}
          showInfo={false}
          size="small"
          style={{ width: 100 }}
        />
        <Text type="secondary">{rate}%</Text>
      </Space>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      let color = 'default';
      let text = status;
      if (status === 'ongoing') {
        color = 'success';
        text = '进行中';
      } else if (status === 'expired') {
        color = 'error';
        text = '已过期';
      } else if (status === 'completed') {
        color = 'processing';
        text = '已完成';
      }
      return <Tag color={color}>{text}</Tag>;
    },
  },
  // {
  //   title: '操作',
  //   key: 'action',
  //   render: () => (
  //     <Button
  //       type="link"
  //       style={{ padding: 0 }}
  //     >
  //       查看 <ArrowRightOutlined />
  //     </Button>
  //   ),
  // },
];

function OverView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const iconStyle = { fontSize: '24px', color: '#1890ff' };
  const cardHeadStyle = { borderBottom: 'none', color: '#8c8c8c' };
  const cardBodyStyle = { display: 'flex', flexDirection: 'column', height: '100%' };
  const statCardTitleStyle = { marginBottom: 0, fontWeight: 700, color: '#1890ff' };
  const statCardSecondaryStyle = { display: 'block', color: '#bfbfbf', fontSize: '12px' };

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        // 调用教师端总览接口
        const res = await api.teacher.overview();
        if (res && res.code === 200) {
          setData(res.data);
        }
      } catch (error) {
        console.error('获取总览数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // 数据加载中显示 Loading 态，避免页面闪烁或报错
  if (loading || !data) {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin
          size="large"
          tip="数据加载中..."
        />
      </Layout>
    );
  }

  // 格式化测验列表数据，补充 key 属性
  const formattedRecentQuizzes = data.recent_quizzes.map((quiz) => ({
    ...quiz,
    key: quiz.quiz_id,
  }));

  // 格式化错误 Top 5 数据
  const formattedTopErrors = data.typical_errors_top5.map((error, index) => ({
    rank: index + 1,
    name: error.pattern_name,
    test: `${error.quiz_name || '未知测验'} - ${error.question_content}`,
    hitCount: error.hit_count,
  }));

  return (
    <Layout style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <Content>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title
            level={2}
            style={{ marginBottom: 4 }}
          >
            早上好，王老师 🌞
          </Title>
          {/* 这里也可以根据需要替换为动态日期，目前只把动态进行的场次替换了 */}
          <Text type="secondary">本周共 {data.ongoing_quiz_count} 场测验进行中</Text>
        </div>

        {/* Stats Cards */}
        <Row
          gutter={[16, 16]}
          style={{ marginBottom: 24 }}
        >
          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              bordered={false}
              title="进行中测验"
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              extra={<CalendarOutlined style={iconStyle} />}
            >
              <Title
                level={2}
                style={statCardTitleStyle}
              >
                {data.ongoing_quiz_count}
              </Title>
              <Text style={statCardSecondaryStyle}>总计 {data.total_quiz_count} 场</Text>
            </Card>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              bordered={false}
              title="班级总数"
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              extra={<BankOutlined style={iconStyle} />}
            >
              <Title
                level={2}
                style={statCardTitleStyle}
              >
                {data.total_class_count}
              </Title>
              <Text style={statCardSecondaryStyle}>共 {data.total_student_count} 名学生</Text>
            </Card>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              bordered={false}
              title="题库总量"
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              extra={<FileSearchOutlined style={iconStyle} />}
            >
              <Title
                level={2}
                style={statCardTitleStyle}
              >
                {data.total_question_count}
              </Title>
              <Text style={statCardSecondaryStyle}>
                本周新增 {data.weekly_new_question_count} 题
              </Text>
            </Card>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              bordered={false}
              title="平均正确率"
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              extra={<RiseOutlined style={iconStyle} />}
            >
              <Title
                level={2}
                style={statCardTitleStyle}
              >
                {data.average_accuracy_rate}%
              </Title>
              <Text style={statCardSecondaryStyle}>
                较上周{' '}
                {data.accuracy_rate_trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
                {data.accuracy_rate_trend === 'down' && (
                  <FallOutlined style={{ color: '#ff4d4f' }} />
                )}
                {data.accuracy_rate_trend === 'flat' && (
                  <MinusOutlined style={{ color: '#bfbfbf' }} />
                )}{' '}
                {data.accuracy_rate_compare_last_week}%
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Content Area */}
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            lg={16}
          >
            <Card
              bordered={false}
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span>最近测验</span>
                </Space>
              }
              headStyle={{ borderBottom: '1px solid #f0f0f0' }}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={recentTestsColumns}
                dataSource={formattedRecentQuizzes}
                pagination={false}
                bordered={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col
            xs={24}
            lg={8}
          >
            <Card
              bordered={false}
              title={
                <Space>
                  <WarningOutlined style={{ color: '#fa8c16' }} />
                  <span>典型错误 Top 5</span>
                </Space>
              }
              headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={formattedTopErrors}
                renderItem={(item) => (
                  <List.Item
                    extra={
                      <Text
                        type="danger"
                        strong
                      >
                        {item.hitCount} 次
                      </Text>
                    }
                    style={{ borderBottom: 'none', padding: '12px 0' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: '#1890ff',
                            border: 'none',
                            verticalAlign: 'middle',
                          }}
                          size="small"
                        >
                          {item.rank}
                        </Avatar>
                      }
                      title={<Text strong>{item.name}</Text>}
                      description={item.test}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default OverView;
