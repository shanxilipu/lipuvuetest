import React from 'react';
import { Modal, Form, Row, Col, Input, Select, InputNumber, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import Debounce from 'lodash-decorators/debounce';
import { getColumnAutoComplete, getColumnDataType } from '../services';
import { defaultHandleResponse } from '@/utils/utils';
import { isMysqlOrOracleTable } from '../tools/utils';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const commonColLayout = {
  xs: 24,
  sm: 12,
  xl: 12,
};

@Form.create()
class CommonTableModal extends React.PureComponent {
  state = {
    columnsCompletion: [],
    fetchingCompletion: false,
  };

  getInitValue = (name, inputType) => {
    const { editingItem } = this.props;
    const value = editingItem[name];
    if (inputType === 'select' && !value) {
      return undefined;
    }
    if (inputType === 'switch') {
      return value === 'true' || value === true || value === '1' || value === 1;
    }
    return value || '';
  };

  @Debounce(600)
  handleAutoCompleteInput = (name, value) => {
    if (!value) {
      this.setState({ columnsCompletion: [] });
      return false;
    }
    const paramField = name === 'columnName' || name === 'name' ? 'columnCnName' : 'columnCode';
    const params = {};
    params[paramField] = value;
    this.setState({ fetchingCompletion: true });
    getColumnAutoComplete(params).then(response => {
      this.setState({ fetchingCompletion: false });
      let columnsCompletion = [];
      defaultHandleResponse(response, (resultObject = []) => {
        columnsCompletion = resultObject
          .filter(o => o.columnCnName && o.columnCode)
          .map(o => {
            return {
              ...o,
              label: o[paramField],
            };
          });
      });
      this.setState({ columnsCompletion });
    });
  };

  handleSelectFieldCompletion = value => {
    const { columnsCompletion } = this.state;
    const {
      form: { setFieldsValue },
      schemaType,
    } = this.props;
    const selectedColumn = columnsCompletion.find(o => o.label === value);
    const { dataColumnId } = selectedColumn;
    const isDbType = isMysqlOrOracleTable(schemaType);
    const codeField = isDbType ? 'code' : 'columnCode';
    const nameField = isDbType ? 'name' : 'columnName';
    let vals = {
      [codeField]: selectedColumn.columnCode.split('-')[0],
      [nameField]: selectedColumn.columnCnName.split('-')[0],
    };
    const setColumnType = (resutlDataType, isSync) => {
      const params = {};
      if (isDbType) {
        const { columns } = this.props;
        const typeSource = columns.find(o => o.dataIndex === 'type').datasource;
        params.type = (typeSource.find(o => o.label === resutlDataType) || {}).value;
      } else {
        params.columnType = resutlDataType;
      }
      if (isSync) {
        setFieldsValue(params);
      } else {
        vals = { ...vals, ...params };
      }
    };
    const selectedColumnDbType = selectedColumn.dbType.toLowerCase();
    if (selectedColumnDbType.indexOf(schemaType) === -1) {
      getColumnDataType({
        dbType: selectedColumn.dbType,
        dataType: selectedColumn.dataType,
        currentType: schemaType.toUpperCase(),
      }).then(response => {
        defaultHandleResponse(response, resultObject => {
          if (resultObject) {
            setColumnType(resultObject, true);
          }
        });
      });
    } else {
      setColumnType(selectedColumn.dataType);
    }
    if (isDbType) {
      vals.defaultValue = selectedColumn.defaultValue;
    } else {
      vals.columnDesc = selectedColumn.columnDesc;
    }
    vals.dataColumnId = dataColumnId;
    setTimeout(() => {
      setFieldsValue(vals);
    }, 10);
  };

  getEditItemComponent = column => {
    const { inputType } = column;
    switch (inputType) {
      case 'text':
        return <Input placeholder={column.title} />;
      case 'number': {
        const { min, max } = column;
        const numberProps = {};
        if (min !== undefined) {
          numberProps.min = min;
        }
        if (max !== undefined) {
          numberProps.max = max;
        }
        return <InputNumber placeholder={column.title} {...numberProps} />;
      }
      case 'select': {
        const {
          datasource,
          dataTextField,
          dataValueField,
          onChange,
          allowClear,
          ...restProps
        } = column;
        const textField = dataTextField || 'label';
        const valueField = dataValueField || 'value';
        return (
          <Select
            {...restProps}
            allowClear={allowClear}
            onChange={value => {
              if (onChange) {
                onChange(value);
              }
            }}
            placeholder={column.title}
          >
            {datasource.map(o => (
              <Select.Option key={o[valueField]} value={o[valueField]} title={o[textField]}>
                {o[textField]}
              </Select.Option>
            ))}
          </Select>
        );
      }
      case 'textarea':
        return <Input.TextArea autosize={{ minRows: 3, maxRows: 5 }} placeholder={column.title} />;
      default: {
        if (column.isAutoCompleteField) {
          const { columnsCompletion, fetchingCompletion } = this.state;
          const { dataIndex } = column;
          return (
            <Select
              showSearch
              showArrow={false}
              filterOption={false}
              placeholder={column.title}
              defaultActiveFirstOption={false}
              onSelect={value => this.handleSelectFieldCompletion(value)}
              onSearch={value => this.handleAutoCompleteInput(dataIndex, value)}
              notFoundContent={fetchingCompletion ? <Spin size="small" /> : null}
            >
              {columnsCompletion.map(o => (
                <Select.Option key={o.dataColumnId} value={o.label}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
          );
        }
        return <Input placeholder={column.title} />;
      }
    }
  };

  getFormItems = () => {
    const {
      columns,
      form: { getFieldDecorator },
    } = this.props;
    return columns.map(column => {
      const { inputType, cellEnable } = column;
      if (cellEnable === false) {
        return <div />;
      }
      const textareaItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 19 },
        },
      };
      const itemLayout = inputType === 'textarea' ? textareaItemLayout : {};
      const colLayout = inputType === 'textarea' ? { xs: 24 } : commonColLayout;
      let initialValue = this.getInitValue(column.dataIndex, column.inputType);
      if (!initialValue && column.isAutoCompleteField) {
        initialValue = undefined;
      }
      return (
        <Col {...colLayout} key={column.dataIndex}>
          <Form.Item label={column.title} {...itemLayout}>
            {getFieldDecorator(column.dataIndex, {
              initialValue,
              rules: column.rules || [],
            })(this.getEditItemComponent(column))}
          </Form.Item>
        </Col>
      );
    });
  };

  save = () => {
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const { onOk } = this.props;
      onOk(values);
    });
  };

  render() {
    const {
      visible,
      editType,
      onCancel,
      form: { getFieldDecorator },
      schemaType,
      tabName,
    } = this.props;
    const titleId = editType === 'edit' ? 'COMMON_EDIT' : 'COMMON_NEW';
    const idField = isMysqlOrOracleTable(schemaType) ? 'id' : 'columnId';
    return (
      <Modal
        okText={formatMessage({ id: 'COMMON_OK' })}
        cancelText={formatMessage({ id: 'COMMON_CANCEL' })}
        title={formatMessage({ id: titleId })}
        visible={visible}
        width={1000}
        onOk={this.save}
        onCancel={onCancel}
      >
        <Form {...formItemLayout}>
          <Row>
            {tabName === 'fieldTab' && (
              <div>
                <Col xs={0}>
                  <Form.Item label="" labelCol={{ span: 0 }} wrapperCol={{ span: 0 }}>
                    {getFieldDecorator(`${idField}`, {
                      initialValue: this.getInitValue(idField),
                    })(<Input type="hidden" />)}
                  </Form.Item>
                </Col>
                <Col xs={0}>
                  <Form.Item label="" labelCol={{ span: 0 }} wrapperCol={{ span: 0 }}>
                    {getFieldDecorator('dataColumnId', {
                      initialValue: this.getInitValue('dataColumnId'),
                    })(<Input type="hidden" />)}
                  </Form.Item>
                </Col>
              </div>
            )}
            {this.getFormItems()}
          </Row>
        </Form>
      </Modal>
    );
  }
}
export default CommonTableModal;
