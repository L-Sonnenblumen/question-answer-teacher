import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Form, Input, Select, Button } from 'antd';

import Auth from '@/components/Auth';
import { useNavigate } from 'react-router-dom';
import { Plus } from '@icon-park/react';

const { Option } = Select;

const SearchBar = ({ formItemList, getSearchParams, onReset, addRow }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // 处理搜索
  const onFinish = (values) => {
    // console.log('搜索参数:', values);
    if (getSearchParams) {
      getSearchParams(values);
    }
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };

  // 渲染表单项
  const renderFormItem = (item) => {
    const { formItemProps, valueCompProps } = item;

    if (valueCompProps.type === 'select') {
      // 处理状态选择框
      if (formItemProps.name === 'user_status') {
        return (
          <Select
            className="item-select"
            placeholder={`请选择${formItemProps.label}`}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value={1}>启用</Option>
            <Option value={0}>禁用</Option>
          </Select>
        );
      }

      // 处理其他有选项的选择框
      if (valueCompProps.selectvalues && valueCompProps.selectvalues.length > 0) {
        return (
          <Select placeholder={`请选择${formItemProps.label}`} allowClear style={{ width: '100%' }}>
            {valueCompProps.selectvalues.map((dict) => (
              <Option key={dict.value} value={dict.value}>
                {dict.label}
              </Option>
            ))}
          </Select>
        );
      }

      // 默认空选择框
      return <Select placeholder={`请选择${formItemProps.label}`} allowClear />;
    }

    // 默认返回输入框
    return <Input placeholder={`请输入${formItemProps.label}`} allowClear {...valueCompProps} />;
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: '6px',
      }}
    >
      <Form form={form} onFinish={onFinish}>
        <div className="search-bar">
          <div className="input-items">
            {/* 动态渲染表单项 */}
            {formItemList.map((item, index) => (
              <Form.Item
                key={index}
                name={item.formItemProps.name}
                label={item.formItemProps.label}
                style={{
                  marginBottom: '8px',
                  marginTop: '8px',
                }}
                className="input-item"
                {...item.formItemProps}
              >
                {renderFormItem(item)}
              </Form.Item>
            ))}
          </div>

          <div className="btn-items">
            {/* 操作按钮 */}
            <Form.Item
              style={{
                marginBottom: '8px',
                marginTop: '8px',
              }}
            >
              <div className="btn-box">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  style={{ marginRight: '20px' }}
                >
                  搜索
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  重置
                </Button>
                <Auth permission="user:admin:add">
                  <Button type="primary" className="add-btn" onClick={addRow}>
                    {/* <Auth permission="system:user:add" onClick={addRow}> */}
                    <Plus
                      theme="outline"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignContent: 'center',
                      }}
                      fill="#ffffffff"
                    />{' '}
                    新增
                  </Button>
                </Auth>
              </div>
            </Form.Item>
          </div>
        </div>
        {/* <Button onClick={()=>(navigate(''))}>link</Button> */}
      </Form>
    </div>
  );
};

export default SearchBar;
