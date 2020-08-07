import React from 'react';
import { Modal, Table, Checkbox, InputNumber, Select, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import {
  ALL_PERIOD_UNITS,
  ALL_STORAGE_UNITS,
  getRepeatedPeriodInitialValue,
  getStorageInitialValue,
} from './helper';
import { checkLanguageIsEnglish } from '@/utils/utils';

class ImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      selectedRowKeys: [],
      confirmLoading: false,
    };
  }

  setRowItemValue = (name, record) => {
    if (name === 'repeatCheckPeriod' || name === 'repeatCheckPeriodUnit') {
      const { value, unit } = getRepeatedPeriodInitialValue(record.repeatCheckPeriod);
      return name === 'repeatCheckPeriod' ? value : unit;
    }
    if (name === 'overstoreThreshold' || name === 'overstoreThresholdUnit') {
      const { value, unit } = getStorageInitialValue(record.overstoreThreshold);
      return name === 'overstoreThreshold' ? value : unit;
    }
    return '';
  };

  getColumns = () => [
    {
      dataIndex: 'taskName',
      title: formatMessage({
        id: 'alarmCollectionConfig.collectionTaskName',
        defaultMessage: '采集任务名称',
      }),
    },
    {
      dataIndex: 'exceptionCheckEnable',
      title: formatMessage({
        id: 'alarmCollectionConfig.abnormalInterrupt',
        defaultMessage: '异常中断告警',
      }),
      render: (checked, record) => (
        <Checkbox
          checked={checked}
          onChange={e => this.handleSaveRowData(e.target.checked, record, 'exceptionCheckEnable')}
        />
      ),
    },
    {
      dataIndex: 'repeatCheckEnable',
      title: formatMessage({
        id: 'alarmCollectionConfig.repeatCollectionAlarmThreshold',
        defaultMessage: '重复采集告警阈值',
      }),
      render: (checked, record) => (
        <div className={styles.paramsCon}>
          <Checkbox
            checked={checked}
            onChange={e => this.handleSaveRowData(e.target.checked, record, 'repeatCheckEnable')}
          />
          <span>{formatMessage({ id: 'alarmCollectionConfig.every', defaultMessage: '每' })}</span>
          <InputNumber
            min={1}
            value={record.repeatCheckPeriod}
            onChange={value => this.handleSaveRowData(value, record, 'repeatCheckPeriod')}
          />
          <Select
            value={record.repeatCheckPeriodUnit}
            onChange={value => this.handleSaveRowData(value, record, 'repeatCheckPeriodUnit')}
          >
            {ALL_PERIOD_UNITS.map(o => (
              <Select.Option key={o.value} value={o.value}>
                {o.label}
              </Select.Option>
            ))}
          </Select>
          <span>{formatMessage({ id: 'alarmCollectionConfig.over', defaultMessage: '超过' })}</span>
          <InputNumber
            min={1}
            value={record.repeatMaxTime}
            onChange={value => this.handleSaveRowData(value, record, 'repeatMaxTime')}
          />
          <span>
            {formatMessage({ id: 'alarmCollectionConfig.times', defaultMessage: '次' })}
            {checkLanguageIsEnglish() ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      dataIndex: 'overtransCheckEnable',
      title: formatMessage({
        id: 'alarmCollectionConfig.overTransAlarmThreshold',
        defaultMessage: '传输量超标告警阈值',
      }),
      render: (checked, record) => (
        <div className={styles.paramsCon}>
          <Checkbox
            checked={checked}
            onChange={e => this.handleSaveRowData(e.target.checked, record, 'overtransCheckEnable')}
          />
          <InputNumber
            min={1}
            value={record.overtransThreshold}
            onChange={value => this.handleSaveRowData(value, record, 'overtransThreshold')}
          />
          <span>
            {formatMessage({ id: 'alarmCollectionConfig.rows', defaultMessage: '行' })}
            {checkLanguageIsEnglish() ? '(s)' : ''}
          </span>
        </div>
      ),
    },
    {
      dataIndex: 'overstoreCheckEnable',
      title: formatMessage({
        id: 'alarmCollectionConfig.overStoreAlarmThreshold',
        defaultMessage: '存储量超标告警阈值',
      }),
      render: (checked, record) => (
        <div className={styles.paramsCon}>
          <Checkbox
            checked={checked}
            onChange={e => this.handleSaveRowData(e.target.checked, record, 'overstoreCheckEnable')}
          />
          <InputNumber
            min={1}
            value={record.overstoreThreshold}
            onChange={value => this.handleSaveRowData(value, record, 'overstoreThreshold')}
          />
          <Select
            value={record.overstoreThresholdUnit}
            onChange={value => this.handleSaveRowData(value, record, 'overstoreThresholdUnit')}
          >
            {ALL_STORAGE_UNITS.map(o => (
              <Select.Option key={o.value} value={o.value}>
                {o.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
    },
  ];

  handleSaveRowData = (value, record, dataIndex) => {
    const { list } = this.state;
    this.setState({
      list: list.map(o => {
        if (o.id === record.id) {
          return {
            ...o,
            [dataIndex]: value,
          };
        }
        return { ...o };
      }),
    });
  };

  render() {
    const { confirmLoading, list, selectedRowKeys } = this.state;
    const { visible, onCancel } = this.props;
    const scrollY = window.innerHeight * 0.8;
    return (
      <Modal
        width={window.innerWidth * 0.9}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        title={formatMessage({
          id: 'alarmCollectionConfig.importModalTitle',
          defaultMessage: '采集任务导入确认',
        })}
      >
        <Input.Search />
        <Table
          rowKey="id"
          loading={confirmLoading}
          columns={this.getColumns()}
          dataSource={list}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: keys => this.setState({ selectedRowKeys: keys }),
          }}
          scroll={{ y: scrollY }}
        />
      </Modal>
    );
  }
}
export default ImportModal;
