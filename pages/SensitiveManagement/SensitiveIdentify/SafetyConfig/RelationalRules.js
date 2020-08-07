import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Col, Form, Row, Select, Table, Modal, Input, message } from 'antd';
import { listSafeDatabaseFunctionList } from '@/services/sensitiveManagement/SafeItemService';
import styles from './index.less';

const { Option } = Select;
const { Column } = Table;
const { Search } = Input;

const FormItem = Form.Item;

@Form.create()
class RelationalRules extends PureComponent {
  // ===================================
  // life cycle
  // ===================================

  constructor(props) {
    super(props);
    this.state = {
      linkageRecognizeVal: '1',
      linkageRecognizeValChange: false,
      dataSource: [],
      functionDataSource: [],
      pageInfo: {},
      selectedRowKeys: [],
      selectedRows: [],
      functionSelectedRowKeys: [],
      functionSelectedRows: [],
      isInitTableStatus: true,
    };
    this.functionParams = {
      // functionName: '',
      pageIndex: '1',
      pageSize: '999',
    };
  }

  componentDidMount() {
    const { viewDidMountHandler } = this.props;

    if (viewDidMountHandler) {
      viewDidMountHandler('RelationalRules', this);
    }

    this.getListSafeDatabaseFunctionList();
  }

  // ===================================
  // events
  // ===================================

  resetModel = () => {
    this.setState({
      linkageRecognizeVal: '1',
      linkageRecognizeValChange: false,
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      // functionSelectedRowKeys: [],
      // functionSelectedRows: [],
      isInitTableStatus: true,
    });
  };

  getListSafeDatabaseFunctionList = () => {
    listSafeDatabaseFunctionList(this.functionParams).then(result => {
      const {
        resultCode,
        resultMsg,
        resultObject: { pageInfo, rows },
      } = result;
      if (resultCode === '0') {
        this.setState({
          functionDataSource: rows,
          pageInfo,
        });
      } else {
        message.error(resultMsg);
      }
    });
  };

  getSelectedRowKeys = () => {
    const { linkageRecognizeVal } = this.state;
    const dataSource = this.getDataSource();
    return {
      dataSource,
      linkageRecognizeVal,
    };
  };

  handleLinkageRecognize = linkageRecognizeVal => {
    this.setState({ linkageRecognizeVal, linkageRecognizeValChange: true });
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  };

  onFunctionSelectChange = (functionSelectedRowKeys, functionSelectedRows) => {
    this.setState({ functionSelectedRowKeys, functionSelectedRows });
  };

  showModal = visible => {
    this.setState({
      visible,
    });
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

  getDataSource = () => {
    const { dataSource, isInitTableStatus } = this.state;
    const { editedItem } = this.props;
    let dataList = JSON.parse(JSON.stringify(dataSource));
    if (
      isInitTableStatus &&
      dataList.length === 0 &&
      editedItem &&
      editedItem.safeItemLinkageRuleList &&
      editedItem.safeItemLinkageRuleList.length > 0
    ) {
      dataList = JSON.parse(JSON.stringify(editedItem.safeItemLinkageRuleList));
      for (let i = 0; i < dataList.length; i++) {
        dataList[i].serialNumber = i + 1;
        dataList[i].functionName = dataList[i].eliminateFunction;
        dataList[i].functionDescribe = dataList[i].functionDescription;
      }
    }
    return dataList;
  };

  handleOk = () => {
    this.showModal(false);
    const { functionSelectedRows } = this.state;
    const dataList = this.getDataSource();
    if (functionSelectedRows && functionSelectedRows.length > 0) {
      functionSelectedRows.forEach(item => {
        let b = false;
        const newDataInDataSource = {
          serialNumber: dataList.length + 1,
          id: item.id,
          functionName: item.functionName,
          functionDescribe: item.functionDescribe,
          userLevel: item.userLevel,
          comAcctId: item.comAcctId,
        };
        if (dataList && dataList.length > 0) {
          dataList.forEach(o => {
            if (o.functionName === item.functionName) {
              b = true;
              message.error(
                `${formatMessage({ id: 'SafetyConfig.FunctionName', defaultMessage: '函数名' })}${
                  item.functionName
                }${formatMessage({ id: 'SafetyConfig.AlreadyExists', defaultMessage: '已经存在' })}`
              );
            }
          });
          if (!b) {
            dataList.push(newDataInDataSource);
          }
        } else {
          dataList.push(newDataInDataSource);
        }
      });
    }
    this.setState({
      dataSource: dataList,
    });
  };

  getFunctionDataSourceByPage = page => {
    const { current } = page;
    this.setState({
      pageInfo: {
        pageIndex: current,
      },
    });
  };

  // ===================================
  // render
  // ===================================

  render() {
    const {
      selectedRowKeys,
      functionSelectedRowKeys,
      visible,
      functionDataSource,
      pageInfo,
      linkageRecognizeVal,
      linkageRecognizeValChange,
    } = this.state;
    const { editable, editedItem } = this.props;
    const dataList = this.getDataSource();
    let linkageRecognizeValue = linkageRecognizeVal;
    if (!linkageRecognizeValChange && editedItem && editedItem.isLinkage) {
      linkageRecognizeValue = editedItem.isLinkage;
    }
    const pagination = {
      total: pageInfo.total,
      pageSize: 5,
      current: pageInfo.pageIndex,
    };
    console.info(functionSelectedRowKeys);
    const functionRowSelection = {
      functionSelectedRowKeys,
      onChange: this.onFunctionSelectChange,
      getCheckboxProps: () => ({ disabled: !editable }),
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
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
            ghost
            disabled={!editable}
            onClick={() => this.showModal(true)}
          >
            {formatMessage({ id: 'SafetyConfig.AddObject', defaultMessage: '新增对象' })}
          </Button>
        </div>
      );
    };
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
      },
      wrapperCol: {
        sm: { span: 15 },
      },
    };

    return (
      <div>
        <Form>
          <Row>
            <Col span={7}>
              <FormItem
                {...formItemLayout}
                label={formatMessage({
                  id: 'SafetyConfig.KinshipRecognition',
                  defaultMessage: '血缘联动识别',
                })}
              >
                <Select
                  placeholder={formatMessage({
                    id: 'COMMON_SELECT_ICON',
                    defaultMessage: '请选择',
                  })}
                  disabled={!editable}
                  value={linkageRecognizeValue}
                  onChange={this.handleLinkageRecognize}
                >
                  <Option value="1">
                    {formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}
                  </Option>
                  <Option value="2">
                    {formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}
                  </Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Form>
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
            title={formatMessage({ id: 'SafetyConfig.DeleteFunction', defaultMessage: '删除函数' })}
            dataIndex="functionName"
            key="functionName"
          />
          <Column
            title={formatMessage({
              id: 'SafetyConfig.FunctionDescription',
              defaultMessage: '函数说明',
            })}
            dataIndex="functionDescribe"
            key="functionDescribe"
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
          title={formatMessage({ id: 'SafetyConfig.SelectObject', defaultMessage: '选择对象' })}
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => {
            this.showModal(false);
          }}
          width={800}
          bodyStyle={{ padding: '0' }}
        >
          <div className={styles.leftCon}>
            <div className={styles.searchCon}>
              <Search
                placeholder={formatMessage({
                  id: 'SafetyConfig.FunctionNameTip',
                  defaultMessage: '请输入函数名称',
                })}
                onSearch={value => {
                  this.functionParams.functionName = value;
                  this.getListSafeDatabaseFunctionList();
                }}
              />
            </div>
            <div className={styles.tableOutCon}>
              <Table
                rowKey="id"
                dataSource={functionDataSource}
                rowSelection={functionRowSelection}
                pagination={pagination}
                onChange={this.getFunctionDataSourceByPage}
              >
                <Column
                  title={formatMessage({
                    id: 'SafetyConfig.FunctionName',
                    defaultMessage: '函数名称',
                  })}
                  dataIndex="functionName"
                  key="functionName"
                />
                <Column
                  title={formatMessage({
                    id: 'SafetyConfig.FunctionDescription',
                    defaultMessage: '函数说明',
                  })}
                  dataIndex="functionDescribe"
                  key="functionDescribe"
                />
              </Table>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
export default RelationalRules;
