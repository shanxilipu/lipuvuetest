import React from 'react';
import { formatMessage } from 'umi/locale';
import { Input, message } from 'antd';
import Modal from '@/components/Modal';
import { defaultHandleResponse } from '@/utils/utils';
import { addGroup, updateGroup } from '@/pages/storageSecurityMgr/services/encryptStorageGroupMgr';

class GroupModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      confirmLoading: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { visible, item = {} } = this.props;
    if (visible && !prevProps.visible) {
      const { title = '' } = item;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ value: title }, () => {
        if (this.ref) {
          this.ref.focus();
        }
      });
    }
  }

  onOk = () => {
    const { onOk, item, onCancel } = this.props;
    const { value } = this.state;
    if (!value) {
      return false;
    }
    const { groupId } = item;
    const service = groupId ? updateGroup : addGroup;
    this.setState({ confirmLoading: true });
    service({ groupId, groupName: value }).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, resultObject => {
        message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
        onOk(resultObject || item);
        onCancel();
      });
    });
  };

  render() {
    const { item, visible, onCancel } = this.props;
    const { value, confirmLoading } = this.state;
    const title = !item.key
      ? formatMessage({ id: 'storage.encrypt.group.new', defaultMessage: '新建分组' })
      : formatMessage({ id: 'storage.encrypt.group.modify', defaultMessage: '编辑分组' });
    return (
      <Modal
        width={300}
        title={title}
        onOk={this.onOk}
        centered={false}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okButtonProps={{ disabled: !value }}
        afterClose={() => this.setState({ value: '' })}
      >
        <Input
          value={value}
          onChange={event => this.setState({ value: event.target.value })}
          ref={ref => {
            this.ref = ref;
          }}
          onPressEnter={this.onOk}
        />
      </Modal>
    );
  }
}
export default GroupModal;
