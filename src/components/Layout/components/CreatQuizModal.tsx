import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Checkbox,
  Row,
  Col,
  List,
  Tag,
  DatePicker,
  Button,
  message,
  Spin,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// 请确保引入 api 的路径正确
import api from '../../../api';

interface CreateQuizModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 增加成功回调
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  // 真实数据状态
  const [classList, setClassList] = useState<any[]>([]);
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  // 打开弹窗时获取班级和题目数据
  useEffect(() => {
    if (visible) {
      fetchFormData();
    } else {
      // 关闭时重置状态
      form.resetFields();
      setSelectedQuestions([]);
      setSearchText('');
    }
  }, [visible]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      // 并行请求班级列表和题目库
      const [classRes, questionRes] = await Promise.all([
        api.teacher.class_list(''),
        api.teacher.search_question({
          keyword: '',
          tag_ids: [],
          status: '',
          page: 1,
          page_size: 1000,
        }),
      ]);

      if (classRes && classRes.code === 200) {
        setClassList(classRes.data || []);
      }
      if (questionRes && questionRes.code === 200) {
        // 映射为 UI 所需的结构
        const mappedQuestions = (questionRes.data.items || []).map((q: any) => ({
          id: q.question_id,
          content: q.content_md,
          tags: (q.tags || []).map((t: any) => t.tag_name),
        }));
        setQuestionList(mappedQuestions);
      }
    } catch (error) {
      message.error('获取初始化数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values: any) => {
    console.log('🚀 ~ handleFinish ~ values:', values);
    if (selectedQuestions.length === 0) {
      return message.warning('请至少选择一道题目');
    }

    // --- 核心修改：安全转换 classes 为数组 ---
    let finalClassIds: number[] = [];
    if (Array.isArray(values.classes)) {
      finalClassIds = values.classes;
    } else if (typeof values.classes === 'string') {
      // 兼容 "1,2" 或者 "6" 这样的字符串情况
      finalClassIds = values.classes.includes(',')
        ? values.classes.split(',').map(Number)
        : [Number(values.classes)];
    } else if (values.classes !== undefined && values.classes !== null) {
      // 兜底：如果是单个数字等情况
      finalClassIds = [Number(values.classes)];
    }

    try {
      const submitData = {
        quiz_name: values.title,
        class_ids: finalClassIds, // 现在这里一定是一个数组，例如：[6]
        question_ids: selectedQuestions,
        deadline_at: values.deadline ? values.deadline.toISOString() : null,
      };

      const res = await api.teacher.create_quiz(submitData);

      if (res && res.code === 200) {
        message.success('测验发布成功！');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      message.error('测验发布失败，请重试');
    }
  };

  // 本地过滤题目
  const filteredQuestions = questionList.filter((q) => {
    const searchLower = searchText.toLowerCase();
    return (
      q.content?.toLowerCase().includes(searchLower) ||
      q.tags.some((t: string) => t.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Modal
      title={<span style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>发起新测验</span>}
      open={visible}
      onCancel={onClose}
      width={520}
      bodyStyle={{
        maxHeight: '60vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 24px',
      }}
      footer={[
        <Button
          key="back"
          onClick={onClose}
          style={{ borderRadius: 8, padding: '0 20px' }}
        >
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          style={{
            borderRadius: 8,
            padding: '0 20px',
            backgroundColor: 'rgb(50, 98, 169)',
            borderColor: 'rgb(50, 98, 169)',
          }}
        >
          发布测验
        </Button>,
      ]}
      centered
    >
      <Spin
        spinning={loading}
        tip="数据加载中..."
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ deadline: dayjs().add(1, 'day').hour(18).minute(0) }} // 默认明天晚上6点
        >
          {/* 1. 测验名称 */}
          <Form.Item
            label={<span style={{ color: '#8c8c8c', fontSize: 13 }}>测验名称</span>}
            name="title"
            rules={[{ required: true, message: '请输入测验名称' }]}
            style={{ marginBottom: 16 }}
          >
            <Input
              placeholder="如：第四章综合测验"
              style={{ borderRadius: 8, padding: '6px 10px' }}
            />
          </Form.Item>

          {/* 2. 选择班级 */}
          {/* ⚠️ 核心修复1：外层的 Form.Item 只负责展示 label，绝对不能有 name 属性，否则会相互冲突变成单选 */}
          <Form.Item
            label={<span style={{ color: '#8c8c8c', fontSize: 13 }}>选择班级（可多选）</span>}
            style={{ marginBottom: 16 }}
            required // 仅用于展示必选的红星
          >
            <div
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: 8,
                padding: '12px',
                maxHeight: 140,
                overflowY: 'auto',
              }}
            >
              {/* ⚠️ 核心修复2：内层 Form.Item 负责绑定数据，紧贴 Checkbox.Group，并加入 initialValue={[]} */}
              <Form.Item
                name="classes"
                rules={[{ required: true, message: '请选择至少一个班级' }]}
                style={{ marginBottom: 0 }}
                initialValue={[]} // 强制声明它是一个数组，保证多选行为正常
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row gutter={[0, 12]}>
                    {classList.map((cls) => (
                      <Col
                        span={24}
                        key={cls.class_id}
                      >
                        <Checkbox value={cls.class_id}>
                          <span style={{ fontSize: 14, color: '#333' }}>
                            {cls.class_name} ({cls.student_count}人)
                          </span>
                        </Checkbox>
                      </Col>
                    ))}
                    {classList.length === 0 && (
                      <span style={{ color: '#ccc', fontSize: 13 }}>暂无可选班级</span>
                    )}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </div>
          </Form.Item>

          {/* 3. 选择题目 */}
          <Form.Item
            label={<span style={{ color: '#8c8c8c', fontSize: 13 }}>选择题目</span>}
            style={{ marginBottom: 16 }}
          >
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="按标签或内容筛选题目..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: '#f9f9f9',
                border: '1px solid #e8e8e8',
              }}
            />
            <div
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: 8,
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              <List
                dataSource={filteredQuestions}
                size="small"
                renderItem={(item) => (
                  <List.Item style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    <Checkbox
                      checked={selectedQuestions.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedQuestions([...selectedQuestions, item.id]);
                        else setSelectedQuestions(selectedQuestions.filter((id) => id !== item.id));
                      }}
                      style={{ alignItems: 'flex-start' }}
                    >
                      <div style={{ marginLeft: 6 }}>
                        <div
                          style={{ color: '#333', fontSize: 13, marginBottom: 4, lineHeight: 1.4 }}
                        >
                          <span style={{ fontWeight: 600 }}>{item.id}</span> · {item.content}
                        </div>
                        <div>
                          {item.tags?.map((tag: string) => (
                            <Tag
                              key={tag}
                              style={{
                                borderRadius: 4,
                                border: 'none',
                                background: '#f5f5f5',
                                color: '#8c8c8c',
                                fontSize: 12,
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Checkbox>
                  </List.Item>
                )}
              />
            </div>
            <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>
              已选 {selectedQuestions.length} 题
            </div>
          </Form.Item>

          {/* 4. 截止时间 */}
          <Form.Item
            label={<span style={{ color: '#8c8c8c', fontSize: 13 }}>截止时间</span>}
            name="deadline"
            rules={[{ required: true, message: '请选择截止时间' }]}
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              showTime
              format="YYYY/MM/DD HH:mm"
              style={{ width: '100%', borderRadius: 8, padding: '6px 10px' }}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateQuizModal;
