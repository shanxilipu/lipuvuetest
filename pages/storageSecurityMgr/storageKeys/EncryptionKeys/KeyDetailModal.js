import React from 'react';
import { formatMessage } from 'umi/locale';
import Modal from '@/components/Modal';
import { Alert, Button, message, Spin, Col } from 'antd';
import IndicatorRow from './IndicatorRow';
import EncryptionKeyForm from '../../components/EncryptionKeyForm';
import ScriptContent from '../../components/CutoverScript/ScriptContent';
import {
  generateCutOverPlan,
  saveCutOverPlan,
  confirmCutOverFinish,
  isKeyModifySave,
} from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import { defaultHandleResponse } from '@/utils/utils';
import styles from './index.less';

const initialState = {
  script: '',
  loading: false,
  savePlanLoading: false,
  generatePlanLoading: false,
  saveCutOverPlanDisabled: true,
  confirmPlanFinishLoading: false,
  confirmPlanFinishDisabled: true,
};

class KeyDetailModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...initialState };
  }

  componentDidUpdate(prevProps) {
    const { visible, mode, data } = this.props;
    if (!visible && prevProps.visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ ...initialState });
    } else if (visible && !prevProps.visible) {
      if (mode === 'view') {
        this.isKeyModifySave();
      }
      this.generateCutOverPlan(data);
    }
  }

  getKeyPath = () => {
    const { data = {} } = this.props;
    const { genDataSources, genTabCode, keyName } = data;
    return (
      <div className={styles.keyPath}>
        <span>
          {formatMessage({ id: 'encrypt.key.location', defaultMessage: '所在位置' })}:{' '}
          {genDataSources}/{genTabCode}/
        </span>
        <span className={styles.keyName}>{keyName}</span>
      </div>
    );
  };

  /**
   * 判断密钥有没有保存过割接方案，如果没有，则在【查看】模式下，【修改密钥】按钮不显示
   */
  isKeyModifySave = () => {
    const {
      data: { enckeyId },
    } = this.props;
    this.setState({ loading: true });
    isKeyModifySave(enckeyId).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, resultObject => {
        this.setState({ confirmPlanFinishDisabled: !resultObject });
      });
    });
  };

  generateCutOverPlan = payload => {
    const {
      data: { enckeyId },
    } = this.props;
    if (!payload) {
      payload = this.formRef.getValues();
      if (!payload) {
        return false;
      }
    }
    const { keyName, keyDescribe } = payload;
    this.setState({ generatePlanLoading: true });
    generateCutOverPlan({ enckeyId, keyName, keyDescribe }).then(response => {
      this.setState({ generatePlanLoading: false });
      defaultHandleResponse(response, resultObject => {
        const { script = '' } = resultObject || {};
        this.setState({
          script,
          saveCutOverPlanDisabled: !script,
        });
      });
    });
  };

  saveCutOverPlan = () => {
    const {
      onCancel,
      data: { enckeyId },
    } = this.props;
    this.setState({ savePlanLoading: true });
    saveCutOverPlan({ enckeyId }).then(response => {
      this.setState({ savePlanLoading: false });
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
        onCancel();
      });
    });
  };

  confirmModifyKey = () => {
    const {
      onCancel,
      data: { enckeyId },
    } = this.props;
    this.setState({ confirmPlanFinishLoading: true });
    confirmCutOverFinish({ enckeyId }).then(response => {
      this.setState({ confirmPlanFinishLoading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
        );
        onCancel();
      });
    });
  };

  getFooter = () => {
    const { mode } = this.props;
    const {
      savePlanLoading,
      saveCutOverPlanDisabled,
      confirmPlanFinishLoading,
      confirmPlanFinishDisabled,
    } = this.state;
    if (mode === 'view' && confirmPlanFinishDisabled) {
      return (
        <Button onClick={this.handleCancel}>
          {formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
        </Button>
      );
    }
    if (mode === 'view') {
      return (
        <Button type="primary" loading={confirmPlanFinishLoading} onClick={this.confirmModifyKey}>
          {formatMessage({ id: 'encrypt.key.modify', defaultMessage: '修改密钥' })}
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        disabled={saveCutOverPlanDisabled}
        loading={savePlanLoading}
        onClick={this.saveCutOverPlan}
      >
        {formatMessage({ id: 'storage.encrypt.cutoverPlan.save', defaultMessage: '保存割接方案' })}
      </Button>
    );
  };

  getTitle = () => {
    const { mode } = this.props;
    if (!mode) return '';
    const title1 = formatMessage({ id: 'encrypt.key.modify', defaultMessage: '修改密钥' });
    const title2 = formatMessage({
      id: 'encrypt.key.checkModifiedKey',
      defaultMessage: '查看密钥修改',
    });
    return mode === 'view' ? title2 : title1;
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    const { savePlanLoading, generatePlanLoading, confirmPlanFinishLoading } = this.state;
    if (savePlanLoading || generatePlanLoading || confirmPlanFinishLoading) {
      return false;
    }
    onCancel();
  };

  render() {
    const { loading, script, generatePlanLoading } = this.state;
    const { data, mode, visible } = this.props;
    const _data = { ...data };
    _data.bitLen = `${_data.bitLen}bit`;
    return (
      <Modal
        width={900}
        visible={visible}
        onCancel={this.handleCancel}
        bodyStyle={{ padding: 0 }}
        footer={this.getFooter()}
        title={this.getTitle()}
      >
        <Spin wrapperClassName="full-height-spin" spinning={loading}>
          <Alert closable message={formatMessage({ id: 'encrypt.key.tips1' })} type="warning" />
          <div className={styles.keyDetailModalBox}>
            {this.getKeyPath()}
            <div className={styles.panel}>
              <div className={styles.panelItem}>
                <IndicatorRow
                  title={formatMessage({ id: 'encrypt.key.info', defaultMessage: '密钥信息' })}
                />
                <EncryptionKeyForm
                  data={data}
                  Ref={ref => {
                    this.formRef = ref;
                  }}
                  showKeyCode={false}
                  disableForm={mode === 'view'}
                  bitLenDisabled={mode === 'edit'}
                  algorithmDisabled={mode === 'edit'}
                />
                {mode === 'edit' && (
                  <Col span={22} className="ub ub-pe">
                    <Button
                      type="primary"
                      ghost
                      onClick={() => this.generateCutOverPlan()}
                      loading={generatePlanLoading}
                    >
                      {formatMessage({
                        id: 'storage.encrypt.cutoverPlan.generate',
                        defaultMessage: '生成割接方案',
                      })}
                    </Button>
                  </Col>
                )}
              </div>
              <div className={styles.panelItem}>
                <IndicatorRow
                  title={formatMessage({
                    id: 'storage.encrypt.cutoverScript',
                    defaultMessage: '割接脚本',
                  })}
                />
                <div className={styles.scriptContentBox}>
                  <ScriptContent script={script} loading={generatePlanLoading} />
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}
export default KeyDetailModal;
