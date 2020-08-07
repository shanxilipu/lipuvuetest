import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import {
  message,
  Button,
  Col,
  Form,
  Row,
  Select,
  Table,
  Modal,
  Input,
  Icon,
  Radio,
  InputNumber,
} from 'antd';
import {
  SCAN_RULE_SCAN_TYPE,
  SCAN_RULE_OPERATION_TYPE,
  SCAN_RULE_MATCH_TYPE,
  // SCAN_RULE_DEFAULT_EXPRESSION,
} from '@/common/const';
import {
  listAllSafeRegexp,
  queryDataColumnByDirId,
} from '@/services/sensitiveManagement/SafeItemService';
import styles from './index.less';

const { Option } = Select;
const { Column } = Table;
const { TextArea, Search } = Input;

const FormItem = Form.Item;

@Form.create()
class ScanRules extends PureComponent {
  // ===================================
  // life cycle
  // ===================================

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      scanRulesVal: '2',
      scanRulesValChange: false,
      scanTypeVal: '',
      matchTypeVal: '',
      matchTypeColomnVal: '',
      operationTypeVal: '',
      defaultExpression: '',
      customExpression: '',
      expressionRadioGroup: '1',
      selectedRowKeys: [],
      selectedRows: [],
      dataSource: [],
      columnDataSource: [],
      pageInfo: {},
      columnSelectedRowKeys: [],
      columnSelectedRows: [],
      isInitTableStatus: true,
      safeRegexpList: [],
    };
  }

  componentDidMount() {
    const { viewDidMountHandler } = this.props;

    if (viewDidMountHandler) {
      viewDidMountHandler('ScanRules', this);
    }

    this.getListAllSafeRegexp();
    this.queryDataColumnByDirId();
  }

  queryDataColumnByDirId = (pageIndex = 1, pageSize = 5, queryCode = '') => {
    const params = {
      pageIndex,
      pageSize,
      queryCode,
    };
    queryDataColumnByDirId(params).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const {
          resultObject: { dataColumnList, pageInfo },
        } = result;
        this.setState({
          columnDataSource: dataColumnList,
          pageInfo,
        });
      }
    });
  };

  getListAllSafeRegexp = () => {
    const params = {};
    listAllSafeRegexp(params).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject } = result;
        this.setState({
          safeRegexpList: resultObject,
        });
      }
    });
  };

  getLevelType = () => {
    const { safeRegexpList } = this.state;
    const arr = safeRegexpList.map((item, index) => {
      return (
        <Option title={item.regexpName} key={index} value={item.regexpCode}>
          {item.regexpName}
        </Option>
      );
    });
    return arr;
  };

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

  findKey = (obj, value, compare = (a, b) => a === b) => {
    return Object.keys(obj).find(k => compare(obj[k], value));
  };

  // ===================================
  // events
  // ===================================

  resetModel = () => {
    this.setState({
      visible: false,
      columnVisible: false,
      scanRulesVal: '2',
      scanRulesValChange: false,
      scanTypeVal: '',
      matchTypeVal: '',
      matchTypeColomnVal: '',
      operationTypeVal: '',
      defaultExpression: '',
      customExpression: '',
      expressionRadioGroup: '1',
      selectedRowKeys: [],
      selectedRows: [],
      dataSource: [],
      isInitTableStatus: true,
    });
  };

  showColumnModal = columnVisible => {
    this.setState({
      columnVisible,
    });
  };

  showModal = visible => {
    if (visible) {
      this.setState({
        matchTypeColomnVal: '',
      });
    }
    this.setState({
      visible,
    });
  };

  columnModalDone = () => {
    const { columnSelectedRows } = this.state;
    const { form } = this.props;
    if (!columnSelectedRows || columnSelectedRows.length === 0) {
      message.error(
        `${formatMessage({
          id: 'SafetyConfig.selectAPieceData',
          defaultMessage: '请选择一条数据',
        })}`
      );
      return;
    }
    const { columnCode } = columnSelectedRows[0];
    form.setFieldsValue({
      matchValue: columnCode,
    });
    this.setState({
      matchTypeColomnVal: columnCode,
    });
    this.showColumnModal(false);
  };

  getSafeRegexpName = defaultExpression => {
    const { safeRegexpList } = this.state;
    const data = safeRegexpList.find(o => o.regexpCode === defaultExpression);
    return data && data.regexpName ? data.regexpName : '';
  };

  getSafeRegexpCode = regexpName => {
    const { safeRegexpList } = this.state;
    const data = safeRegexpList.find(o => o.regexpName === regexpName);
    return data && data.regexpCode ? data.regexpCode : '';
  };

  done = () => {
    const { defaultExpression, customExpression } = this.state;
    const dataList = this.getDataSource();
    const formValue = this.getValue();
    if (!formValue) {
      return;
    }
    if (formValue.inputType === '1') {
      formValue.matchValue = this.getSafeRegexpName(defaultExpression);
    } else if (formValue.inputType === '2') {
      formValue.matchValue = customExpression;
    }
    const newDataInDataSource = {
      serialNumber: dataList.length + 1,
      inputType: formValue.inputType,
      scanType: SCAN_RULE_SCAN_TYPE[formValue.scanType],
      operationType: SCAN_RULE_OPERATION_TYPE[formValue.operationType],
      matchType: SCAN_RULE_MATCH_TYPE[formValue.matchType],
      matchValue: formValue.matchValue,
      scanRate: formValue.scanRate,
      matchRate: formValue.matchRate,
    };
    dataList.push(newDataInDataSource);
    this.setState({
      dataSource: dataList,
    });
    this.showModal(false);
  };

  getSelectedRowKeys = () => {
    const { scanRulesVal, scanRulesValChange } = this.state;
    let relation = scanRulesVal;
    const { editedItem } = this.props;
    const dataSource = this.getDataSource();
    if (!scanRulesValChange && editedItem && editedItem.ruleRelation) {
      relation = editedItem.ruleRelation;
    }
    return {
      dataSource,
      scanRulesVal: relation,
    };
  };

  getDataSource = () => {
    const { dataSource, isInitTableStatus } = this.state;
    const { editedItem } = this.props;
    let dataList = JSON.parse(JSON.stringify(dataSource));
    if (
      isInitTableStatus &&
      dataList.length === 0 &&
      editedItem &&
      editedItem.safeItemScanRuleDtoList &&
      editedItem.safeItemScanRuleDtoList.length > 0
    ) {
      dataList = JSON.parse(JSON.stringify(editedItem.safeItemScanRuleDtoList));
      for (let i = 0; i < dataList.length; i++) {
        dataList[i].serialNumber = i + 1;
        dataList[i].scanType = SCAN_RULE_SCAN_TYPE[dataList[i].scanType];
        dataList[i].operationType = SCAN_RULE_OPERATION_TYPE[dataList[i].operationType];
        dataList[i].matchType =
          dataList[i].inputType === '1'
            ? this.getSafeRegexpName(dataList[i].matchType)
            : dataList[i].inputType === '2'
            ? dataList[i].matchType
            : SCAN_RULE_MATCH_TYPE[dataList[i].matchType];
      }
    }
    return dataList;
  };

  handleDeleteItem = record => {
    const dataList = this.getDataSource();
    const data = dataList.find(o => o.serialNumber === record.serialNumber);
    if (data) {
      const index = dataList.indexOf(data);
      if (index !== -1) {
        dataList.splice(index, 1);
        if (dataList.length > 0) {
          for (let i = 0; i < dataList.length; i++) {
            dataList[i].serialNumber = i + 1;
          }
        }
        this.setState({
          isInitTableStatus: false,
          dataSource: dataList,
        });
      }
    }
  };

  multiDeleteItem = () => {
    const { selectedRows } = this.state;
    const dataList = this.getDataSource();
    if (selectedRows && selectedRows.length === 0) {
      message.error(
        `${formatMessage({
          id: 'SafetyConfig.SelectItemDeletedTip',
          defaultMessage: '请至少选择一条数据进行批量删除',
        })}`
      );
    } else {
      for (let i = 0; i < selectedRows.length; i++) {
        const data = dataList.find(o => o.serialNumber === selectedRows[i].serialNumber);
        if (data) {
          const index = dataList.indexOf(data);
          if (index !== -1) {
            dataList.splice(index, 1);
          }
        }
      }
      if (dataList.length > 0) {
        for (let i = 0; i < dataList.length; i++) {
          dataList[i].serialNumber = i + 1;
        }
      }
      this.setState({
        isInitTableStatus: false,
        dataSource: dataList,
        selectedRowKeys: [],
        selectedRows: [],
      });
    }
  };

  onColumnSelectChange = (columnSelectedRowKeys, columnSelectedRows) => {
    this.setState({ columnSelectedRowKeys, columnSelectedRows });
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    const rows = JSON.parse(JSON.stringify(selectedRows));
    if (rows && rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].inputType === '1') {
          rows[i].matchType = this.getSafeRegexpCode(rows[i].matchType);
        } else if (rows[i].inputType === '2') {
          rows[i].matchType = rows[i].matchType;
        } else {
          rows[i].matchType = this.findKey(SCAN_RULE_MATCH_TYPE, rows[i].matchType);
        }
        rows[i].operationType = this.findKey(SCAN_RULE_OPERATION_TYPE, rows[i].operationType);
        rows[i].scanType = this.findKey(SCAN_RULE_SCAN_TYPE, rows[i].scanType);
      }
    }
    this.setState({ selectedRowKeys, selectedRows });
  };

  handleScanRulesChange = scanRulesVal => {
    this.setState({ scanRulesVal, scanRulesValChange: true });
  };

  handleScanTypeChange = scanTypeVal => {
    this.setState({ scanTypeVal });
  };

  handleMatchTypeChange = matchTypeVal => {
    this.setState({ matchTypeVal });
  };

  handleMatchValueChange = e => {
    const matchTypeColomnVal = e.target.value.trim();
    this.setState({ matchTypeColomnVal });
  };

  handleDefaultExpressionChange = defaultExpression => {
    this.setState({ defaultExpression });
  };

  handleOperationTypeChange = operationTypeVal => {
    this.setState({ operationTypeVal });
  };

  handleCustomExpressionChange = e => {
    const customExpression = e.target.value.trim();
    this.setState({ customExpression });
  };

  handleRadioGroup = e => {
    const expressionRadioGroup = e.target.value;
    this.setState({ expressionRadioGroup });
  };

  getColumnPageChange = page => {
    const { current } = page;
    this.queryDataColumnByDirId(current);
  };

  // ===================================
  // render
  // ===================================

  render() {
    const {
      selectedRowKeys,
      visible,
      columnVisible,
      scanRulesVal,
      scanRulesValChange,
      scanTypeVal,
      matchTypeVal,
      matchTypeColomnVal,
      operationTypeVal,
      defaultExpression,
      customExpression,
      expressionRadioGroup,
      columnDataSource,
      pageInfo,
      columnSelectedRowKeys,
    } = this.state;
    const { form, editable, editedItem } = this.props;
    const { getFieldDecorator } = form;
    const dataList = this.getDataSource();
    let scanRuleRelation = scanRulesVal;
    if (!scanRulesValChange && editedItem && editedItem.ruleRelation) {
      scanRuleRelation = editedItem.ruleRelation;
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: () => ({ disabled: !editable }),
    };
    const pagination = {
      total: pageInfo.total,
      pageSize: pageInfo.pageSize,
      current: pageInfo.pageIndex,
    };
    const columnSelection = {
      type: 'radio',
      columnSelectedRowKeys,
      onChange: this.onColumnSelectChange,
      getCheckboxProps: () => ({ disabled: !editable }),
    };
    const footer = () => {
      return (
        <div>
          <span>
            {formatMessage({ id: 'SELECTED', defaultMessage: '已选中' })}
            {selectedRowKeys.length}/{dataList.length}
            {formatMessage({ id: 'ITEMS', defaultMessage: '个' })}
          </span>
          <Button
            type="default"
            className={styles.ml10}
            disabled={!editable}
            onClick={this.multiDeleteItem}
          >
            {formatMessage({ id: 'COMMON_BATCH_DELETE', defaultMessage: '批量删除' })}
          </Button>
          <Button
            type="primary"
            className={styles.ml10}
            disabled={!editable}
            ghost
            onClick={() => this.showModal(true)}
          >
            {formatMessage({ id: 'SafetyConfig.AddObject', defaultMessage: '新增对象' })}
          </Button>
        </div>
      );
    };
    const formItemLayout = {
      labelCol: {
        sm: { span: 7 },
      },
      wrapperCol: {
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <Row>
          <Col span={7}>
            <FormItem
              {...formItemLayout}
              label={formatMessage({
                id: 'SafetyConfig.RuleRelationship',
                defaultMessage: '规则关系',
              })}
            >
              <Select
                placeholder={formatMessage({ id: 'COMMON_SELECT_ICON', defaultMessage: '请选择' })}
                disabled={!editable}
                value={scanRuleRelation}
                onChange={this.handleScanRulesChange}
              >
                <Option key="1" value="1">
                  {formatMessage({ id: 'SafetyConfig.Or', defaultMessage: '或者' })}
                </Option>
                <Option key="2" value="2">
                  {formatMessage({ id: 'SafetyConfig.And', defaultMessage: '并且' })}
                </Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Table
          rowKey="serialNumber"
          dataSource={dataList}
          rowSelection={rowSelection}
          pagination={false}
          footer={footer}
        >
          <Column
            title={formatMessage({ id: 'SafetyConfig.SerialNumber', defaultMessage: '序号' })}
            dataIndex="serialNumber"
            key="serialNumber"
          />
          <Column
            title={formatMessage({ id: 'SafetyConfig.ScanContent', defaultMessage: '扫描内容' })}
            dataIndex="scanType"
            key="scanType"
          />
          <Column
            title={formatMessage({ id: 'SafetyConfig.Operator', defaultMessage: '运算符' })}
            dataIndex="operationType"
            key="operationType"
          />
          <Column
            title={formatMessage({ id: 'SafetyConfig.MatchType', defaultMessage: '匹配类型' })}
            dataIndex="matchType"
            key="matchType"
          />
          <Column
            title={formatMessage({ id: 'SafetyConfig.MatchValue', defaultMessage: '匹配取值' })}
            dataIndex="matchValue"
            key="matchValue"
          />
          <Column
            title={`${formatMessage({
              id: 'SafetyConfig.ScanRatio',
              defaultMessage: '扫描比例',
            })}(%)`}
            dataIndex="scanRate"
            key="scanRate"
          />
          <Column
            title={`${formatMessage({
              id: 'SafetyConfig.MeetRatio',
              defaultMessage: '满足比例',
            })}(%)`}
            dataIndex="matchRate"
            key="matchRate"
          />
          <Column
            title={formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}
            dataIndex="opts"
            key="opts"
            render={(text, record) => (
              <span>
                <a onClick={() => this.handleDeleteItem(record)} disabled={!editable}>
                  {formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
                </a>
              </span>
            )}
          />
        </Table>

        <Modal
          width={800}
          title={formatMessage({ id: 'SafetyConfig.SelectObject', defaultMessage: '选择对象' })}
          visible={visible}
          destroyOnClose={true}
          onCancel={() => this.showModal(false)}
          onOk={this.done}
        >
          <Form>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({
                id: 'SafetyConfig.ScanContent',
                defaultMessage: '扫描内容',
              })}:`}
            >
              {getFieldDecorator('scanType', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.ScanContentTip',
                      defaultMessage: '请选择扫描内容',
                    })}`,
                  },
                ],
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  style={{ width: '88%' }}
                  onChange={this.handleScanTypeChange}
                >
                  <Option key="1" value="1">
                    {formatMessage({ id: 'SafetyConfig.FieldComment', defaultMessage: '字段注释' })}
                  </Option>
                  <Option key="2" value="2">
                    {formatMessage({
                      id: 'SafetyConfig.FieldInstance',
                      defaultMessage: '字段实例',
                    })}
                  </Option>
                  <Option key="3" value="3">
                    {formatMessage({ id: 'FieldInquire.FieldCode', defaultMessage: '字段编码' })}
                  </Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'SafetyConfig.Operator', defaultMessage: '运算符' })}:`}
            >
              {getFieldDecorator('operationType', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.OperatorTip',
                      defaultMessage: '请选择运算符',
                    })}`,
                  },
                ],
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  style={{ width: '88%' }}
                  onChange={this.handleOperationTypeChange}
                >
                  <Option key="1" value="1">
                    {formatMessage({ id: 'SafetyConfig.Contain', defaultMessage: '包含' })}
                  </Option>
                  <Option key="2" value="2">
                    {formatMessage({ id: 'SafetyConfig.NotIncluded', defaultMessage: '不包含' })}
                  </Option>
                  <Option key="3" value="3">
                    {formatMessage({ id: 'SafetyConfig.Equal', defaultMessage: '等于' })}
                  </Option>
                  <Option key="4" value="4">
                    {formatMessage({ id: 'SafetyConfig.NotEqual', defaultMessage: '不等于' })}
                  </Option>
                  <Option key="5" value="5" disabled={scanTypeVal !== '2'}>
                    {formatMessage({ id: 'SafetyConfig.Conform', defaultMessage: '符合' })}
                  </Option>
                  <Option key="6" value="6" disabled={scanTypeVal !== '2'}>
                    {formatMessage({ id: 'SafetyConfig.DoNotConform', defaultMessage: '不符合' })}
                  </Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({
                id: 'SafetyConfig.MatchType',
                defaultMessage: '匹配类型',
              })}:`}
            >
              {getFieldDecorator('matchType', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'SafetyConfig.MatchTypeTip',
                      defaultMessage: '请选择匹配类型',
                    })}`,
                  },
                ],
              })(
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  style={{ width: '88%' }}
                  onChange={this.handleMatchTypeChange}
                >
                  <Option
                    key="1"
                    value="1"
                    disabled={operationTypeVal === '5' || operationTypeVal === '6'}
                  >
                    {formatMessage({ id: 'SafetyConfig.String', defaultMessage: '字符串' })}
                  </Option>
                  <Option
                    key="2"
                    value="2"
                    disabled={
                      operationTypeVal === '1' ||
                      operationTypeVal === '2' ||
                      operationTypeVal === '3' ||
                      operationTypeVal === '4'
                    }
                  >
                    {formatMessage({
                      id: 'SafetyConfig.RegularExpression',
                      defaultMessage: '正则表达式',
                    })}
                  </Option>
                  <Option
                    key="3"
                    value="3"
                    disabled={!(operationTypeVal === '3' || operationTypeVal === '4')}
                  >
                    {formatMessage({ id: 'SafetyConfig.Numerical', defaultMessage: '数值' })}
                  </Option>
                </Select>
              )}
            </Form.Item>
            {matchTypeVal !== '2' ? (
              <Form.Item
                colon={false}
                {...formItemLayout}
                label={`${formatMessage({
                  id: 'SafetyConfig.MatchValue',
                  defaultMessage: '匹配取值',
                })}:`}
              >
                {getFieldDecorator('matchValue', {
                  rules: [
                    {
                      required: true,
                      message: `${formatMessage({
                        id: 'SafetyConfig.MatchValueTip',
                        defaultMessage: '请选择匹配取值',
                      })}`,
                    },
                  ],
                })(
                  <div>
                    {scanTypeVal === '3' &&
                    (operationTypeVal === '3' ||
                      operationTypeVal === '4' ||
                      operationTypeVal === '1' ||
                      operationTypeVal === '2') &&
                    matchTypeVal === '1' ? (
                      <div>
                        {/* <Icon type="info-circle" style={{ marginRight: 5 }} /><Input placeholder="请输入" style={{ width: '80%', marginRight: 5 }} /><Icon type="setting" /> */}
                        <Input
                          placeholder={formatMessage({
                            id: 'COMMON_ENTER_TIP',
                            defaultMessage: '请输入',
                          })}
                          style={{ width: '83%', marginRight: 5 }}
                          value={matchTypeColomnVal}
                          onChange={this.handleMatchValueChange}
                        />
                        <Icon type="setting" onClick={() => this.showColumnModal(true)} />
                      </div>
                    ) : null}
                    {(operationTypeVal === '3' ||
                      operationTypeVal === '4' ||
                      operationTypeVal === '1' ||
                      operationTypeVal === '2') &&
                    matchTypeVal === '1' &&
                    (scanTypeVal === '1' || scanTypeVal === '2') ? (
                      <Input
                        placeholder={formatMessage({
                          id: 'COMMON_ENTER_TIP',
                          defaultMessage: '请输入',
                        })}
                        style={{ width: '88%' }}
                      />
                    ) : null}
                    {scanTypeVal === '3' &&
                    (operationTypeVal === '3' || operationTypeVal === '4') &&
                    matchTypeVal === '3' ? (
                      <InputNumber
                        placeholder={formatMessage({
                          id: 'COMMON_ENTER_TIP',
                          defaultMessage: '请输入',
                        })}
                        style={{ width: '88%' }}
                        precision={0}
                      />
                    ) : null}
                    {(scanTypeVal === '1' || scanTypeVal === '2') &&
                    (operationTypeVal === '3' || operationTypeVal === '4') &&
                    matchTypeVal === '3' ? (
                      <InputNumber
                        placeholder={formatMessage({
                          id: 'COMMON_ENTER_TIP',
                          defaultMessage: '请输入',
                        })}
                        style={{ width: '88%' }}
                      />
                    ) : null}
                  </div>
                )}
              </Form.Item>
            ) : (
              <Form.Item
                colon={false}
                {...formItemLayout}
                label={`${formatMessage({
                  id: 'SafetyConfig.MatchValue',
                  defaultMessage: '匹配取值',
                })}:`}
              >
                {getFieldDecorator('inputType', {
                  rules: [
                    {
                      required: true,
                      message: `${formatMessage({
                        id: 'COMMON_SELECT_ICON',
                        defaultMessage: '请选择',
                      })}`,
                    },
                  ],
                  initialValue: '1',
                })(
                  <Radio.Group style={{ width: '100%' }} onChange={this.handleRadioGroup}>
                    <Row>
                      <Col span={24}>
                        <Radio value="1">
                          {formatMessage({
                            id: 'SafetyConfig.DefaultRegularExpression',
                            defaultMessage: '默认的正则表达式',
                          })}
                        </Radio>
                        <Icon type="info-circle" style={{ marginRight: 5 }} />
                        <Select
                          disabled={expressionRadioGroup === '2'}
                          placeholder={formatMessage({
                            id: 'COMMON_SELECT_ICON',
                            defaultMessage: '请选择',
                          })}
                          style={{ width: 200 }}
                          value={defaultExpression}
                          onChange={this.handleDefaultExpressionChange}
                        >
                          {this.getLevelType()}
                        </Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Radio value="2">
                          {formatMessage({
                            id: 'SafetyConfig.CustomRegularExpression',
                            defaultMessage: '自定义正则表达式',
                          })}
                        </Radio>
                        <Icon type="info-circle" style={{ marginRight: 5 }} />
                        <TextArea
                          disabled={expressionRadioGroup === '1'}
                          placeholder={formatMessage({
                            id: 'SafetyConfig.PleaseEnterAnExpression',
                            defaultMessage: '请输入表达式',
                          })}
                          style={{ width: 200 }}
                          value={customExpression}
                          onChange={this.handleCustomExpressionChange}
                        />
                      </Col>
                    </Row>
                  </Radio.Group>
                )}
              </Form.Item>
            )}
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({
                id: 'SafetyConfig.ScanRatio',
                defaultMessage: '扫描比例',
              })}(%):`}
            >
              {getFieldDecorator('scanRate', {
                rules: [
                  {
                    required: scanTypeVal === '2',
                    message: `${formatMessage({
                      id: 'SafetyConfig.ScanRatioTip',
                      defaultMessage: '请输入扫描比例',
                    })}`,
                  },
                ],
              })(
                <InputNumber
                  disabled={scanTypeVal !== '2'}
                  min={1}
                  max={100}
                  precision={0}
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                  style={{ width: '30%' }}
                />
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({
                id: 'SafetyConfig.MeetRatio',
                defaultMessage: '满足比例',
              })}(%):`}
            >
              {getFieldDecorator('matchRate', {
                rules: [
                  {
                    required: scanTypeVal === '2',
                    message: `${formatMessage({
                      id: 'SafetyConfig.MeetRatioTip',
                      defaultMessage: '请输入满足比例',
                    })}`,
                  },
                ],
              })(
                <InputNumber
                  disabled={scanTypeVal !== '2'}
                  min={0.1}
                  max={100}
                  precision={1}
                  step={0.1}
                  placeholder={formatMessage({ id: 'COMMON_ENTER_TIP', defaultMessage: '请输入' })}
                  style={{ width: '30%' }}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          width={800}
          title={formatMessage({
            id: 'SafetyConfig.FieldCodeSelection',
            defaultMessage: '字段编码选择',
          })}
          visible={columnVisible}
          destroyOnClose={true}
          onCancel={() => this.showColumnModal(false)}
          onOk={this.columnModalDone}
        >
          <div className={styles.leftCon}>
            <div className={styles.searchCon}>
              <Search
                placeholder={formatMessage({
                  id: 'FieldDefinition.FieldCodeTip',
                  defaultMessage: '请输入字段编码',
                })}
                onSearch={value => {
                  const queryCode = value.trim();
                  this.queryDataColumnByDirId(1, pageInfo.pageSize, queryCode);
                }}
              />
            </div>
            <div className={styles.tableOutCon}>
              <Table
                rowKey="uuid"
                checkable
                dataSource={columnDataSource}
                rowSelection={columnSelection}
                pagination={pagination}
                onChange={this.getColumnPageChange}
              >
                <Column
                  title={formatMessage({
                    id: 'FieldInquire.FieldCode',
                    defaultMessage: '字段编码',
                  })}
                  dataIndex="columnCode"
                  key="columnCode"
                />
                <Column
                  title={formatMessage({
                    id: 'SafetyConfig.ChineseName',
                    defaultMessage: '中文名称',
                  })}
                  dataIndex="columnCnName"
                  key="columnCnName"
                />
                <Column
                  title={formatMessage({
                    id: 'SafetyConfig.EnglishName',
                    defaultMessage: '英文名称',
                  })}
                  dataIndex="columnEnName"
                  key="columnEnName"
                />
                <Column
                  title={formatMessage({
                    id: 'SafetyConfig.FieldClassification',
                    defaultMessage: '字段分类',
                  })}
                  dataIndex="columnType"
                  key="columnType"
                />
                <Column
                  title={formatMessage({
                    id: 'SafetyConfig.IsItEffective',
                    defaultMessage: '是否有效',
                  })}
                  dataIndex="statusCd"
                  key="statusCd"
                  render={val => {
                    let text = '-';
                    if (val === '00A' || val === '1') {
                      text = formatMessage({ id: 'COMMON_Effective', defaultMessage: '有效' });
                    } else {
                      text = formatMessage({ id: 'COMMON_Ineffective', defaultMessage: '无效' });
                    }
                    return text;
                  }}
                />
              </Table>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
export default ScanRules;
