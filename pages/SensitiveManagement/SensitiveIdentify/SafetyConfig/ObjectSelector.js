import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Modal, Form } from 'antd';
import DataSourceTree from '@/pages/AuditManagement/components/dataSourceTree';

@Form.create()
class ObjectSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      treeCheckedKeys: [],
      treeDatasourceKeyTitle: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        treeCheckedKeys: [],
      });
    }
  }

  componentDidMount() {}

  isFieldsValid = () => {
    const { form } = this.props;
    let isValid = true;
    form.validateFields(error => {
      isValid = !error;
    });
    return isValid;
  };

  getValue = () => {
    const { form } = this.props;
    if (this.isFieldsValid()) {
      return form.getFieldsValue();
    }
    return false;
  };

  handleTreeCheck = (checkedKeys, e) => {
    const { checkedNodes } = e;
    const treeDatasourceKeyTitle = [];
    if (checkedNodes && checkedNodes.length > 0) {
      checkedNodes.forEach(item => {
        const {
          props: { dataRef = {} },
        } = item;
        if (dataRef.treeIndex === '1') {
          const keyValue = {
            key: `${dataRef.datasourceType}_${dataRef.datasourceId}`,
            title: `${dataRef.title}`,
          };
          treeDatasourceKeyTitle.push(keyValue);
        }
      });
    }
    this.setState({ treeCheckedKeys: checkedKeys, treeDatasourceKeyTitle });
  };

  done = () => {
    const { doneHandler } = this.props;
    const { treeDatasourceKeyTitle } = this.state;
    if (doneHandler) {
      doneHandler(treeDatasourceKeyTitle);
    }
  };

  cancel = () => {};

  render() {
    const { treeCheckedKeys } = this.state;
    const { visible, cancelHandler } = this.props;
    return (
      <Modal
        title={formatMessage({ id: 'SafetyConfig.SelectObject', defaultMessage: '选择对象' })}
        visible={visible}
        destroyOnClose={true}
        onCancel={cancelHandler || this.cancel}
        onOk={this.done}
      >
        <div style={{ height: '400px', overflow: 'auto' }}>
          <DataSourceTree
            checkable={true}
            checkedKeys={treeCheckedKeys}
            onCheck={this.handleTreeCheck}
            getTable={false}
            getView={false}
            getFunction={false}
            showSearch={true}
            showLoading={true}
          />
        </div>
      </Modal>
    );
  }
}
export default ObjectSelector;
