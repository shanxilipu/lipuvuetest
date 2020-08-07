import React from 'react';
import { Form, Col, Select, Input, message, Icon, Radio } from 'antd';
import { formatMessage } from 'umi/locale';
import { getHiveExtObj } from '../services';

const IS_EXTERNAL_DATASOURCE = [
  { label: formatMessage({ id: 'COMMON_NO' }), value: '0' },
  // { label: formatMessage({ id: 'HBASE_EXTERNAL_TABLE' }), value: '1' },
  // { label: formatMessage({ id: 'FILE_EXTERNAL_TABLE' }), value: '2' },
];
const STORAGE_FORMAT_DATASOURCE = [
  { label: formatMessage({ id: 'COMMON_TEXT' }), value: 'TEXTFILE' },
  { label: 'PARQUET', value: 'PARQUET' },
  { label: 'ORC', value: 'ORC' },
];

class HiveTableInfo extends React.Component {
  hiveExtObjComId = null;

  state = {
    showHiveStoreFormat: true,
    showHiveHBaseExtObj: false,
    showHiveHdfsExtObj: false,
    hiveStoreFormatEnable: true,
    // showSelectHiveExtObj: false
  };

  onIsInternalTableChange = isExternalTable => {
    this.setState({
      showHiveStoreFormat: isExternalTable !== '1',
      showHiveHBaseExtObj: isExternalTable === '1',
      showHiveHdfsExtObj: isExternalTable === '2',
      hiveStoreFormatEnable: isExternalTable !== '2',
    });
    const { handleHivePartitionAndFieldsEnable, schemaId, setLoading } = this.props;
    if (handleHivePartitionAndFieldsEnable) {
      handleHivePartitionAndFieldsEnable(isExternalTable !== '1');
    }
    if (isExternalTable !== '0') {
      if (isExternalTable === '2') {
        this.handleStorageFormatChange(STORAGE_FORMAT_DATASOURCE[0].value);
      }
      setLoading(true);
      getHiveExtObj({ schemaId }).then(result => {
        setLoading(false);
        const { resultCode, resultMsg, resultObject } = result;
        if (resultCode === '0') {
          if (!resultObject) {
            return false;
          }
          let hiveExtObjComId = null;
          for (let i = 0; i < resultObject.length; i++) {
            if (
              (isExternalTable === '1' && resultObject[i].componenType === 'HBASE') ||
              (isExternalTable === '2' && resultObject[i].componenType === 'HDFS')
            ) {
              hiveExtObjComId = resultObject[i].componentId;
              break;
            }
          }
          this.hiveExtObjComId = hiveExtObjComId;
        } else {
          message.error(resultMsg);
        }
      });
    }
  };

  handleStorageFormatChange = storedFormat => {
    const { setFieldsValue } = this.props;
    const param = storedFormat === 'ORC' ? 'TBLPROPERTIES ("ORC.COMPRESS"="Snappy")' : '';
    setFieldsValue({
      param,
    });
  };

  render() {
    const {
      editable,
      tableId,
      getFieldDecorator,
      colLayout,
      COMMONRule,
      getInitValue,
    } = this.props;
    const {
      showHiveStoreFormat,
      hiveStoreFormatEnable,
      showHiveHBaseExtObj,
      showHiveHdfsExtObj,
    } = this.state;
    const showHiveExtObj = showHiveHBaseExtObj || showHiveHdfsExtObj;
    const isEditing = !!tableId; // 如果有tableId 说明是编辑状态 用于控制某些项能否编辑
    return (
      <div>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'TABLE_NAME' })}>
            {getFieldDecorator('tableName', {
              initialValue: getInitValue('tableName'),
              rules: [COMMONRule],
            })(
              <Input
                placeholder={formatMessage({ id: 'TABLE_NAME' })}
                disabled={!editable}
                autoComplete="off"
              />
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'TABLE_CODE' })}>
            {getFieldDecorator('tableCode', {
              initialValue: getInitValue('tableCode'),
              rules: [COMMONRule],
            })(
              <Input
                placeholder={formatMessage({ id: 'TABLE_CODE' })}
                disabled={!editable || isEditing}
                autoComplete="off"
              />
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'COLUMN_DELIMITER' })}>
            {getFieldDecorator('coldelimiter', {
              initialValue: getInitValue('coldelimiter') || '|',
              rules: [COMMONRule],
            })(
              <Input
                placeholder={formatMessage({ id: 'COLUMN_DELIMITER' })}
                disabled={!editable || isEditing}
              />
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'IS_EXTERNAL_TABLE' })}>
            {getFieldDecorator('isExternalTable', {
              initialValue: '0',
              rules: [COMMONRule],
            })(
              <Select
                onChange={this.onIsInternalTableChange}
                placeholder={formatMessage({ id: 'IS_EXTERNAL_TABLE' })}
                disabled={!editable || isEditing}
              >
                {IS_EXTERNAL_DATASOURCE.map(datasource => (
                  <Select.Option key={datasource.value} value={datasource.value}>
                    {datasource.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        {showHiveStoreFormat && (
          <Col {...colLayout}>
            <Form.Item label={formatMessage({ id: 'STORAGE_FORMAT' })}>
              {getFieldDecorator('storedFormat', {
                initialValue: getInitValue('storedFormat') || 'TEXTFILE',
                rules: [COMMONRule],
              })(
                <Select
                  onChange={this.handleStorageFormatChange}
                  placeholder={formatMessage({ id: 'STORAGE_FORMAT' })}
                  disabled={!editable || isEditing || !hiveStoreFormatEnable}
                >
                  {STORAGE_FORMAT_DATASOURCE.map(datasource => (
                    <Select.Option key={datasource.value} value={datasource.value}>
                      {datasource.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        )}
        {showHiveExtObj && (
          <Col {...colLayout}>
            <Form.Item
              label={formatMessage({
                id: showHiveHBaseExtObj ? 'RELATED_HBASE_TABLE' : 'HDFS_DIRECTORY',
              })}
            >
              {getFieldDecorator('extObj', {
                rules: [COMMONRule],
              })(<Input disabled addonAfter={<Icon type="search" />} />)}
            </Form.Item>
          </Col>
        )}
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'STORAGE_LOG_TYPE' })}>
            {getFieldDecorator('impLogType', {
              initialValue: getInitValue('impLogType'),
            })(
              <Radio.Group disabled={!editable || isEditing}>
                <Radio value="1">{formatMessage({ id: 'METADATA_DETAIL' })}</Radio>
                <Radio value="0">{formatMessage({ id: 'METADATA_SUMMARY' })}</Radio>
              </Radio.Group>
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={24}>
          <Form.Item
            label={formatMessage({ id: 'TABLE_PROPERTY_SQL_STATEMENT' })}
            labelCol={{ xs: { span: 24 }, sm: { span: 4 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 20 } }}
          >
            {getFieldDecorator('param', {
              initialValue: getInitValue('param'),
            })(
              <Input
                placeholder={formatMessage({ id: 'TABLE_PROPERTY_SQL_STATEMENT' })}
                disabled={!editable || isEditing}
              />
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={24}>
          <Form.Item
            label={formatMessage({ id: 'COMMON_DESCRIPTION' })}
            labelCol={{ xs: { span: 24 }, sm: { span: 4 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 20 } }}
          >
            {getFieldDecorator('tableDesc', {
              initialValue: getInitValue('tableDesc'),
            })(
              <Input
                placeholder={formatMessage({ id: 'COMMON_DESCRIPTION' })}
                disabled={!editable}
              />
            )}
          </Form.Item>
        </Col>
      </div>
    );
  }
}
export default HiveTableInfo;
