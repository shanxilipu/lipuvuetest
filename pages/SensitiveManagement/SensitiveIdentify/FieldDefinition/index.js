import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Row, Col, Steps, Input, Form, Switch, Select, Button, Table, message } from 'antd';
import DataSourceTree from '@/pages/AuditManagement/components/dataSourceTree';
import styles from './index.less';

const { Step } = Steps;
const { Search } = Input;
const { Option } = Select;

class FieldDefinition extends Component {
  constructor(props) {
    super(props);
    const {
      fieldDefinition: { tableDatasource = [] },
    } = props;
    this.state = {
      treeSelectedKeys: [],
      treeSelectedObj: {},
      tableFieldCodeSearchText: '',
      tableDatasource: JSON.parse(JSON.stringify(tableDatasource)),
    };

    const { dispatch } = props;
    // 获取敏感级别,脱敏措施
    dispatch({
      type: 'fieldDefinition/qryDictionary',
    });

    // 绑定this
    Object.keys(this.handles).forEach(fun => {
      this.handles[fun] = this.handles[fun].bind(this);
    }, this);
  }

  config = () => {
    const {
      fieldDefinition: { senseLevels, senseMeasures },
    } = this.props;
    const { handleTableCellEdit } = this.handles;
    return {
      columns: [
        {
          title: `${formatMessage({ id: 'FieldInquire.FieldCode', defaultMessage: '字段编码' })}`,
          dataIndex: 'fieldCode',
          key: 'fieldCode',
        },
        {
          title: `${formatMessage({
            id: 'FieldDefinition.EnableDesensitization',
            defaultMessage: '启用脱敏',
          })}`,
          dataIndex: 'state',
          key: 'state',
          width: 150,
          render: (val, record) => {
            return (
              <Switch
                checked={val === '1'}
                onChange={v => handleTableCellEdit(record, 'state', v ? '1' : '2')}
              />
            );
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.SensitivityLevel',
            defaultMessage: '敏感级别',
          })}`,
          dataIndex: 'levelId',
          key: 'levelId',
          width: 150,
          render: (val, record) => {
            let value = '';
            if (`${val}` !== '-1' && !!val) {
              value = val;
            }
            return (
              <Select
                style={{ width: 90 }}
                value={value}
                allowClear
                onChange={v => handleTableCellEdit(record, 'levelId', v)}
              >
                {senseLevels.map(o => (
                  <Option value={o.id} title={o.name}>
                    {o.name}
                  </Option>
                ))}
              </Select>
            );
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.DesensitizationMeasures',
            defaultMessage: '脱敏措施',
          })}`,
          dataIndex: 'desensitizeId',
          key: 'desensitizeId',
          width: 150,
          render: (val, record) => {
            let value = '';
            if (`${val}` !== '-1' && !!val) {
              value = val;
            }
            return (
              <Select
                style={{ width: 100 }}
                value={value}
                allowClear
                onChange={v => handleTableCellEdit(record, 'desensitizeId', v)}
              >
                {senseMeasures.map(o => (
                  <Option value={o.id} title={o.name}>
                    {o.name}
                  </Option>
                ))}
              </Select>
            );
          },
        },
      ],
    };
  };

  handles = {
    handleTreeSelect: (selectedKeys, e) => {
      const { selected = true } = e || {};
      if (!selected) {
        return false;
      }
      this.setState({ treeSelectedKeys: selectedKeys });
      const { tableFieldCodeSearchText } = this.state;
      // debugger;
      if (selectedKeys.length === 0) {
        this.setState({ tableDatasource: [], treeSelectedObj: {} });
        return;
      }
      // const keys = selectedKeys[0].split('_');
      // if (keys.length !== 3) {
      //   this.setState({ tableDatasource: [], treeSelectedObj: {} });
      //   return;
      // }
      const {
        node: { props = {} },
      } = e;
      const { dataRef } = props;
      const { datasourceId, tableId, treeIndex } = dataRef;
      if (treeIndex !== '2') {
        this.setState({ tableDatasource: [], treeSelectedObj: {} });
        return;
      }
      this.setState({ treeSelectedObj: dataRef });
      const { dispatch } = this.props;
      dispatch({
        type: 'fieldDefinition/getTableSensitiveFieldList',
        payload: {
          datasourceId,
          tableId,
          fieldCode: tableFieldCodeSearchText,
        },
      });
    },

    handleTableSearchField: () => {
      const { treeSelectedKeys, treeSelectedObj, tableFieldCodeSearchText } = this.state;
      // debugger;
      if (treeSelectedKeys.length === 0) {
        this.setState({ tableDatasource: [], treeSelectedObj: {} });
        return;
      }
      // const keys = treeSelectedKeys[0].split('_');
      // if (keys.length !== 3) {
      //   this.setState({ tableDatasource: [], treeSelectedObj: {} });
      //   return;
      // }
      const { datasourceId, tableId, treeIndex } = treeSelectedObj;
      if (treeIndex !== '2') {
        this.setState({ tableDatasource: [], treeSelectedObj: {} });
        return;
      }
      const { dispatch } = this.props;
      dispatch({
        type: 'fieldDefinition/getTableSensitiveFieldList',
        payload: {
          datasourceId,
          tableId,
          fieldCode: tableFieldCodeSearchText,
        },
      });
    },

    handleTableCellEdit: (record, key, val) => {
      const { tableDatasource } = this.state;
      const {
        fieldDefinition: { senseLevels, senseMeasures },
      } = this.props;
      const alterObj = tableDatasource.filter(o => o.fieldCode === record.fieldCode)[0];
      if (key !== 'state' && alterObj.state === '1' && !val) {
        message.error(
          `${formatMessage({
            id: 'FieldDefinition.EnableDesensitizationTip',
            defaultMessage: '启用脱敏时，该选项为必填项!',
          })}`
        );
        return;
      }
      alterObj[key] = val;
      if (key === 'state' && val === '1') {
        if (!alterObj.levelId && `${alterObj.levelId}` !== '0') {
          alterObj.levelId = senseLevels[0] && senseLevels[0].id;
        }
        if (!alterObj.desensitizeId && `${alterObj.desensitizeId}` !== '0') {
          alterObj.desensitizeId = senseMeasures[0] && senseMeasures[0].id;
        }
      }
      this.setState({ tableDatasource });
    },

    handleCancle: () => {
      const {
        fieldDefinition: { tableDatasource },
      } = this.props;
      this.setState({ tableDatasource: JSON.parse(JSON.stringify(tableDatasource)) });
    },

    handleSubmit: () => {
      const { dispatch } = this.props;
      const { tableDatasource, treeSelectedObj } = this.state;
      const { datasourceId, tableId: dataobjectId, treeIndex } = treeSelectedObj;
      if (treeIndex !== '2') {
        message.error(
          `${formatMessage({
            id: 'FieldDefinition.PleaseSelectTable',
            defaultMessage: '请选择表!',
          })}`
        );
        return;
      }
      tableDatasource.forEach(o => {
        if (o.state === undefined) {
          o.state = '2';
        }
        // if ((!o.datasourceId && `${o.datasourceId}` !== '0') || o.datasourceId === undefined) {  // 后端要求取消这个判断
        o.datasourceId = datasourceId;
        o.dataobjectId = dataobjectId;
        // }
        // if (!o.levelId && `${o.levelId}` !== '0') {
        //   // 后端要求，没选的话传-1
        //   o.levelId = -1;
        // }
        // if (!o.desensitizeId && `${o.desensitizeId}` !== '0') {
        //   // 后端要求，没选的话传-1
        //   o.desensitizeId = -1;
        // }
        if (`${o.levelId}` === '-1') {
          // 去除前面传-1造成的影响
          delete o.levelId;
        }
        if (`${o.desensitizeId}` === '-1') {
          delete o.desensitizeId;
        }
      });
      dispatch({
        type: 'fieldDefinition/saveOrUpdateSensitiveField',
        payload: tableDatasource,
      }).then(() => {
        const { tableFieldCodeSearchText } = this.state;
        dispatch({
          type: 'fieldDefinition/getTableSensitiveFieldList',
          payload: {
            datasourceId,
            tableId: dataobjectId,
            fieldCode: tableFieldCodeSearchText,
          },
        });
      });
    },
  };

  componentWillReceiveProps(nextProps) {
    const {
      fieldDefinition: { tableDatasource },
    } = this.props;
    const {
      fieldDefinition: { tableDatasource: newTableDs },
    } = nextProps;
    if (tableDatasource !== newTableDs) {
      this.setState({ tableDatasource: JSON.parse(JSON.stringify(newTableDs)) });
    }
  }

  render() {
    const {
      treeSelectedKeys,
      treeSelectedObj,
      tableDatasource,
      tableFieldCodeSearchText,
    } = this.state;
    const { handleTableSearchField, handleTreeSelect, handleCancle, handleSubmit } = this.handles;
    const config = this.config();
    return (
      <div className={styles.view}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Row type="flex" justify="center">
              <Col span={12}>
                <Steps current={Object.keys(treeSelectedObj).length !== 0 ? 1 : 0}>
                  <Step />
                  <Step />
                </Steps>
              </Col>
            </Row>
          </div>
          <div className={styles.tabs}>
            <div className={styles.datasourceCon}>
              <span className={styles.require}>
                {formatMessage({
                  id: 'FieldDefinition.desensitizedObject',
                  defaultMessage: '请选择脱敏对象',
                })}
              </span>
              <DataSourceTree
                style={{ padding: '0 10px' }}
                selectedKeys={treeSelectedKeys}
                checkable={false}
                onSelect={handleTreeSelect}
                getTable={true}
                getView={true}
                showSearch={true}
                showLoading={true}
              />
            </div>
            <div className={styles.tableCon}>
              <span className={styles.require}>
                {formatMessage({
                  id: 'FieldDefinition.DesensitizationField',
                  defaultMessage: '请选择脱敏字段',
                })}
              </span>
              <div style={{ margin: '0 0 8px', padding: '0 10px' }}>
                {formatMessage({
                  id: 'FieldDefinition.SelectedObjects',
                  defaultMessage: '已选择对象',
                })}
                ：{treeSelectedObj.title}
              </div>
              <div className={styles.selectedOperatorCon}>
                <div className={styles.searchCon}>
                  <Search
                    placeholder={formatMessage({
                      id: 'FieldDefinition.FieldCodeTip',
                      defaultMessage: '请输入字段编码',
                    })}
                    value={tableFieldCodeSearchText}
                    onChange={e => {
                      this.setState({ tableFieldCodeSearchText: e.target.value });
                    }}
                    onSearch={handleTableSearchField}
                  />
                </div>
                <div style={{ marginLeft: '20px' }}>
                  <Button onClick={handleCancle}>
                    {formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
                  </Button>
                  <Button style={{ margin: '0 0 0 20px' }} type="primary" onClick={handleSubmit}>
                    {formatMessage({ id: 'COMMON_SAVE', defaultMessage: '保存' })}
                  </Button>
                </div>
              </div>
              <div className={styles.ra}>
                <Table
                  columns={config.columns}
                  dataSource={tableDatasource}
                  pagination={false}
                  rowKey="fieldCode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Form.create()(
  connect(({ fieldDefinition }) => ({
    fieldDefinition,
  }))(FieldDefinition)
);
