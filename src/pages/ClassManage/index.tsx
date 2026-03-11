import React, { useEffect, useState } from 'react';

import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderOpenOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';

import api from '../../api';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

function ClassManage() {
  // --- 状态管理 ---
  const [classList, setClassList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [activeClassId, setActiveClassId] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [animKey, setAnimKey] = useState(0); // 用于触发学生列表动画

  // 弹窗可见性状态
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  // 表单实例
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [importForm] = Form.useForm();

  // --- 初始化获取班级列表 ---
  const fetchClassList = async () => {
    setLoadingList(true);
    try {
      const res = await api.teacher.class_list('');
      if (res && res.code === 200) {
        const classes = res.data || [];
        setClassList(classes);
        // 如果列表有数据且当前没有选中的班级，或者选中的班级被删除了，默认选中第一个
        if (
          classes.length > 0 &&
          (!activeClassId || !classes.find((c) => c.class_id === activeClassId))
        ) {
          const firstClassId = classes[0].class_id;
          setActiveClassId(firstClassId);
          fetchStudents(firstClassId);
        } else if (classes.length === 0) {
          setActiveClassId(null);
          setStudentList([]);
        }
      }
    } catch (error) {
      console.error('获取班级列表失败:', error);
      message.error('获取班级列表失败');
    } finally {
      setLoadingList(false);
    }
  };

  // --- 根据 class_id 获取学生列表 ---
  const fetchStudents = async (classId) => {
    if (!classId) return;
    setLoadingStudents(true);
    try {
      const res = await api.teacher.class_students({ class_id: classId });
      if (res && res.code === 200) {
        setStudentList(res.data || []);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error('获取学生列表失败');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchClassList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 交互处理函数 ---
  const handleClassClick = (id) => {
    if (activeClassId !== id) {
      setActiveClassId(id);
      setAnimKey((prev) => prev + 1); // 每次点击不同的班级，更新 key 触发 CSS 动画
      fetchStudents(id);
    }
  };

  const openEditModal = (cls) => {
    // 设置编辑表单回显数据
    editForm.setFieldsValue({
      class_name: cls.class_name,
      grade_name: cls.grade_name,
      remark: cls.remark,
      class_id: cls.class_id,
    });
    setIsEditModalVisible(true);
  };

  const handleCreateSubmit = () => {
    createForm.validateFields().then(async (values) => {
      console.log('🚀 ~ handleCreateSubmit ~ values:', values);

      try {
        const res = await api.teacher.create_class({ ...values, grade_name: values.grade_name[0] });
        if (res.code === 200) {
          message.success('班级创建成功');
          setIsCreateModalVisible(false);
          createForm.resetFields();
          fetchClassList(); // 刷新列表
        }
      } catch (error) {
        message.error('班级创建失败');
      }
    });
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then(async (values) => {
      try {
        const res = await api.teacher.update_class({ ...values, grade_name: values.grade_name[0] });
        if (res.code === 200) {
          message.success('班级信息已更新');
          setIsEditModalVisible(false);
          fetchClassList(); // 刷新列表
        }
      } catch (error) {
        message.error('班级更新失败');
      }
    });
  };

  const handleDelete = async (classId) => {
    try {
      const res = await api.teacher.delete_class(classId);
      if (res.code === 200) {
        message.success('删除成功');
        fetchClassList();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleImportSubmit = () => {
    importForm.validateFields().then(async (values) => {
      try {
        const formData = new FormData();
        formData.append('class_id', values.class_id);
        formData.append('file', values.file[0].originFileObj);

        const res = await api.teacher.import_students_xlsx(formData);
        if (res.code === 200) {
          message.success('学生信息导入成功');
          setIsImportModalVisible(false);
          importForm.resetFields();
          if (values.class_id === activeClassId) {
            fetchStudents(activeClassId);
            fetchClassList();
          } else {
            fetchClassList();
          }
        }
      } catch (error) {
        message.error('导入失败，请检查文件格式');
      }
    });
  };

  // --- 渲染相关 ---
  const activeClass = classList.find((c) => c.class_id === activeClassId);

  const studentColumns = [
    { title: '学号', align: 'center', width: 50, dataIndex: 'student_no', key: 'student_no' },
    {
      title: '姓名',
      align: 'center',
      width: 50,

      dataIndex: 'student_name',
      key: 'student_name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '已参与测验',
      align: 'center',
      width: 40,
      dataIndex: 'participated_quiz_count',
      key: 'participated_quiz_count',
    },
    {
      title: '平均正确率',
      align: 'center',
      width: 40,

      dataIndex: 'average_accuracy_rate',
      key: 'average_accuracy_rate',
      render: (accuracy) => {
        // 完全保留你原本的 Tag 颜色判断逻辑
        const color = accuracy >= 80 ? 'success' : accuracy >= 70 ? 'warning' : 'error';
        return <Tag color={color}>{accuracy}%</Tag>;
      },
    },
    {
      title: '最近提交',
      align: 'center',
      width: 60,

      dataIndex: 'recent_submitted_at',
      key: 'recent_submitted_at',
      render: (text) =>
        text ? (
          dayjs(text).format('YY-MM-DD HH:mm:ss')
        ) : (
          <Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            暂无提交
          </Text>
        ),
    },
    // {
    //   title: '操作',
    //   align: 'center',
    //   width: 60,

    //   key: 'action',
    //   render: () => (
    //     <Button
    //       type="link"
    //       size="small"
    //     >
    //       查看
    //     </Button>
    //   ),
    // },
  ];

  return (
    <>
      <Layout style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
        <Content>
          {/* 顶部 Header 区 */}
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
                班级管理
              </Title>
            </div>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {
                  importForm.setFieldsValue({ class_id: activeClassId });
                  setIsImportModalVisible(true);
                }}
              >
                导入学生
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
              >
                创建班级
              </Button>
            </Space>
          </div>

          {/* 班级卡片列表区 */}
          <Spin spinning={loadingList}>
            <Row
              gutter={[16, 16]}
              style={{ marginBottom: 24 }}
            >
              {classList.map((cls) => {
                const isActive = cls.class_id === activeClassId;
                return (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    key={cls.class_id}
                  >
                    <Card
                      hoverable
                      onClick={() => handleClassClick(cls.class_id)}
                      style={{
                        borderColor: isActive ? '#1890ff' : '#f0f0f0',
                        borderWidth: 2,
                        transition: 'all 0.3s',
                      }}
                      bodyStyle={{ padding: '20px 24px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <Title
                            level={5}
                            style={{ margin: 0 }}
                          >
                            {cls.class_name}
                          </Title>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            {cls.grade_name}
                          </Text>
                        </div>
                        {isActive && (
                          <Tag
                            color="blue"
                            style={{ margin: 0, border: 'none' }}
                          >
                            当前班级
                          </Tag>
                        )}
                      </div>

                      <Row
                        gutter={24}
                        style={{ marginBottom: 16 }}
                      >
                        <Col>
                          <Title
                            level={3}
                            style={{ margin: 0 }}
                          >
                            {cls.student_count}
                          </Title>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            学生人数
                          </Text>
                        </Col>
                        <Col>
                          <Title
                            level={3}
                            style={{ margin: 0 }}
                          >
                            {cls.finished_quiz_count}
                          </Title>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            已完成测验
                          </Text>
                        </Col>
                      </Row>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          style={{ padding: 0, color: '#8c8c8c' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(cls);
                          }}
                        >
                          编辑
                        </Button>
                        <Popconfirm
                          title="确定要删除这个班级吗？"
                          onConfirm={(e) => {
                            e.stopPropagation();
                            handleDelete(cls.class_id);
                          }}
                          onCancel={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ padding: 0, color: '#ff4d4f' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Spin>

          {/* 学生列表区 (带有波动动画) */}
          {activeClass && (
            <div
              key={animKey}
              className="animate-bounce"
            >
              <Card
                bordered={false}
                style={{ borderRadius: 8 }}
              >
                <Title
                  level={5}
                  style={{ marginBottom: 20 }}
                >
                  {activeClass.class_name} · 学生列表
                </Title>
                <Table
                  columns={studentColumns}
                  dataSource={studentList}
                  rowKey="student_id"
                  pagination={false}
                  loading={loadingStudents}
                />
              </Card>
            </div>
          )}
        </Content>
      </Layout>

      {/* --- Modals 区 --- */}

      {/* 1. 创建班级弹窗 */}
      <Modal
        title="创建班级"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={handleCreateSubmit}
        okText="创建班级"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="班级名称"
            name="class_name"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="如：高三(5)班" />
          </Form.Item>
          <Form.Item
            label="年级"
            name="grade_name"
            rules={[{ required: true, message: '请选择或输入年级' }]}
          >
            <Select
              // mode="tags"
              maxCount={1}
              placeholder="请选择年级"
            >
              <Option value="大一">大一</Option>
              <Option value="大二">大二</Option>
              <Option value="大三">大三</Option>
              <Option value="大四">大四</Option>
              <Option value="研一">研一</Option>
              <Option value="研二">研二</Option>
              <Option value="研三">研三</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注"
            name="remark"
          >
            <Input placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 2. 编辑班级弹窗 (带有回显) */}
      <Modal
        title="编辑班级"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="保存修改"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="class_id"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="班级名称"
            name="class_name"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="如：高三(5)班" />
          </Form.Item>
          <Form.Item
            label="年级"
            name="grade_name"
            rules={[{ required: true, message: '请选择年级' }]}
          >
            <Select
              // mode="tags"
              maxCount={1}
              placeholder="请选择年级"
            >
              <Option value="大一">大一</Option>
              <Option value="大二">大二</Option>
              <Option value="大三">大三</Option>
              <Option value="大四">大四</Option>
              <Option value="研一">研一</Option>
              <Option value="研二">研二</Option>
              <Option value="研三">研三</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注"
            name="remark"
          >
            <Input placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 3. 导入学生信息弹窗 */}
      <Modal
        title="导入学生信息"
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onOk={handleImportSubmit}
        okText="开始导入"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={importForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="选择班级"
            name="class_id"
            rules={[{ required: true, message: '请先选择要导入的班级' }]}
          >
            <Select placeholder="请选择班级">
              {classList.map((cls) => (
                <Option
                  key={cls.class_id}
                  value={cls.class_id}
                >
                  {cls.class_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: '请选择要上传的文件' }]}
          >
            <Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              accept=".xlsx,.xls"
            >
              <p className="ant-upload-drag-icon">
                <FolderOpenOutlined style={{ color: '#faad14' }} />
              </p>
              <p className="ant-upload-text">点击上传 xlsx 文件</p>
              <p
                className="ant-upload-hint"
                style={{ color: '#8c8c8c' }}
              >
                包含：学号、姓名、初始密码
              </p>
            </Dragger>
          </Form.Item>

          {/* 完全恢复你原本的下载模板样式结构 */}
          <div style={{ marginTop: -10, marginBottom: 10 }}>
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              style={{ padding: 0 }}
              href="/test_stu_info.xlsx" // 替换为你 public 目录下的真实文件名
              download="学生导入模板.xlsx" // 这里可以自定义用户下载到本地后的默认文件名
            >
              下载导入模板
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default ClassManage;
