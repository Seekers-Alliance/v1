import { Button, Cascader, Form, Input, Modal, Select, TreeSelect } from 'antd';
import { useSelectedNFTStore } from '@/stores/selectedNFT';
import React from 'react';

interface CreatePoolModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export default function CreatePoolModal({
  visible,
  onOk,
  onCancel,
}: CreatePoolModalProps) {
  const { selectedNFTList } = useSelectedNFTStore();
  return (
    <Modal
      open={visible}
      title='Create Atomic Pool'
      onOk={onOk}
      onCancel={onCancel}
      footer={[
        <Button
          key='back'
          type='primary'
          className='border-primary bg-black'
          onClick={onCancel}
        >
          Return
        </Button>,
        <Button
          key='submit'
          type='primary'
          className='border-primary bg-black'
          onClick={onOk}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout='horizontal'
        style={{ maxWidth: 600 }}
      >
        {selectedNFTList.map((nft) => (
          <Form.Item label={`NFT #${nft.toString()}`} key={nft.toString()}>
            <Input />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
