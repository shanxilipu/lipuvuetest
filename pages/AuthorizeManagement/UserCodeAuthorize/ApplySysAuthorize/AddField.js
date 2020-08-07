import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Switch, Select, Table, message, Input } from 'antd';
import Modal from '@/components/Modal';
import DataSourceTree from '@/pages/AuditManagement/components/dataSourceTree';
import { defaultHandleResponse } from '@/utils/utils';
import styles from './add.less';

const { Option } = Select;

@connect(({ applySysAuthorize, loading }) => ({
  applySysAuthorize,
  confirmLoading: loading.effects['applySysAuthorize/saveSafeAppUserFieldAuth'],
}))
class AddTable extends Component {
  state = {
    checkedKeys: [],
    tableLoading: false,
  };

  code = '';

  componentDidMount() {
    const { dispatch, isEdit, nodeRow = {} } = this.props;
    if (isEdit) {
      this.handleTreeSelect([nodeRow.dataobjectId]);
    }
    // 获取敏感级别,脱敏措施
    dispatch({
      type: 'applySysAuthorize/qrySpecialDictionary',
    });
  }

  config = () => {
    const {
      applySysAuthorize: { senseLevels, senseMeasures },
    } = this.props;
    const { handleTableCellEdit } = this.handles;
    return {
      columns: [
        {
          title: `${formatMessage({
            id: 'ApplySysAuthorize.FieldCode',
            defaultMessage: '字段编码',
          })}`,
          dataIndex: 'fieldCode',
          key: 'fieldCode',
          render: text => (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>
          ),
        },
        {
          title: `${formatMessage({
            id: 'ApplySysAuthorize.EnableDesensitization',
            defaultMessage: '启用脱敏',
          })}`,
          dataIndex: 'state',
          key: 'state',
          width: 90,
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
            id: 'ApplySysAuthorize.SensitivityLevel',
            defaultMessage: '敏感级别',
          })}`,
          dataIndex: 'levelId',
          key: 'levelId',
          width: 120,
          render: (val, record) => {
            return (
              <Select
                style={{ width: 90 }}
                value={val}
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
            id: 'ApplySysAuthorize.DesensitizationMeasures',
            defaultMessage: '脱敏措施',
          })}`,
          dataIndex: 'desensitizeId',
          key: 'desensitizeId',
          width: 130,
          render: (val, record) => {
            return (
              <Select
                style={{ width: 100 }}
                value={val}
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
    handleTableCellEdit: (record, key, val) => {
      const { tableDatasource } = this.state;
      const {
        applySysAuthorize: { senseLevels, senseMeasures },
      } = this.props;
      const alterObj = tableDatasource.filter(o => o.fieldCode === record.fieldCode)[0];
      if (key !== 'state' && alterObj.state === '1' && !val) {
        message.error(
          `${formatMessage({
            id: 'ApplySysAuthorize.EnableDesensitizationTip',
            defaultMessage: '启用脱敏时，该选项为必填项!',
          })}`
        );
        return;
      }
      alterObj[key] = val;
      if (key === 'state' && val === '1') {
        alterObj.levelId = senseLevels[0] && senseLevels[0].id;
        alterObj.desensitizeId = senseMeasures[0] && senseMeasures[0].id;
      }
      this.setState({ tableDatasource });
    },
  };

  //  选择数据源
  handleTreeSelect = (checkedKeys, e) => {
    if (e) {
      const {
        node: { props = {} },
      } = e;
      const { dataRef = {} } = props;
      if (dataRef.treeIndex !== '2') {
        return false;
      }
    }
    const { dispatch, selectedKeys } = this.props;
    let dataobjectId = checkedKeys[0] ? `${checkedKeys[0]}` : '';
    if (dataobjectId.indexOf('&') > -1) {
      [, dataobjectId] = checkedKeys[0].split('&');
    }
    this.setState({ tableLoading: true });
    dispatch({
      type: 'applySysAuthorize/listFieldsAuthDetailInfo',
      payload: {
        appUserId: selectedKeys[0],
        dataobjectId,
        code: this.code,
      },
    }).then(response => {
      this.setState({ tableLoading: false });
      defaultHandleResponse(response, (tableDatasource = []) => {
        this.setState({
          tableDatasource,
          checkedKeys,
        });
      });
    });
  };

  // 字段搜索
  fieldSearch = value => {
    const { checkedKeys } = this.state;
    this.code = value;
    this.handleTreeSelect(checkedKeys);
  };

  // 保存特殊字段
  handleSubmit = () => {
    const { checkedKeys, tableDatasource } = this.state;
    const { onOk, dispatch, selectedKeys } = this.props;
    if (checkedKeys && checkedKeys.length === 0) {
      message.error(
        `${formatMessage({
          id: 'ApplySysAuthorize.NoDatasourceSelected',
          defaultMessage: '未选择数据源',
        })}`
      );
      return;
    }
    const paramList = [];
    tableDatasource.forEach(item => {
      if (item.state || item.levelId || item.desensitizeId) {
        paramList.push(item);
      }
    });
    let dataobjectId = checkedKeys[0] ? `${checkedKeys[0]}` : '';
    if (dataobjectId.indexOf('&') > -1) {
      [, dataobjectId] = checkedKeys[0].split('&');
    }
    dispatch({
      type: 'applySysAuthorize/saveSafeAppUserFieldAuth',
      payload: {
        safeAppUserFieldAuthList: paramList.map(o => {
          const obj = {
            appUserId: selectedKeys[0],
            dataobjectId,
          };
          return { ...o, ...obj };
        }),
      },
    }).then(result => {
      defaultHandleResponse(result, () => {
        message.success(
          `${formatMessage({
            id: 'ApplySysAuthorize.AuthorizationSucceeded',
            defaultMessage: '授权成功',
          })}`
        );
        if (onOk) {
          onOk();
        }
        this.handleCancel();
      });
    });
  };

  // 关闭弹窗
  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  render() {
    const { tableDatasource, checkedKeys, tableLoading } = this.state;
    const { visible, isEdit, confirmLoading } = this.props; // , nodeRow = {}
    const config = this.config();
    return (
      <Modal
        width={1050}
        visible={visible}
        confirmLoading={confirmLoading}
        title={
          isEdit
            ? `${formatMessage({
                id: 'ApplySysAuthorize.UserSpecialFieldModify',
                defaultMessage: '用户特殊字段权限修改',
              })}`
            : `${formatMessage({
                id: 'ApplySysAuthorize.UserSpecialFieldEntry',
                defaultMessage: '用户特殊字段权限录入',
              })}`
        }
        className={styles.add}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        okText={formatMessage({ id: 'COMMON_CONFIRM', defaultMessage: '确认' })}
      >
        <div className={styles.addTableCon}>
          <div className={styles.setCon}>
            <div className={styles.datasourceCon}>
              <div className={styles.require}>
                {formatMessage({
                  id: 'ApplySysAuthorize.SpecialFieldConfig',
                  defaultMessage: '特殊字段配置',
                })}
              </div>
              <DataSourceTree
                style={{ padding: '0 10px' }}
                selectedKeys={checkedKeys}
                checkable={false}
                onSelect={this.handleTreeSelect}
                getTable={true}
                getView={true}
                showSearch={true}
                showLoading={true}
              />
            </div>
            <div className={styles.tableCon}>
              <div className={styles.require}>
                `
                {formatMessage({
                  id: 'ApplySysAuthorize.SelDesensitizationFieldTip',
                  defaultMessage: '请选择脱敏字段',
                })}
              </div>
              <Input.Search
                onSearch={this.fieldSearch}
                placeholder={formatMessage({
                  id: 'COMMON_ENTER_TIP',
                  defaultMessage: '请输入',
                })}
                enterButton
                style={{ padding: '0 10px 10px' }}
              />
              <div className={styles.tableContant}>
                <Table
                  loading={tableLoading}
                  columns={config.columns}
                  dataSource={tableDatasource}
                  pagination={false}
                  rowKey="fieldCode"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default AddTable;
