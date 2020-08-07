import React, { Fragment } from 'react';
import { Button, Icon, Input, message, Select, Switch, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import MyIcon from '@/components/MyIcon';
import ConfigParamsModal from './ConfigParamsModal';
import UserModel from './UserModal';
import { defaultHandleResponse } from '@/utils/utils';
import {
  getAlarmTemplateType,
  getAlarmTemplates,
  updateAlarmTemplateDetail,
} from '@/services/auditManagement/riskIdentConfig';
import {
  SEND_TYPES,
  RISK_SOURCE_COLUMN,
  RISK_TYPE_COLUMN,
  TEMPLATE_COLUMN,
  TEMPLATE_NUMBER_COLUMN,
  TEMPLATE_PARAMETER_COLUMN,
  RECEIVE_USER_COLUMN,
  ALARM_ENABLE_COLUMN,
  SEND_TYPE_COLUMN,
} from '../../common/const';
import { COMMON_REQUIRED } from '@/common/const';
import styles from './index.less';

class TemplateList extends React.Component {
  constructor(props) {
    super(props);
    this.currentTemplateData = {};
    this.currentUserData = {};
    this.userData = null;
    this.state = {
      loading: false,
      alarmTemplates: [],
      isNumberTemplateType: false, // 是否编号模板
      showUserModal: false,
      showConfigParamModal: false,
      validateHelpers: {},
    };
  }

  componentDidMount() {
    this.checkIsNumberTemplate();
    this.getAlarmTemplates();
  }

  onUserDataReady = userData => {
    this.userData = userData;
    const { alarmTemplates } = this.state;
    if (alarmTemplates.length) {
      this.resetTemplatesUserInfo(userData);
    }
  };

  resetTemplatesUserInfo = userData => {
    const { alarmTemplates } = this.state;
    this.setState({
      alarmTemplates: alarmTemplates.map(item => {
        const { userId } = item;
        const user = userData.find(o => `${o.userId}` === `${userId}`);
        if (user) {
          const { userCode, userName } = user;
          return { ...item, userCode, userName };
        }
        return { ...item };
      }),
    });
  };

  /**
   * 获取是否是编号模板类型
   */
  checkIsNumberTemplate = () => {
    getAlarmTemplateType().then(response => {
      defaultHandleResponse(response, resultObject => {
        const isNumberTemplateType = resultObject === 2 || resultObject === '2';
        this.setState({ isNumberTemplateType });
      });
    });
  };

  // 初始化短信数据
  getAlarmTemplates = () => {
    const { templateType = 10 } = this.props;
    this.setState({ loading: true });
    getAlarmTemplates({ templateType }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (alarmTemplates = []) => {
        this.setState({ alarmTemplates }, () => {
          if (this.userData) {
            this.resetTemplatesUserInfo(this.userData);
          }
        });
      });
    });
  };

  selectUser = record => {
    this.currentUserData = { ...record };
    this.setState({ showUserModal: true });
  };

  handleSaveTemplateParams = data => {
    const { id } = data;
    const { alarmTemplates } = this.state;
    this.setState({
      alarmTemplates: alarmTemplates.map(o => {
        if (o.id === id) {
          return { ...data };
        }
        return { ...o };
      }),
    });
  };

  getColumnValidateHelper = (name, record) => {
    const { validateHelpers } = this.state;
    const recordValidateHelper = validateHelpers[record.id];
    return recordValidateHelper && recordValidateHelper[name] ? (
      <div className={styles.errorHelper}>{recordValidateHelper[name]}</div>
    ) : null;
  };

  getTemplateColumns = () => {
    const { isNumberTemplateType } = this.state;
    let { columnNames = [] } = this.props;
    if (!columnNames.length) {
      columnNames = [
        RISK_SOURCE_COLUMN,
        TEMPLATE_COLUMN,
        TEMPLATE_NUMBER_COLUMN,
        TEMPLATE_PARAMETER_COLUMN,
        RECEIVE_USER_COLUMN,
        ALARM_ENABLE_COLUMN,
        SEND_TYPE_COLUMN,
      ];
    }
    if (!isNumberTemplateType) {
      columnNames = columnNames.filter(
        o => ![TEMPLATE_NUMBER_COLUMN, TEMPLATE_PARAMETER_COLUMN, SEND_TYPE_COLUMN].includes(o)
      );
    }
    // 模板内容列占两倍
    const singleColumnWidth = `${100 / (columnNames.length + 1)}%`;
    return columnNames.map(name => {
      if (name === RISK_SOURCE_COLUMN) {
        // 风险事件来源和风险类型都取templateType字段
        // 风险识别配置页面显示事件来源
        // 采集告警配置页面显示风险类型
        return {
          dataIndex: 'templateType',
          width: singleColumnWidth,
          title: formatMessage({
            id: 'riskConfig.SourceOfRiskEvents',
            defaultMessage: '风险事件来源',
          }),
          render: val =>
            `${val}` === '101'
              ? formatMessage({ id: 'auditManagement.UnifiedPortal', defaultMessage: '统一门户' })
              : formatMessage({ id: 'auditManagement.OperateSystem', defaultMessage: '应用系统' }),
        };
      }
      if (name === RISK_TYPE_COLUMN) {
        return {
          dataIndex: 'templateType',
          width: singleColumnWidth,
          title: formatMessage({
            id: 'riskConfig.RiskType',
            defaultMessage: '风险类型',
          }),
          render: val => {
            const riskTypes = {
              '111': formatMessage({
                id: 'riskConfig.repeatedCollection',
                defaultMessage: '重复采集',
              }),
              '112': formatMessage({
                id: 'riskConfig.overTransLimit',
                defaultMessage: '传输量超标',
              }),
              '113': formatMessage({
                id: 'riskConfig.overStoreLimit',
                defaultMessage: '存储量超标',
              }),
              '114': formatMessage({
                id: 'riskConfig.collectionAbnormalInterrupt',
                defaultMessage: '采集异常中断',
              }),
            };
            return riskTypes[`${val}`] || '';
          },
        };
      }
      if (name === TEMPLATE_COLUMN) {
        return {
          dataIndex: 'template',
          width: `${parseFloat(singleColumnWidth) * 2}%`,
          title: formatMessage({ id: 'riskConfig.AlarmTemplate', defaultMessage: '告警模板' }),
          render: (val, record) => {
            return (
              <div className={styles.templateListColumn}>
                <Input.TextArea
                  rows={3}
                  value={val}
                  style={{ width: '90%' }}
                  placeholder={formatMessage({
                    id: 'riskConfig.AlarmTemplate',
                    defaultMessage: '告警模板',
                  })}
                  onChange={e => {
                    this.handleTemplateContentChange(e.target.value, record, 'template');
                  }}
                />
                {this.getColumnValidateHelper('template', record)}
              </div>
            );
          },
        };
      }
      if (name === RECEIVE_USER_COLUMN) {
        return {
          dataIndex: 'userId',
          width: singleColumnWidth,
          title: formatMessage({ id: 'riskConfig.ReceivingUser', defaultMessage: '接收用户' }),
          render: (userId, record) => {
            return (
              <div className={styles.templateListColumn}>
                <div
                  className={styles.seledUser}
                  onClick={() => {
                    this.selectUser(record);
                  }}
                >
                  {userId || `${userId}` === '0' ? (
                    <Fragment>
                      <MyIcon type="iconshouquanx" className={styles.collIcon} />
                      <span className={styles.seledUserName}>{record.userName}</span>
                    </Fragment>
                  ) : (
                    <MyIcon type="iconzhanghaox" className={styles.collIcon} />
                  )}
                </div>
                {this.getColumnValidateHelper('userId', record)}
              </div>
            );
          },
        };
      }
      if (name === ALARM_ENABLE_COLUMN) {
        return {
          dataIndex: 'enable',
          width: singleColumnWidth,
          title: formatMessage({ id: 'riskConfig.AlarmEnabled', defaultMessage: '告警启用' }),
          render: (val, record) => (
            <Switch
              checkedChildren={
                <Icon
                  type="check"
                  title={formatMessage({
                    id: 'applySysUserManagement.Enable',
                    defaultMessage: '启用',
                  })}
                />
              }
              unCheckedChildren={
                <Icon
                  type="close"
                  title={formatMessage({
                    id: 'applySysUserManagement.Disable',
                    defaultMessage: '停用',
                  })}
                />
              }
              checked={val}
              onChange={value => {
                this.handleTemplateContentChange(value, record, 'enable');
              }}
            />
          ),
        };
      }
      if (name === TEMPLATE_NUMBER_COLUMN) {
        return {
          dataIndex: 'templateId',
          width: singleColumnWidth,
          title: formatMessage({ id: 'riskConfig.templateNo', defaultMessage: '模板编号' }),
          render: (val, record) => (
            <Input
              value={val}
              placeholder={formatMessage({
                id: 'riskConfig.templateNo',
                defaultMessage: '模板编号',
              })}
              onChange={e => {
                this.handleTemplateContentChange(e.target.value, record, 'templateId');
              }}
            />
          ),
        };
      }
      if (name === TEMPLATE_PARAMETER_COLUMN) {
        return {
          dataIndex: 'templateParams',
          width: singleColumnWidth,
          title: formatMessage({ id: 'riskConfig.templateParams', defaultMessage: '模板参数' }),
          render: (t, record) => (
            <a
              onClick={() => {
                this.currentTemplateData = { ...record };
                this.setState({ showConfigParamModal: true });
              }}
            >
              {formatMessage({ id: 'riskConfig.configParams', defaultMessage: '配置参数' })}
            </a>
          ),
        };
      }
      if (name === SEND_TYPE_COLUMN) {
        return {
          dataIndex: 'sendType',
          width: singleColumnWidth,
          title: formatMessage({ id: 'riskConfig.sendingWay', defaultMessage: '发送方式' }),
          render: (val, record) => (
            <Select
              value={val}
              style={{ width: '100%' }}
              onChange={value => this.handleTemplateContentChange(value, record, 'sendType')}
            >
              {SEND_TYPES.map(o => (
                <Select.Option key={o.value} value={o.value}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
          ),
        };
      }
      return {};
    });
  };

  changeUser = data => {
    const { id } = data;
    const { alarmTemplates, validateHelpers } = this.state;
    const _validateHelpers = { ...validateHelpers };
    if (_validateHelpers[id]) {
      delete _validateHelpers[id].userId;
    }
    this.setState({
      alarmTemplates: alarmTemplates.map(o => {
        if (o.id === id) {
          return { ...data };
        }
        return { ...o };
      }),
      validateHelpers: _validateHelpers,
    });
  };

  handleTemplateContentChange = (value, record, dataIndex) => {
    const { alarmTemplates, validateHelpers } = this.state;
    const { id } = record;
    const _alarmTemplates = alarmTemplates.map(o => {
      if (o.id === id) {
        return {
          ...o,
          [dataIndex]: value,
        };
      }
      return { ...o };
    });
    const _validateHelpers = { ...validateHelpers };
    if (dataIndex === 'template') {
      if (!_validateHelpers[id]) {
        _validateHelpers[id] = {};
      }
      _validateHelpers[id].template = value ? '' : COMMON_REQUIRED.message;
    }
    this.setState({ alarmTemplates: _alarmTemplates, validateHelpers: _validateHelpers });
  };

  validateList = validateHelpers => {
    const ids = Object.keys(validateHelpers);
    let bool = true;
    ids.forEach(id => {
      const helper = validateHelpers[id];
      if (helper) {
        const fieldNames = Object.keys(helper);
        fieldNames.forEach(name => {
          if (helper[name]) {
            bool = false;
          }
        });
      }
    });
    return bool;
  };

  updateTemplateDetail = () => {
    const { alarmTemplates, validateHelpers } = this.state;
    const _validateHelpers = { ...validateHelpers };
    alarmTemplates.forEach(t => {
      if (!t.userId && `${t.userId}` !== '0') {
        if (!_validateHelpers[t.id]) {
          _validateHelpers[t.id] = {};
        }
        _validateHelpers[t.id].userId = COMMON_REQUIRED.message;
      }
    });
    this.setState({ validateHelpers: _validateHelpers });
    if (!this.validateList(_validateHelpers)) {
      return false;
    }
    this.setState({ loading: true });
    updateAlarmTemplateDetail(alarmTemplates).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(`${formatMessage({ id: 'riskConfig.ModifySMSSuccessTip' })}`);
      });
    });
  };

  render() {
    const { loading, showUserModal, showConfigParamModal, alarmTemplates } = this.state;
    return (
      <div>
        <Table
          rowKey="id"
          loading={loading}
          pagination={false}
          dataSource={alarmTemplates}
          columns={this.getTemplateColumns()}
        />
        <div className={styles.bottomPart}>
          <div className={styles.tableTextareaExplain}>
            {formatMessage({ id: 'riskConfig.templateTextareaTip' })}
          </div>
          <div>
            <Button style={{ marginRight: '20px' }} onClick={this.getAlarmTemplates}>
              {`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
            </Button>
            <Button type="primary" onClick={this.updateTemplateDetail} loading={loading}>
              {`${formatMessage({ id: 'riskConfig.modify' })}`}
            </Button>
          </div>
        </div>
        <UserModel
          actItem={{ ...this.currentUserData }}
          visible={showUserModal}
          onOk={this.changeUser}
          onUserDataReady={this.onUserDataReady}
          onCancel={() => this.setState({ showUserModal: false })}
        />
        <ConfigParamsModal
          visible={showConfigParamModal}
          templateData={{ ...this.currentTemplateData }}
          onOk={this.handleSaveTemplateParams}
          onCancel={() => this.setState({ showConfigParamModal: false })}
        />
      </div>
    );
  }
}
export default TemplateList;
