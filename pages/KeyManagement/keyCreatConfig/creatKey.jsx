import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Modal, Form, message } from 'antd';
import _ from 'lodash';
import FormItem from '../components/FormItem';
import SysCatlog from '../components/SysCatlog';
import styles from './index.less';

@connect(({ keyCreatConfig, loading }) => ({
  encryptAlgorithm: keyCreatConfig.encryptAlgorithm,
  loading:
    !!loading.effects['keyCreatConfig/createKey'] ||
    !!loading.effects['keyCreatConfig/incrementVersion'],
}))
@Form.create()
class CreatKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resultObject: [],
      selectedKeys: [],
      appSys: {},
    };
  }

  componentDidMount() {
    const { showModel, actItem } = this.props;
    const { id } = actItem;
    if (showModel && (id || `${id}` === '0')) {
      this.initSysApp(actItem);
    }
    this.listSystemTree();
  }

  componentWillReceiveProps(nextProps) {
    const { showModel, actItem } = nextProps;
    const { actItem: preactItem = {}, showModel: oldVisible, form } = this.props;
    const { id } = actItem;
    const { id: preId } = preactItem;
    if (!oldVisible && showModel) {
      form.resetFields();
    }
    if (showModel && (id || `${id}` === '0') && id !== preId) {
      this.initSysApp(actItem);
    }
  }

  initSysApp = actItem => {
    const { resultObject } = this.state;
    const { genAppSystem = '', genAppSystemName = '', id } = actItem;
    const selArr = [];
    resultObject.forEach(item => {
      const { safeAppSystem = [] } = item;
      safeAppSystem.forEach(child => {
        if (child.appsysCode === genAppSystem) {
          selArr.push(child);
        }
      });
    });
    const selectedKeys = selArr.length > 0 ? [`${selArr[0].id}`] : [];
    if (id || `${id}` === '0') {
      this.setState({
        appSys: { genAppSystem, genAppSystemName },
        selectedKeys,
      });
    }
  };

  listSystemTree = (payload = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyCreatConfig/listAllSafeAppsysTree',
      payload,
    }).then((res = {}) => {
      const { resultCode } = res;
      if (resultCode === '0') {
        const { resultObject = [] } = res;
        this.setState({
          resultObject,
        });
      }
    });
  };

  hideModal = refresh => {
    const { showModelFlag } = this.props;
    if (showModelFlag) {
      showModelFlag('showCreatKey', false, refresh);
    }
  };

  handleOk = () => {
    const { appSys } = this.state;
    const { form, dispatch, actItem } = this.props;
    const { id } = actItem;
    if (id || `${id}` === '0') {
      dispatch({
        type: 'keyCreatConfig/incrementVersion',
        payload: { id },
      }).then((res = {}) => {
        const { resultCode } = res;
        if (resultCode === '0') {
          message.success(`${formatMessage({ id: 'keyManagement.NewVersionSuccTip' })}`);
          this.hideModal(true);
        }
      });
    } else {
      form.validateFields((err, values) => {
        if (err) return;
        if (_.isEmpty(appSys)) {
          message.error(`${formatMessage({ id: 'keyManagement.SelSysTip' })}`);
          return;
        }
        const { appsysName, appsysCode } = appSys;
        const params = { ...values };
        params.genAppSystem = appsysCode;
        params.genAppSystemName = appsysName;
        dispatch({
          type: 'keyCreatConfig/createKey',
          payload: params,
        }).then((res = {}) => {
          const { resultCode } = res;
          if (resultCode === '0') {
            message.success(`${formatMessage({ id: 'keyManagement.CreateKeySucc' })}`);
            this.hideModal(true);
          }
        });
      });
    }
  };

  KeyAlgorithmChange = () => {
    const { form } = this.props;
    form.setFieldsValue({ bitLen: '' });
  };

  onSelect = (a, ele) => {
    const { actItem } = this.props;
    const { id } = actItem;
    if (id || `${id}` === '0') {
      return;
    }
    const {
      node: { props },
    } = ele;
    const { item } = props;
    if (!item.isCatlog) {
      this.setState({
        selectedKeys: [`${item.id}`],
        appSys: item,
      });
    }
  };

  render() {
    const { resultObject, selectedKeys } = this.state;
    const { showModel, form, encryptAlgorithm, actItem = {}, loading } = this.props;
    const getEncryptAlgorithm = form.getFieldValue('encryptAlgorithm');
    const arr = encryptAlgorithm.filter(item => {
      return item.id === getEncryptAlgorithm;
    });
    let bitLenArr = [];
    if (arr && arr.length > 0) {
      bitLenArr = arr[0].bitLen.map(item => {
        return {
          id: item,
          name: `${item}bit`,
        };
      });
    }

    const {
      keyCode = '',
      keyName = '',
      keyDescribe = '',
      encryptAlgorithm: editEncryptAlgorithm = '',
      bitLen = '',
      id,
    } = actItem;
    let disabled = false;
    if (id || `${id}` === '0') {
      disabled = true;
    }

    const searchArr = [
      {
        type: 'input',
        name: 'keyCode',
        label: `${formatMessage({ id: 'keyManagement.KeyID' })}`,
        colSpan: 24,
        defaultValue: keyCode,
        rules: [{ required: true, message: `${formatMessage({ id: 'COMMON_REQUIRED' })}` }],
      },
      {
        type: 'input',
        name: 'keyName',
        label: `${formatMessage({ id: 'keyManagement.KeyName' })}`,
        colSpan: 24,
        defaultValue: keyName,
        rules: [{ required: true, message: `${formatMessage({ id: 'COMMON_REQUIRED' })}` }],
      },
      {
        type: 'textArea',
        name: 'keyDescribe',
        label: `${formatMessage({ id: 'keyManagement.KeyDescription' })}`,
        colSpan: 24,
        defaultValue: keyDescribe,
      },
      {
        type: 'select',
        name: 'encryptAlgorithm',
        label: `${formatMessage({ id: 'keyManagement.KeyAlgorithm' })}`,
        colSpan: 24,
        selArr: encryptAlgorithm,
        onchange: this.KeyAlgorithmChange,
        defaultValue: editEncryptAlgorithm,
        rules: [{ required: true, message: `${formatMessage({ id: 'COMMON_REQUIRED' })}` }],
      },
      {
        type: 'select',
        name: 'bitLen',
        label: `${formatMessage({ id: 'keyManagement.KeyLength' })}`,
        colSpan: 24,
        selArr: bitLenArr,
        defaultValue: bitLen,
        rules: [{ required: true, message: `${formatMessage({ id: 'COMMON_REQUIRED' })}` }],
      },
    ];

    return (
      <Modal
        title={
          id || `${id}` === '0'
            ? `${formatMessage({ id: 'keyManagement.NewVersionBuild' })}`
            : `${formatMessage({ id: 'keyManagement.NewKeyGeneration' })}`
        }
        visible={showModel}
        onCancel={() => {
          this.hideModal();
        }}
        onOk={this.handleOk}
        width="940px"
        className={styles.CreatKeyCon}
        confirmLoading={loading}
      >
        <div>
          <p className={styles.titleCon}>
            <span className={styles.titleIcon}>*</span>
            <span>
              {id || `${id}` === '0'
                ? `${formatMessage({ id: 'keyManagement.NewVersionBuildTip' })}`
                : `${formatMessage({ id: 'keyManagement.NewKeyGenerationTip' })}`}
            </span>
          </p>
          <div className={styles.CreatKeyMain}>
            <div className={styles.catlogCon}>
              <SysCatlog
                data={resultObject}
                title={formatMessage({ id: 'keyManagement.ApplicationSysCatalog' })}
                onSelect={this.onSelect}
                selectedKeys={selectedKeys}
                searchFun={value => {
                  this.listSystemTree({ keyword: value });
                }}
              />
            </div>
            <div className={styles.keySetttr}>
              <Form>
                <FormItem searchArr={searchArr} form={form} disabled={disabled} />
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default CreatKey;
