import React, { useState, useEffect } from 'react';
import {
  CameraOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  List,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  Image,
} from 'antd';
import api from '../../api'; // 请确保 api 路径正确
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

function Exercise() {
  // --- 状态管理 ---
  const [globalTags, setGlobalTags] = useState([]); // 存纯文本 tag_name 供原 UI 使用
  const [rawTags, setRawTags] = useState([]); // 存包含 tag_id 的完整标签对象
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTagFilter, setActiveTagFilter] = useState('全部');
  const [searchText, setSearchText] = useState('');

  // 弹窗控制
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isTagManageModalVisible, setIsTagManageModalVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // 题目全文预览弹窗控制
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState({ title: '', content: '' });

  const [questionForm] = Form.useForm();
  const [newTagForm] = Form.useForm();

  // --- 获取数据的初始化方法 ---
  const fetchTags = async () => {
    try {
      const res = await api.teacher.tag_list();
      if (res && res.code === 200) {
        const list = res.data || [];
        setRawTags(list);
        setGlobalTags(list.map((t) => t.tag_name));
      }
    } catch (error) {
      console.error('获取标签列表失败', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // 获取所有题目（目前默认请求第1页，1000条以实现原本的本地搜索逻辑，后续若数据量大可改为接口层面搜索）
      const res = await api.teacher.search_question({
        keyword: '',
        tag_ids: [],
        status: '',
        page: 1,
        page_size: 1000,
      });
      if (res && res.code === 200) {
        const mappedQuestions = (res.data.items || []).map((q) => ({
          id: q.question_id,
          content: q.content_md,
          imageUrl: q.images && q.images.length > 0 ? q.images[0].image_url : null,
          rawImages: q.images || [], // 🌟 核心：保留完整的图片原始数据供回显使用
          tags: (q.tags || []).map((t) => t.tag_name),
          createdAt: q.created_at ? q.created_at.substring(0, 10) : '',
          answer: q.reference_answer,
        }));
        setQuestions(mappedQuestions);
      }
    } catch (error) {
      console.error('获取题目列表失败', error);
      message.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchTag = activeTagFilter === '全部' || q.tags.includes(activeTagFilter);
    const matchSearch =
      q.content?.includes(searchText) || q.tags.some((t) => t.includes(searchText));
    return matchTag && matchSearch;
  });

  // --- 交互处理函数 ---
  const handleQuestionSubmit = () => {
    questionForm.validateFields().then(async (values) => {
      try {
        // 1. 处理标签（允许用户输入新标签自动创建）
        let tagIds = [];
        for (let tagName of values.tags || []) {
          let existingTag = rawTags.find((t) => t.tag_name === tagName);
          if (existingTag) {
            tagIds.push(existingTag.tag_id);
          } else {
            // 如果是新标签，先调用创建标签接口
            const tagRes = await api.teacher.create_tag({ tag_name: tagName });
            if (tagRes && tagRes.code === 200) {
              await fetchTags(); // 刷新获取最新 tag_id
            }
          }
        }

        // 重新比对获取所有最新 id
        const latestRawTags = await api.teacher.tag_list().then((r) => r.data || []);
        tagIds = (values.tags || [])
          .map((name) => {
            const t = latestRawTags.find((rt) => rt.tag_name === name);
            return t ? t.tag_id : null;
          })
          .filter((id) => id !== null);

        // 2. 构建 FormData
        const formData = new FormData();
        formData.append('content_md', values.content);
        if (values.answer) formData.append('reference_answer', values.answer);
        formData.append('question_type', 'default'); // 必填项，前端先设定一个默认值
        formData.append('tag_ids_json', JSON.stringify(tagIds));

        if (values.images && values.images.length > 0) {
          values.images.forEach((file) => {
            if (file.originFileObj) {
              formData.append('images', file.originFileObj);
            }
          });
        }

        // 3. 提交请求
        if (editingQuestionId) {
          formData.append('question_id', editingQuestionId);

          // 🌟 安全校验：判断用户是否上传了“新”文件或删除了所有图片
          const hasNewFiles = values.images && values.images.some((file) => file.originFileObj);
          const isAllDeleted = !values.images || values.images.length === 0;

          if (hasNewFiles || isAllDeleted) {
            formData.append('replace_images', true);
          } else {
            formData.append('replace_images', false); // 没动图片就不替换
          }

          await api.teacher.update_question(formData);
          message.success('题目修改成功');
        } else {
          await api.teacher.create_question(formData);
          message.success('题目添加成功');
        }

        setIsQuestionModalVisible(false);
        questionForm.resetFields();
        fetchTags();
        fetchQuestions();
      } catch (error) {
        message.error('操作失败，请重试');
      }
    });
  };

  const openEditQuestionModal = (record) => {
    setEditingQuestionId(record.id);

    // 🌟 核心：构造 Ant Design Upload 组件认识的 fileList 格式
    const initialFileList = (record.rawImages || []).map((img, index) => ({
      uid: img.image_id || `-${index}`, // 必须有唯一的 uid
      name: `image-${index}.png`, // 文件名
      status: 'done', // 状态必须是 done 才会显示缩略图
      url: img.image_url, // 图片的真实地址
    }));

    questionForm.setFieldsValue({
      content: record.content,
      tags: record.tags,
      answer: record.answer,
      images: initialFileList, // 将转换好的图片数组回填到表单中
    });
    setIsQuestionModalVisible(true);
  };

  const openAddQuestionModal = () => {
    setEditingQuestionId(null);
    questionForm.resetFields();
    setIsQuestionModalVisible(true);
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const res = await api.teacher.delete_question({ question_id: id });
      if (res.code === 200) {
        message.success('题目已删除');
        fetchQuestions();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAddGlobalTag = () => {
    newTagForm.validateFields().then(async (values) => {
      if (!globalTags.includes(values.tagName)) {
        try {
          const res = await api.teacher.create_tag({ tag_name: values.tagName });
          if (res.code === 200) {
            message.success('标签添加成功');
            newTagForm.resetFields();
            fetchTags(); // 刷新获取包含新ID的列表
          }
        } catch (error) {
          message.error('添加标签失败');
        }
      } else {
        message.warning('标签已存在');
      }
    });
  };

  const handleDeleteGlobalTag = async (tagToDelete) => {
    const tagObj = rawTags.find((t) => t.tag_name === tagToDelete);
    if (tagObj) {
      try {
        const res = await api.teacher.delete_tag({ tag_id: tagObj.tag_id });
        if (res.code === 200) {
          message.success('标签已删除');
          if (activeTagFilter === tagToDelete) setActiveTagFilter('全部');
          fetchTags();
        }
      } catch (error) {
        message.error('删除标签失败');
      }
    }
  };

  // 打开题目文字详情预览
  const openTextPreview = (record) => {
    setPreviewData({
      title: `题目 ${record.id} 预览`,
      content: record.content,
    });
    setIsPreviewModalVisible(true);
  };

  // --- 表格列配置 ---
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 40,
      render: (_, __, index) => index + 1,
    },
    {
      title: '题目预览',
      dataIndex: 'content',
      align: 'center',
      width: 200,
      key: 'content',
      render: (text, record) => (
        <Space style={{ display: 'flex', alignItems: 'center' }}>
          {/* 如果有图片，渲染一个带预览功能的缩略图 */}
          {record.imageUrl && (
            <Image
              width={28}
              height={28}
              src={record.imageUrl}
              style={{ borderRadius: 4, objectFit: 'cover' }}
              preview={{ mask: <EyeOutlined /> }}
            />
          )}
          {/* 文字部分点击弹出详细内容 */}
          <a
            onClick={() => openTextPreview(record)}
            style={{ color: '#595959' }}
          >
            <Text
              style={{ maxWidth: 200, fontFamily: 'monospace', cursor: 'pointer' }}
              ellipsis={{ tooltip: '点击查看全文' }}
            >
              {text}
            </Text>
          </a>
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      align: 'center',
      width: 150,
      render: (tags) => (
        <Space
          size={[0, 8]}
          wrap
        >
          {tags.map((t) => (
            <Tag
              key={t}
              color="blue"
            >
              {t}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '导入时间',
      align: 'center',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text) => dayjs(text).format('YY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditQuestionModal(record)}
            style={{ color: '#1890ff', padding: 0 }}
          >
            编辑
          </Button>
          {/* <Popconfirm
            title="确定要删除这道题吗？"
            onConfirm={() => handleDeleteQuestion(record.id)}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              style={{ padding: 0 }}
            >
              删除
            </Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  return (
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
              习题管理
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddQuestionModal}
          >
            添加题目
          </Button>
        </div>

        {/* --- 筛选与搜索区 --- */}
        <Row
          style={{ marginBottom: 16, marginTop: 16 }}
          justify="space-between"
          align="middle"
        >
          <Col
            flex="auto"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag.CheckableTag
                checked={activeTagFilter === '全部'}
                onChange={() => setActiveTagFilter('全部')}
                style={{
                  border: '1px solid #d9d9d9',
                  background: activeTagFilter === '全部' ? '#1890ff' : '#fff',
                }}
              >
                全部 ({questions.length})
              </Tag.CheckableTag>
              {globalTags.map((tag) => (
                <Tag.CheckableTag
                  key={tag}
                  checked={activeTagFilter === tag}
                  onChange={() => setActiveTagFilter(tag)}
                  style={{
                    border: '1px solid #d9d9d9',
                    background: activeTagFilter === tag ? '#1890ff' : '#fff',
                  }}
                >
                  {tag}
                </Tag.CheckableTag>
              ))}
            </div>

            <Button
              type="dashed"
              size="small"
              icon={<TagsOutlined />}
              onClick={() => setIsTagManageModalVisible(true)}
            >
              管理标签
            </Button>
          </Col>

          <Col style={{}}></Col>
        </Row>
        <Input
          placeholder="搜索题目内容或标签..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ width: 250, borderRadius: 20, margin: '16px 0' }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {/* --- 题目列表区 --- */}
        <Card
          variant="borderless"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 8, overflow: 'hidden' }}
        >
          <Table
            columns={columns}
            dataSource={filteredQuestions}
            rowKey="id"
            pagination={false}
            loading={loading}
          />
        </Card>
      </Content>

      {/* ================= Modals ================= */}

      {/* 0. 题目文字全文预览弹窗 */}
      <Modal
        title={previewData.title}
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsPreviewModalVisible(false)}
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
          {previewData.content}
        </div>
      </Modal>

      {/* 1. 添加/编辑题目弹窗 */}
      <Modal
        title={editingQuestionId ? '编辑题目' : '添加题目'}
        open={isQuestionModalVisible}
        onCancel={() => setIsQuestionModalVisible(false)}
        onOk={handleQuestionSubmit}
        okText={editingQuestionId ? '保存修改' : '保存题目'}
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form
          form={questionForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="题目内容（支持 MARKDOWN）"
            name="content"
            rules={[{ required: true, message: '题目内容不能为空，若是纯图片题请在此处说明' }]}
          >
            <TextArea
              rows={5}
              placeholder="在此输入题目，支持 Markdown 格式..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            label="上传图片（可多张，可选）"
            name="images"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Dragger
              multiple
              name="files"
              beforeUpload={() => false} // 阻止默认上传行为，转交表单统一上传
              listType="picture"
            >
              <p className="ant-upload-drag-icon">
                <CameraOutlined style={{ color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
            </Dragger>
          </Form.Item>

          <Form.Item
            label="标签（必选，输入后回车可创建新标签）"
            name="tags"
            rules={[{ required: true, message: '请至少选择或添加一个标签' }]}
          >
            <Select
              mode="tags"
              placeholder="选择或输入标签..."
              style={{ width: '100%' }}
            >
              {globalTags.map((tag) => (
                <Select.Option
                  key={tag}
                  value={tag}
                >
                  {tag}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="参考答案（供大模型批改参考，可选）"
            name="answer"
          >
            <TextArea
              rows={4}
              placeholder="输入参考答案或评分标准..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 2. 标签管理弹窗 */}
      <Modal
        title="标签管理"
        open={isTagManageModalVisible}
        onCancel={() => setIsTagManageModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={newTagForm}
          layout="inline"
          style={{ marginBottom: 20, marginTop: 10 }}
        >
          <Form.Item
            name="tagName"
            rules={[{ required: true, message: '请输入标签名' }]}
          >
            <Input placeholder="输入新标签名" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleAddGlobalTag}
            >
              添加
            </Button>
          </Form.Item>
        </Form>

        <List
          size="small"
          bordered
          dataSource={globalTags}
          renderItem={(tag) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="确定删除该标签？对应的题目将失去此标签。"
                  onConfirm={() => handleDeleteGlobalTag(tag)}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>,
              ]}
            >
              <Tag color="blue">{tag}</Tag>
            </List.Item>
          )}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        />
      </Modal>
    </Layout>
  );
}

export default Exercise;
