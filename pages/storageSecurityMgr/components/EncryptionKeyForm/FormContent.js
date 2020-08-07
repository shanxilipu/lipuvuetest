import React from 'react';
import { formatMessage } from 'umi/locale';
import FormItems from '@/components/FormItems';
import { COMMON_RULE, DEFAULT_FORM_LAYOUT } from '@/pages/common/const';
import { defaultHandleResponse } from '@/utils/utils';
import { getAlgorithm2Bit } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';

class FormContent extends React.Component {
  constructor(props) {
    super(props);
    this.algorithmData = [];
    this.state = {
      bitLens: [],
      algorithms: [],
      getAlgorithmsLoading: false,
    };
  }

  componentDidMount() {
    const { disableForm } = this.props;
    if (!disableForm) {
      this.setState({ getAlgorithmsLoading: true });
      getAlgorithm2Bit().then(response => {
        this.setState({ getAlgorithmsLoading: false });
        defaultHandleResponse(response, (algorithmData = []) => {
          this.algorithmData = algorithmData;
          this.setAlgorithmsOptions();
        });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { datasourceType } = this.props;
    if (datasourceType !== nextProps.datasourceType) {
      this.setAlgorithmsOptions(nextProps);
    }
  }

  setAlgorithmsOptions = (props = this.props) => {
    const {
      datasourceType,
      form: { setFieldsValue },
    } = props;
    if (!datasourceType || !this.algorithmData.length) {
      return [];
    }
    const algorithms = this.algorithmData
      .filter(o => o.databaseType === datasourceType)
      .map(o => ({
        value: o.algorithmType,
        label: o.algorithmType,
      }));
    this.setState({ algorithms });
    if (algorithms.length) {
      setFieldsValue({ encryptAlgorithm: algorithms[0].value });
      this.setBitLensOptions(algorithms[0].value, props);
    }
  };

  setBitLensOptions = (algorithmType, props = this.props) => {
    const {
      datasourceType,
      form: { setFieldsValue },
    } = props;
    if (!datasourceType || !algorithmType) {
      return [];
    }
    const algorithmObj =
      this.algorithmData.find(
        o => o.databaseType === datasourceType && o.algorithmType === algorithmType
      ) || {};
    const bitLens = (algorithmObj.bitLen || []).map(o => ({
      value: o,
      label: `${o}bit`,
    }));
    this.setState({ bitLens });
    if (bitLens.length) {
      setFieldsValue({ bitLen: bitLens[0].value });
    }
  };

  render() {
    const { bitLens, algorithms, getAlgorithmsLoading } = this.state;
    const {
      form,
      data = {},
      showKeyCode = true,
      disableForm,
      bitLenDisabled,
      algorithmDisabled,
    } = this.props;
    const formItems = [
      {
        key: 'keyCode',
        rules: [COMMON_RULE],
        label: formatMessage({ id: 'keyManagement.KeyID', defaultMessage: '密钥标识' }),
      },
      {
        key: 'keyName',
        rules: [COMMON_RULE],
        label: formatMessage({ id: 'keyManagement.KeyName', defaultMessage: '密钥名称' }),
      },
      {
        rows: 3,
        key: 'keyDescribe',
        inputType: 'textarea',
        label: formatMessage({
          id: 'keyManagement.KeyDescription',
          defaultMessage: '密钥说明',
        }),
      },
      {
        inputType: 'select',
        key: 'encryptAlgorithm',
        label: formatMessage({
          id: 'keyManagement.EncryptionAlgorithm',
          defaultMessage: '加密算法',
        }),
        rules: [COMMON_RULE],
        dataSource: algorithms,
        loading: getAlgorithmsLoading,
        onChange: val => this.setBitLensOptions(val),
        initialValue: data.encryptAlgorithm,
        disabled: getAlgorithmsLoading || algorithmDisabled,
      },
      {
        key: 'bitLen',
        inputType: 'select',
        dataSource: bitLens,
        rules: [COMMON_RULE],
        loading: getAlgorithmsLoading,
        initialValue: data.bitLen,
        disabled: getAlgorithmsLoading || bitLenDisabled,
        label: formatMessage({ id: 'encrypt.key.length', defaultMessage: '密钥长度' }),
      },
    ];
    if (!showKeyCode) {
      formItems.shift();
    }
    return (
      <FormItems
        form={form}
        data={data}
        disableForm={disableForm}
        formItemLayout={DEFAULT_FORM_LAYOUT}
        formItems={formItems}
      />
    );
  }
}
export default FormContent;
