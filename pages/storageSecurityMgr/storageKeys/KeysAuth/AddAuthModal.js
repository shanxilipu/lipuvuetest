import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { formatMessage } from 'umi/locale';
import { Divider, message } from 'antd';
import Modal from '@/components/Modal';
import UserList from './UserList';
import AuthForm from './AuthForm';
import { defaultHandleResponse } from '@/utils/utils';
import GroupTableSelector from '../../components/GroupTableSelector';
import { addAuth } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import styles from './index.less';

const _initialState = {
  selectedUserCodes: [],
  selectedTable: {},
  selectedDatasource: {},
  confirmLoading: false,
};

class AddAuthModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ..._initialState };
  }

  componentDidUpdate(prevProps) {
    const { visible } = this.props;
    if (!visible && prevProps.visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ ..._initialState });
    }
  }

  handleSubmit = () => {
    if (!this.formRef) {
      return false;
    }
    const formValue = this.formRef.getValues();
    if (!formValue) {
      return false;
    }
    const { onOk, onCancel } = this.props;
    const { selectedUserCodes, selectedTable, selectedDatasource } = this.state;
    const { tableCode: genTabCode } = selectedTable;
    const { dataSourcesCode: dataSources } = selectedDatasource;
    const payload = selectedUserCodes.map(userCode => ({
      userCode,
      genTabCode,
      dataSources,
      ...formValue,
    }));
    this.setState({ confirmLoading: true });
    addAuth(payload).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
        );
        onCancel();
        onOk();
      });
    });
  };

  checkSubmittable = () => {
    const { selectedUserCodes, selectedTable, selectedDatasource } = this.state;
    return !!selectedUserCodes.length && !isEmpty(selectedTable) && !isEmpty(selectedDatasource);
  };

  render() {
    const { selectedUserCodes, confirmLoading } = this.state;
    const { visible, onCancel } = this.props;
    return (
      <Modal
        width={900}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        noCancelConfirmLoading
        confirmLoading={confirmLoading}
        bodyStyle={{ paddingBottom: 0 }}
        okButtonProps={{ disabled: !this.checkSubmittable() }}
        height={Math.max(window.innerHeight * 0.8, 500)}
        title={formatMessage({ id: 'storage.encrypt.addAuth', defaultMessage: '新增授权' })}
      >
        <div className={styles.addAuthModal}>
          <div className={styles.addAuthModalLeft}>
            <GroupTableSelector
              isGetAllTable
              onSelectTable={t => this.setState({ selectedTable: t })}
              onSelectDatasource={d => this.setState({ selectedDatasource: d })}
            />
          </div>
          <div className={styles.addAuthModalRight}>
            <UserList
              selectedRowKeys={selectedUserCodes}
              className={styles.userListBox}
              setSelectedRowKeys={keys => this.setState({ selectedUserCodes: keys })}
            />
            <Divider className={styles.divider} />
            <AuthForm
              inline
              Ref={ref => {
                this.formRef = ref;
              }}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
export default AddAuthModal;
