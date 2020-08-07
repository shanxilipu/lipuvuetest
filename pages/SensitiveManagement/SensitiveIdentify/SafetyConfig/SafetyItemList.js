import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table,
  Divider,
  message,
  Popconfirm,
  Icon,
} from 'antd';
import styles from './index.less';
import MyIcon from '@/components/MyIcon';
import dataMapper from '@/utils/dataMapper';
import {
  getSafetyItemList,
  multiDeleteSafeItem,
  deleteSafeItem,
  switchJobStatus,
} from '@/services/sensitiveManagement/SafeItemService';
// import PageHeader from "@/pages/SensitiveManagement/SensitiveIdentify/Components/PageHeader";

const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

@Form.create()
class SafetyItemList extends PureComponent {
  // ===================================
  // life cycle
  // ===================================

  constructor(props) {
    super(props);
    this.pageSize = 5;
    this.state = {
      loading: false,
      pageInfo: {},
      selectedRowKeys: [],
      dataSource: [],
      scheduleTypeValue: '',
      searchExecutionValidator: {},
    };
  }

  componentDidMount() {
    const { viewDidMountHandler } = this.props;
    if (viewDidMountHandler) {
      viewDidMountHandler('SafetyItemList', this);
    }
    this.reload();
  }

  // ===================================
  // common
  // ===================================

  reload = pageIndex => {
    this.setState({ loading: true, searchExecutionValidator: {} });
    const params = {
      pageIndex: pageIndex || 1,
      pageSize: this.pageSize,
      ...this.searchFormValue,
    };
    getSafetyItemList(params).then(resp => {
      const { resultObject } = resp;
      this.setState({
        pageInfo: resultObject.pageInfo || {},
        dataSource: resultObject.rows || [],
        loading: false,
      });
    });
  };

  toTimestr = (timeStamp, isDateShow = false) => {
    const time = new Date(timeStamp);
    const Y = time.getFullYear();
    const M = (time.getMonth() + 1).toString().padStart(2, '0');
    const D = time
      .getDate()
      .toString()
      .padStart(2, '0');
    const h = time
      .getHours()
      .toString()
      .padStart(2, '0');
    const m = time
      .getMinutes()
      .toString()
      .padStart(2, '0');
    const s = time
      .getSeconds()
      .toString()
      .padStart(2, '0');
    let resultTime = `${Y}-${M}-${D} ${h}:${m}:${s}`;
    if (isDateShow) {
      resultTime = `${h}:${m}`;
    }
    return resultTime;
  };

  removeSelectedItems = () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warning(
        `${formatMessage({
          id: 'SafetyConfig.SelectDataDeletedFirst',
          defaultMessage: '请先选择需要删除的数据',
        })}`
      );
      return;
    }
    const idList = selectedRowKeys.map(id => {
      return { id };
    });
    multiDeleteSafeItem({ idList }).then(result => {
      const { resultCode, resultMsg } = result;
      if (resultCode === '0') {
        message.success(
          `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })}`
        );
        this.reload();
      } else {
        message.error(resultMsg);
      }
    });
  };

  removeItem = id => {
    deleteSafeItem({ id }).then(result => {
      const { resultCode, resultMsg } = result;
      if (resultCode === '0') {
        message.success(
          `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })}`
        );
        this.reload();
      } else {
        message.error(resultMsg);
      }
    });
  };

  // ===================================
  // events
  // ===================================

  handleSafetyItemSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((error, value) => {
      if (!error) {
        const fmt = 'YYYY-MM-DD HH:mm:ss';
        if (value.scheduleTime && value.scheduleTime.length > 0) {
          if (!value.scheduleType) {
            this.setState({
              searchExecutionValidator: {
                help: formatMessage({
                  id: 'SafetyConfig.ExecutionCycleTip',
                  defaultMessage: '请选择执行周期',
                }),
                validateStatus: 'error',
              },
            });
            return false;
          }
          value.startScheduleTime = value.scheduleTime[0].format(fmt);
          value.endScheduleTime = value.scheduleTime[1].format(fmt);
          delete value.scheduleTime;
        }
        this.searchFormValue = value;
        this.reload();
      }
    });
  };

  clearSearchFormInputs = () => {
    const { form } = this.props;
    form.resetFields();
    this.searchFormValue = {};
    this.reload();
  };

  getSafetyItemListByPage = page => {
    const { current } = page;
    this.reload(current);
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  handleEditItem = (itemId, e) => {
    e.preventDefault();
    const { handleEditSafetyItem } = this.props;
    if (handleEditSafetyItem) {
      handleEditSafetyItem(itemId);
    }
  };

  handleCheckItem = (itemId, e) => {
    e.preventDefault();
    const { handleCheckSafetyItem } = this.props;
    if (handleCheckSafetyItem) {
      handleCheckSafetyItem(itemId);
    }
  };

  handleDeleteItem = (itemId, e) => {
    e.preventDefault();
    this.removeItem(itemId);
  };

  handleChangeSwitch = item => {
    const { id } = item;
    switchJobStatus({ id }).then(result => {
      const { resultCode, resultMsg } = result;
      if (resultCode === '0') {
        message.success(resultMsg);
        this.reload(1);
      } else {
        message.error(resultMsg);
      }
    });
  };

  scheduleTyleChange = scheduleTypeValue => {
    this.setState({
      scheduleTypeValue,
      searchExecutionValidator: {},
    });
  };

  // ===================================
  // render
  // ===================================

  render() {
    const {
      selectedRowKeys,
      dataSource,
      loading,
      pageInfo,
      scheduleTypeValue,
      searchExecutionValidator,
    } = this.state;
    const { form, newSafetyItem, removeBatchItems } = this.props;
    const { getFieldDecorator } = form;
    const pagination = {
      total: pageInfo.total,
      pageSize: pageInfo.pageSize,
      current: pageInfo.pageIndex,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 15 },
      },
    };

    const formItemLayout1 = {
      labelCol: {
        sm: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 16 },
      },
    };

    const columns = [
      {
        title: `${formatMessage({ id: 'SafetyConfig.EntryCode', defaultMessage: '条目编码' })}`,
        dataIndex: 'itemCode',
        key: 'itemCode',
        render: text => <span title={text}>{text}</span>,
      },
      {
        title: `${formatMessage({ id: 'FieldConfirm.EntryName', defaultMessage: '条目名称' })}`,
        dataIndex: 'itemName',
        key: 'itemName',
        render: text => <span title={text}>{text}</span>,
      },
      {
        title: `${formatMessage({
          id: 'FieldInquire.SensitivityLevel',
          defaultMessage: '敏感级别',
        })}`,
        dataIndex: 'levelName',
        key: 'levelName',
        render: text => <span title={text}>{text}</span>,
      },
      {
        title: `${formatMessage({
          id: 'FieldInquire.DesensitizationMeasures',
          defaultMessage: '脱敏措施',
        })}`,
        dataIndex: 'desensitizeName',
        key: 'desensitizeName',
        render: text => <span title={text}>{text}</span>,
      },
      {
        title: `${formatMessage({
          id: 'SafetyConfig.CoverOriginalFacilities',
          defaultMessage: '覆盖原设施',
        })}`,
        dataIndex: 'isCovert',
        key: 'isCovert',
        render: dataMapper.isCovertMap,
      },
      {
        title: `${formatMessage({
          id: 'SafetyConfig.ExecutionCycle',
          defaultMessage: '执行周期',
        })}`,
        dataIndex: 'scheduleType',
        key: 'scheduleType',
        render: dataMapper.scheduleTypeMap,
      },
      {
        title: `${formatMessage({ id: 'SafetyConfig.ExecutionDate', defaultMessage: '执行日期' })}`,
        dataIndex: 'scheduleDateStr',
        key: 'scheduleDateStr',
        render: text => <span title={text || '-'}>{text || '-'}</span>,
      },
      {
        title: `${formatMessage({ id: 'SafetyConfig.ExecutionTime', defaultMessage: '执行时间' })}`,
        dataIndex: 'scheduleTimeStr',
        key: 'scheduleTimeStr',
        render: text => <span title={text || '-'}>{text || '-'}</span>,
      },
      {
        title: `${formatMessage({
          id: 'SafetyConfig.LinkageRecognition',
          defaultMessage: '联动识别',
        })}`,
        dataIndex: 'isLinkage',
        key: 'isLinkage',
        render: dataMapper.isLinkageMap,
      },
      {
        title: `${formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' })}`,
        dataIndex: 'state',
        key: 'state',
        render: dataMapper.safeItemStateMap,
      },
      {
        title: `${formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}`,
        dataIndex: 'opts',
        key: 'opts',
        render: (_, item) => (
          <span>
            <Icon
              type="eye"
              title={formatMessage({ id: 'COMMON_VIEW', defaultMessage: '查看' })}
              onClick={this.handleCheckItem.bind(this, item.id)}
            />
            <Divider type="vertical" />
            <MyIcon
              type="iconbianjix"
              title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
              onClick={this.handleEditItem.bind(this, item.id)}
            />
            <Divider type="vertical" />
            <Popconfirm
              title={
                item.state === '1'
                  ? `${formatMessage({
                      id: 'SafetyConfig.DisableTip',
                      defaultMessage: '确定停用吗？',
                    })}`
                  : `${formatMessage({
                      id: 'SafetyConfig.EnableTip',
                      defaultMessage: '确定启用吗？',
                    })}`
              }
              onConfirm={this.handleChangeSwitch.bind(this, item)}
              onCancel={e => e.stopPropagation()}
            >
              {item.state === '1' ? (
                <MyIcon
                  type="icontingyongx"
                  title={formatMessage({ id: 'SafetyConfig.Disable', defaultMessage: '停用' })}
                />
              ) : (
                <MyIcon
                  type="iconqiyongx"
                  title={formatMessage({ id: 'SafetyConfig.Enable', defaultMessage: '启用' })}
                />
              )}
            </Popconfirm>
          </span>
        ),
      },
    ];
    if (scheduleTypeValue === '1') {
      const column = columns.find(o => o.key === 'scheduleDateStr');
      const idx = columns.indexOf(column);
      columns.splice(idx, 1);
    }
    return (
      <div>
        <div className={styles.searchForm}>
          <Form onSubmit={this.handleSafetyItemSearch}>
            <Row>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={formatMessage({
                    id: 'SafetyConfig.EntryCode',
                    defaultMessage: '条目编码',
                  })}
                >
                  {getFieldDecorator('itemCode')(
                    <Input
                      allowClear
                      placeholder={formatMessage({
                        id: 'COMMON_ENTER_TIP',
                        defaultMessage: '请输入',
                      })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={formatMessage({
                    id: 'FieldConfirm.EntryName',
                    defaultMessage: '条目名称',
                  })}
                >
                  {getFieldDecorator('itemName')(
                    <Input
                      allowClear
                      placeholder={formatMessage({
                        id: 'COMMON_ENTER_TIP',
                        defaultMessage: '请输入',
                      })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout1}
                  label={formatMessage({
                    id: 'SafetyConfig.ExecutionTime',
                    defaultMessage: '执行时间',
                  })}
                >
                  {getFieldDecorator('scheduleTime')(
                    <RangePicker
                      format={dateFormat}
                      showTime={{ format: 'HH:mm:ss' }}
                      style={{ width: '90%' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={formatMessage({
                    id: 'SafetyConfig.ExecutionCycle',
                    defaultMessage: '执行周期',
                  })}
                  {...searchExecutionValidator}
                >
                  {getFieldDecorator('scheduleType')(
                    <Select
                      allowClear
                      placeholder={formatMessage({
                        id: 'SafetyConfig.ExecutionCycleTip',
                        defaultMessage: '请选择执行周期',
                      })}
                      onChange={this.scheduleTyleChange}
                    >
                      <Option value="1">
                        {formatMessage({ id: 'SafetyConfig.Day', defaultMessage: '日' })}
                      </Option>
                      <Option value="2">
                        {formatMessage({ id: 'SafetyConfig.Month', defaultMessage: '月' })}
                      </Option>
                      <Option value="3">
                        {formatMessage({ id: 'SafetyConfig.Aperiodic', defaultMessage: '非周期' })}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ marginTop: 10, paddingLeft: 30, paddingRight: 15 }}>
              <Col span={18}>
                <Button
                  icon="plus"
                  type="primary"
                  onClick={newSafetyItem}
                  style={{ marginRight: 15 }}
                >
                  {formatMessage({ id: 'SafetyConfig.NewEntry', defaultMessage: '新建条目' })}
                </Button>
                <Popconfirm
                  title={formatMessage({
                    id: 'COMMON_DELETE_TIP',
                    defaultMessage: '您确定要删除吗？',
                  })}
                  onConfirm={removeBatchItems}
                  onCancel={e => e.stopPropagation()}
                >
                  <Button icon="delete" type="default">
                    {formatMessage({ id: 'COMMON_BATCH_DELETE', defaultMessage: '批量删除' })}
                  </Button>
                </Popconfirm>
              </Col>
              <Col span={6}>
                <Form.Item className={styles.fright}>
                  <Button style={{ width: 80 }} type="primary" htmlType="submit">
                    {formatMessage({ id: 'BTN_SEARCH', defaultMessage: '查询' })}
                  </Button>
                  <Button
                    type="default"
                    style={{ width: 80 }}
                    onClick={this.clearSearchFormInputs}
                    className={styles.ml10}
                  >
                    {formatMessage({ id: 'BTN_RESET', defaultMessage: '重置' })}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <div className={styles.itemListCon}>
          <Table
            className={styles.qryTable}
            columns={columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            pagination={pagination}
            loading={loading}
            rowKey="id"
            onChange={this.getSafetyItemListByPage}
          />
        </div>
      </div>
    );
  }
}
export default SafetyItemList;
