import React, { Component } from 'react';
import { Form, Row, Button, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import CommonTableInfo from './CommonTableInfo';
import HiveTableInfo from './HiveTableInfo';
import DbTableInfo from './DbTableInfo';
import { isMysqlOrOracleTable } from '../tools/utils';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const colLayout = {
  xs: 24,
  sm: 12,
  xl: 8,
};
const COMMONRule = {
  required: true,
  message: formatMessage({ id: 'COMMON_REQUIRED' }),
};

@Form.create()
class TableInfo extends Component {
  businessId = null;

  state = {
    loading: false,
  };

  componentWillReceiveProps(nextProps) {
    const { form, currentTableMark } = this.props;
    const { currentTableMark: nextCurrentTableMark } = nextProps;
    if (currentTableMark !== nextCurrentTableMark) {
      form.resetFields();
    }
  }

  getInitValue = name => {
    const { tableInfo } = this.props;
    if (!tableInfo) {
      return null;
    }
    return tableInfo[name];
  };

  handleSaveForm = () => {
    const { form } = this.props;
    const { businessId } = this;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { handleSaveForm } = this.props;
        const { createDate } = values;
        handleSaveForm({ ...values, createDate: createDate || null, businessId });
      }
    });
  };

  render() {
    const {
      currentTableMark,
      editable,
      schemaType,
      tableId,
      tableInfo,
      schemaId,
      // handleSelectEntity,
      handleHivePartitionAndFieldsEnable,
      handleCancelEditTable,
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const { loading } = this.state;
    const isDb = isMysqlOrOracleTable(schemaType);
    const commonChildProps = {
      tableId,
      editable,
      colLayout,
      COMMONRule,
      currentTableMark,
      getFieldDecorator,
      getInitValue: this.getInitValue,
    };
    return (
      <Spin spinning={loading}>
        <Form {...formItemLayout}>
          <Row>
            <CommonTableInfo
              {...commonChildProps}
              // handleSelectEntity={handleSelectEntity}
              tableInfo={tableInfo}
              setBusinessId={businessId => {
                this.businessId = businessId;
              }}
            />
            {isDb && <DbTableInfo {...commonChildProps} />}
            {!isDb && (
              <HiveTableInfo
                {...commonChildProps}
                setFieldsValue={setFieldsValue}
                handleHivePartitionAndFieldsEnable={handleHivePartitionAndFieldsEnable}
                schemaId={schemaId}
                tableInfo={tableInfo}
                setLoading={isLoading => {
                  this.setState({ loading: isLoading });
                }}
              />
            )}
          </Row>
        </Form>
        {editable && (
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={this.handleSaveForm}>
              {formatMessage({ id: 'form.save' })}
            </Button>
            <Button onClick={handleCancelEditTable} style={{ marginLeft: 10 }}>
              {formatMessage({ id: 'COMMON_CANCEL' })}
            </Button>
          </div>
        )}
      </Spin>
    );
  }
}
export default TableInfo;
