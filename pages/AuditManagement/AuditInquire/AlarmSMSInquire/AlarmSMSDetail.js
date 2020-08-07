import React from 'react';
import { Modal, Table, Input, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import Pagination from '@/components/Pagination';
import {
  queryLogsCollectionAlarmDetail,
  querySensitiveActionAlarmDetail,
} from '@/services/auditManagement/alarmSMSInquire';
import { storageFormatter } from '../../AuditConfig/CollectionAlarmConfig/helper';
import { checkLanguageIsEnglish, defaultHandleResponse, extractSearchParams } from '@/utils/utils';
import { LOGS_EVENT_TYPES } from '../../common/const';
import styles from './index.less';

class AlarmSMSDetail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      searchParams: {},
      pageInfo: { pageIndex: 1, pageSize: 10, total: 0 },
    };
  }

  componentDidUpdate(prevProps) {
    const { item, visible } = this.props;
    if (visible && !prevProps.visible && item.uuid !== prevProps.item.uuid) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ searchParams: {} }, () => {
        this.getDetail();
      });
    }
  }

  getDetail = (pageIndex = 1, pageSize = 10) => {
    const { searchParams } = this.state;
    const {
      item: { riskIdArr = '', warningType, riskType },
    } = this.props;
    const ids = riskIdArr ? riskIdArr.split(',') : [];
    const service =
      `${warningType}` === '1' ? querySensitiveActionAlarmDetail : queryLogsCollectionAlarmDetail;
    const extraParams = {};
    if (`${warningType}` === '1') {
      extraParams.riskTypeId = riskType;
    } else {
      extraParams.warnType = riskType;
    }
    this.setState({ loading: true });
    service({
      pageIndex,
      pageSize,
      ids,
      ...extractSearchParams(searchParams),
      ...extraParams,
    }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (resultObject = {}) => {
        const { pageInfo, rows = [] } = resultObject;
        this.setState({ pageInfo, list: rows });
      });
    });
  };

  getColumns = () => {
    const {
      item: { warningType = 1 },
    } = this.props;
    if (`${warningType}` === '1') {
      return [
        { title: `${formatMessage({ id: 'riskConfig.AlarmedAccount' })}`, dataIndex: 'userCode' },
        { title: `${formatMessage({ id: 'riskConfig.AlarmedName' })}`, dataIndex: 'userName' },
        {
          title: `${formatMessage({ id: 'riskConfig.AccessTheDatabase' })}`,
          dataIndex: 'databaseBelong',
        },
      ];
    }
    return [
      {
        title: formatMessage({
          id: 'alarmCollectionConfig.collectionTaskName',
          defaultMessage: '采集任务名称',
        }),
        dataIndex: 'taskName',
      },
      {
        title: formatMessage({ id: 'riskConfig.accountPeriod', defaultMessage: '账期' }),
        dataIndex: 'taskDue',
      },
    ];
  };

  renderExpandedContent = record => {
    const {
      item: { warningType = 1 },
    } = this.props;
    if (`${warningType}` === '1') {
      return (
        <div className={styles.expandedDetailRow}>
          <div>
            <span>{formatMessage({ id: 'riskConfig.AccessTable' })}: </span>
            <span className={styles.content}>{record.tablesBelong || ''}</span>
          </div>
          <div>
            <span>{formatMessage({ id: 'riskConfig.AccessSensitiveFields' })}: </span>
            <span className={styles.content}>{record.sensitiveFields || ''}</span>
          </div>
          <div>
            <span>{formatMessage({ id: 'riskConfig.AccessUndesensedFields' })}: </span>
            <span className={styles.content}>{record.desensitizeFields || ''}</span>
          </div>
          <div>
            <span>{formatMessage({ id: 'auditManagement.DataScript' })}: </span>
            <span className={styles.content}>{record.sqlScript || ''}</span>
          </div>
        </div>
      );
    }
    const alarmType = LOGS_EVENT_TYPES.find(o => `${o.value}` === `${record.warnType}`) || {};
    return (
      <div className={styles.expandedDetailRow}>
        <div>
          <span>{formatMessage({ id: 'riskConfig.alarmType', defaultMessage: '告警类型' })}: </span>
          <span className={styles.content}>{alarmType.label || ''}</span>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'collection.dataTransSize', defaultMessage: '数据传输量' })}:{' '}
          </span>
          <span className={styles.content}>
            {`${record.transSize}${formatMessage({
              id: 'alarmCollectionConfig.rows',
              defaultMessage: '行',
            })}${checkLanguageIsEnglish() && record.transSize > 1 ? 's' : ''}`}
          </span>
        </div>
        <div>
          <span>
            {formatMessage({ id: 'collection.dataStorageSize', defaultMessage: '数据存储量' })}:{' '}
          </span>
          <span className={styles.content}>{storageFormatter(record.storeSize)}</span>
        </div>
      </div>
    );
  };

  handleSearchInputChange = (e, name) => {
    const {
      target: { value },
    } = e;
    const { searchParams } = this.state;
    this.setState({ searchParams: { ...searchParams, [name]: value } });
  };

  render() {
    const {
      visible,
      onCancel,
      item: { warningType = 1 },
    } = this.props;
    const {
      list,
      loading,
      searchParams,
      pageInfo: { pageIndex, pageSize, total },
    } = this.state;
    const pagination = {
      pageSize,
      current: pageIndex,
      total,
      onChange: this.getDetail,
      onShowSizeChange: this.getDetail,
    };
    return (
      <Modal
        onCancel={onCancel}
        footer={null}
        width={1000}
        visible={visible}
        title={`${formatMessage({ id: 'riskConfig.AlarmInfoView' })}`}
      >
        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
          {`${warningType}` === '1' ? (
            <div className={styles.searchHeader}>
              <span>
                {formatMessage({ id: 'riskConfig.alarmedUserName', defaultMessage: '被告警姓名' })}:
              </span>
              <Input
                placeholder={formatMessage({
                  id: 'riskConfig.alarmedUserName',
                  defaultMessage: '被告警姓名',
                })}
                style={{ width: 120 }}
                value={searchParams.userName || ''}
                onChange={e => this.handleSearchInputChange(e, 'userName')}
              />
              <span>
                {formatMessage({ id: 'riskConfig.alarmedUserCode', defaultMessage: '被告警账号' })}:
              </span>
              <Input
                placeholder={formatMessage({
                  id: 'riskConfig.alarmedUserCode',
                  defaultMessage: '被告警账号',
                })}
                style={{ width: 120 }}
                value={searchParams.userCode || ''}
                onChange={e => this.handleSearchInputChange(e, 'userCode')}
              />
              <Button type="primary" onClick={() => this.getDetail()}>
                {formatMessage({ id: 'COMMON_SEARCH', defaultMessage: '搜索' })}
              </Button>
            </div>
          ) : (
            <Input.Search
              placeholder={formatMessage({
                id: 'alarmCollectionConfig.collectionTaskName',
                defaultMessage: '采集任务名称',
              })}
              style={{ width: '30%' }}
              value={searchParams.taskName || ''}
              onChange={e => this.handleSearchInputChange(e, 'taskName')}
              onSearch={() => this.getDetail()}
            />
          )}
        </div>
        <Table
          loading={loading}
          dataSource={list}
          columns={this.getColumns()}
          pagination={false}
          expandedRowRender={this.renderExpandedContent}
          scroll={{ y: 520 }}
        />
        <Pagination pagination={pagination} />
      </Modal>
    );
  }
}
export default AlarmSMSDetail;
