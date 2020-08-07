import React from 'react';
import Modal from '@/components/Modal';
import { formatMessage } from 'umi/locale';
import isEmpty from 'lodash/isEmpty';
import { message } from 'antd';
import { defaultHandleResponse } from '@/utils/utils';
import EncryptionKeyForm from '../../components/EncryptionKeyForm';
import GroupTableSelector from '../../components/GroupTableSelector';
import { createKey } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import styles from './index.less';

const _initialState = {
  selectedTable: {},
  selectedDatasource: {},
  confirmLoading: false,
};

class NewKeyModal extends React.Component {
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

  checkSubmitDisabled = () => {
    const { selectedTable, selectedDatasource } = this.state;
    return isEmpty(selectedTable) || isEmpty(selectedDatasource);
  };

  handleSubmit = () => {
    const formData = this.formRef.getValues();
    if (!formData) {
      return false;
    }
    const { selectedTable, selectedDatasource } = this.state;
    if (this.checkSubmitDisabled()) {
      return false;
    }
    const { onOk, onCancel } = this.props;
    const { dataSourcesCode: genDataSources } = selectedDatasource;
    const { tableCode: genTabCode } = selectedTable;
    const payload = { ...formData, genTabCode, genDataSources };
    this.setState({ confirmLoading: true });
    createKey(payload).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
        onOk();
        onCancel();
      });
    });
  };

  render() {
    const { confirmLoading, selectedDatasource } = this.state;
    const { visible, onCancel } = this.props;
    const { dataSourcesType } = selectedDatasource;
    return (
      <Modal
        width={750}
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
        okButtonProps={{ disabled: this.checkSubmitDisabled() }}
        height={Math.max(window.innerHeight * 0.8, 500)}
        title={formatMessage({ id: 'encrypt.key.new', defaultMessage: '新增密钥' })}
      >
        <div className={styles.newKeyModal}>
          <div className={styles.newKeyModalLeft}>
            <GroupTableSelector
              onSelectTable={o => this.setState({ selectedTable: o })}
              onSelectDatasource={o => this.setState({ selectedDatasource: o })}
            />
          </div>
          <div className={styles.newKeyModalRight}>
            <EncryptionKeyForm
              Ref={ref => {
                this.formRef = ref;
              }}
              datasourceType={dataSourcesType}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
export default NewKeyModal;
