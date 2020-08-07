import React from 'react';
import moment from 'moment';
import * as _ from 'lodash';
import {
  Button,
  Select,
  Input,
  Table,
  Badge,
  Form,
  Col,
  Row,
  Popconfirm,
  message,
  Upload,
} from 'antd';
import Pagination from '@/components/Pagination';
import MyIcon from '@/components/MyIcon';
import CollectionAlarmModal from './CollectionAlarmModal';
import { formatMessage } from 'umi/locale';
import {
  getCollectionAlarmConfigList,
  deleteCollectionAlarms,
} from '@/services/auditManagement/collectionAlarm';
import {
  checkLanguageIsEnglish,
  defaultHandleResponse,
  extractSearchParams,
  downloadFile,
} from '@/utils/utils';
import { secondsFormatter, storageFormatter } from './helper';
import { defaultFormItemLayout } from '@/utils/const';
import styles from './index.less';
import tableIconsGroupStyles from '@/pages/styles/tableIconsGroup.less';

const maxTimesFormatter = times => {
  const isEn = checkLanguageIsEnglish();
  if (isEn) {
    return `exceed ${times} ${times > 1 ? 'times' : 'time'}`;
  }
  return `超过${times}次`;
};

const ALL_STATES = [
  { label: formatMessage({ id: 'COMMON_ENABLE', defaultMessage: '启用' }), value: true },
  { label: formatMessage({ id: 'DISABLED_USING', defaultMessage: '停用' }), value: false },
];

const renderState = state => {
  let obj = ALL_STATES.find(o => o.value === state);
  if (!obj) {
    [, obj] = ALL_STATES;
  }
  const { value, label } = obj;
  return <Badge text={label} status={value ? 'success' : 'error'} />;
};

@Form.create()
class CollectionAlarm extends React.Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.currentItem = {};
    this.state = {
      list: [],
      loading: false,
      selectedRowKeys: [],
      showEditModal: false,
      uploadFileLoading: false,
      pageInfo: { pageIndex: 1, pageSize: 10, total: 0 },
    };
  }

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
      render: renderState,
    },
    {
      dataIndex: 'repeatCheckEnable',
      ellipsis: true,
      title: formatMessage({
        id: 'alarmCollectionConfig.repeatCollectionAlarmThreshold',
        defaultMessage: '重复采集告警阈值',
      }),
      render: (enable, record) => {
        if (!enable) {
          return renderState(false);
        }
        const { repeatCheckPeriod, repeatMaxTime } = record;
        const p = secondsFormatter(parseInt(repeatCheckPeriod, 10));
        return `${p} ${maxTimesFormatter(repeatMaxTime)}`;
      },
    },
    {
      dataIndex: 'overtransCheckEnable',
      title: formatMessage({
        id: 'alarmCollectionConfig.overTransAlarmThreshold',
        defaultMessage: '传输量超标告警阈值',
      }),
      render: (enable, record) => {
        if (!enable) {
          return renderState(false);
        }
        const { overtransThreshold } = record;
        return `${overtransThreshold}${formatMessage({
          id: 'alarmCollectionConfig.rows',
          defaultMessage: '行',
        })}${checkLanguageIsEnglish() && overtransThreshold > 1 ? 's' : ''}`;
      },
    },
    {
      dataIndex: 'overstoreCheckEnable',
      title: formatMessage({
        id: 'alarmCollectionConfig.overStoreAlarmThreshold',
        defaultMessage: '存储量超标告警阈值',
      }),
      render: (enable, record) => {
        if (!enable) {
          return renderState(false);
        }
        const { overstoreThreshold } = record;
        return storageFormatter(overstoreThreshold);
      },
    },
    {
      dataIndex: 'createTime',
      title: formatMessage({ id: 'CREATE_DATE', defaultMessage: '创建时间' }),
      render: val => moment(val).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      dataIndex: 'state',
      title: formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' }),
      render: renderState,
    },
    {
      dataIndex: 'action',
      title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
      render: (v, record) => (
        <div className={tableIconsGroupStyles.tableIconsGroup}>
          <MyIcon type="iconbianjix" onClick={() => this.handleEditItem(record)} />
          <Popconfirm
            onConfirm={() => this.handleDeleteItems([record.id])}
            title={formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除?' })}
          >
            <MyIcon type="iconshanchubeifenx" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  componentDidMount() {
    this.getData();
  }

  getData = (pageIndex = 1, pageSize = 10) => {
    const payload = { pageIndex, pageSize, ...this.searchParams };
    this.setState({ loading: true });
    getCollectionAlarmConfigList(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (resultObject = {}) => {
        const { pageInfo, rows = [] } = resultObject;
        this.setState({ pageInfo, list: rows, selectedRowKeys: [] });
      });
    });
  };

  handleSearch = () => {
    const {
      form: { getFieldsValue },
    } = this.props;
    const params = getFieldsValue();
    this.searchParams = extractSearchParams(params);
    this.getData();
  };

  handleReset = () => {
    const {
      form: { resetFields },
    } = this.props;
    this.searchParams = {};
    this.getData();
    resetFields();
  };

  handleSelectAll = checked => {
    const { list } = this.state;
    this.setState({ selectedRowKeys: checked ? list.map(o => o.id) : [] });
  };

  handleDeleteItems = ids => {
    this.setState({ loading: true });
    deleteCollectionAlarms(ids).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功！' })
        );
        const {
          pageInfo: { pageIndex, pageSize },
          list,
        } = this.state;
        let newPageIndex = pageIndex;
        if (list.length === ids.length) {
          newPageIndex = Math.max(1, pageIndex - 1);
        }
        this.getData(newPageIndex, pageSize);
      });
    });
  };

  handleEditItem = (item = {}) => {
    this.currentItem = { ...item };
    this.setState({ showEditModal: true });
  };

  downLoadTemplate = () => {
    downloadFile('smartsafe/SafeDatcolWarnTaskController/getTemplate', {});
  };

  handleUploadFile = info => {
    const { status, response } = info.file;
    if (status === 'done') {
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'COMMON_IMPORT_SUCCESS', defaultMessage: '导入成功' }));
        this.getData();
      });
    }
    this.setState({ uploadFileLoading: status === 'uploading' });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      list,
      loading,
      showEditModal,
      selectedRowKeys,
      uploadFileLoading,
      pageInfo: { pageIndex, pageSize, total },
    } = this.state;
    const pagination = {
      current: pageIndex || 1,
      pageSize,
      total,
      onChange: this.getData,
      onShowSizeChange: this.getData,
    };
    return (
      <div className="fullHeight">
        <Row>
          <Col xs={24} lg={14}>
            <Form {...defaultFormItemLayout} layout="inline" className={styles.form}>
              <Col xs={24} sm={12} lg={12}>
                <Form.Item
                  label={formatMessage({
                    id: 'alarmCollectionConfig.collectionTaskName',
                    defaultMessage: '采集任务名称',
                  })}
                >
                  {getFieldDecorator('taskName')(
                    <Input
                      placeholder={formatMessage({
                        id: 'alarmCollectionConfig.collectionTaskName',
                        defaultMessage: '采集任务名称',
                      })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={7}>
                <Form.Item label={formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}>
                  {getFieldDecorator('state')(
                    <Select
                      placeholder={formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}
                    >
                      <Select.Option value="">
                        {formatMessage({ id: 'COMMON_ALL', defaultMessage: '全部' })}
                      </Select.Option>
                      <Select.Option value={true}>
                        {formatMessage({ id: 'COMMON_ENABLE', defaultMessage: '启用' })}
                      </Select.Option>
                      <Select.Option value={false}>
                        {formatMessage({ id: 'DISABLED_USING', defaultMessage: '停用' })}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} lg={5} className={styles.buttonGroup}>
                <Button type="primary" ghost onClick={this.handleSearch}>
                  {formatMessage({ id: 'BTN_SEARCH', defaultMessage: '查询' })}
                </Button>
                <Button onClick={this.handleReset}>
                  {formatMessage({ id: 'BTN_RESET', defaultMessage: '重置' })}
                </Button>
              </Col>
            </Form>
          </Col>
          <Col
            xs={24}
            lg={10}
            className={styles.buttonGroup}
            style={{ justifyContent: 'flex-end' }}
          >
            <Button type="primary" icon="plus" onClick={() => this.handleEditItem()}>
              {formatMessage({ id: 'BUTTON_ADD', defaultMessage: '新增' })}
            </Button>
            {/* <Button> */}
            {/*  <MyIcon type="iconxiazai" /> */}
            {/*  {formatMessage({ */}
            {/*    id: 'alarmCollectionConfig.scheduleImport', */}
            {/*    defaultMessage: '调度导入', */}
            {/*  })} */}
            {/* </Button> */}
            <Upload
              name="file"
              action="smartsafe/SafeDatcolWarnTaskController/uploadTemplate"
              headers={{ 'signature-sessionId': window.name }}
              accept=".csv"
              showUploadList={false}
              onChange={this.handleUploadFile}
              beforeUpload={() => {
                this.setState({ uploadFileLoading: true });
              }}
            >
              <Button loading={uploadFileLoading}>
                {!uploadFileLoading && <MyIcon type="iconxiazai" />}
                {formatMessage({
                  id: 'applySysUserManagement.ImportFiles',
                  defaultMessage: '导入文件',
                })}
              </Button>
            </Upload>
            <a onClick={this.downLoadTemplate}>
              {formatMessage({
                id: 'applySysUserManagement.DownloadTemplate',
                defaultMessage: '下载模板',
              })}
            </a>
          </Col>
        </Row>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={list}
          pagination={false}
          columns={this.getColumns()}
          rowSelection={{
            selectedRowKeys,
            onChange: keys => this.setState({ selectedRowKeys: keys }),
          }}
        />
        <Pagination
          pagination={pagination}
          pageAllCount={list.length}
          selectKeysList={selectedRowKeys}
          selectAllChange={e => this.handleSelectAll(e.target.checked)}
          multiBtnList={[
            {
              text: formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' }),
              confirmText: formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除?' }),
              onClick: this.handleDeleteItems,
            },
          ]}
        />
        <CollectionAlarmModal
          visible={showEditModal}
          item={this.currentItem}
          ALL_STATES={ALL_STATES}
          onOk={() => {
            let pi = pageIndex;
            if (_.isEmpty(this.currentItem)) {
              pi = 1;
            }
            this.getData(pi, pageSize);
          }}
          onCancel={() => this.setState({ showEditModal: false })}
        />
      </div>
    );
  }
}
export default CollectionAlarm;
