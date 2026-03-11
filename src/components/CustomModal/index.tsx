import { forwardRef, type ReactNode, useImperativeHandle, useState } from 'react';

import { Modal } from 'antd';

// 定义 props 类型
interface CustomModalProps {
  title: string;
  children: ReactNode;
}

// 定义 ref 暴露的方法类型
export interface CustomModalRef {
  toggleShowStatus: (status: boolean) => void;
}

// forwardRef : 传递弹窗组件的ref
const CustomModal = forwardRef<CustomModalRef, CustomModalProps>(({ title, children }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 取消事件
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // useImperativeHandle：自定义父组件ref.current接收到的方法
  useImperativeHandle(
    ref,
    () => ({
      toggleShowStatus: (status) => {
        /** 改变状态 */
        setIsModalOpen(status);
      },
    }),
    []
  );

  return (
    <Modal title={title} open={isModalOpen} footer={null} onCancel={handleCancel}>
      {children}
    </Modal>
  );
});
export default CustomModal;
