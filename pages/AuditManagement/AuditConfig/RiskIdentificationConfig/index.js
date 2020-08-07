import React, { Component, Fragment } from 'react';
import {
  Collapse,
  List,
  Row,
  Col,
  Switch,
  Icon,
  Tag,
  TimePicker,
  Button,
  message,
  Spin,
  InputNumber,
} from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import MyIcon from '@/components/MyIcon';
import TemplateList from '../../components/TemplateList';
import { getRiskDetail, updateRiskDetail } from '@/services/auditManagement/riskIdentConfig';
import { defaultHandleResponse } from '@/utils/utils';
import styles from './index.less';

const { Panel } = Collapse;
const { CheckableTag } = Tag;
const momentStr = 'HH:mm';

class RiskIdentificationConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weakArr: [
        { name: `${formatMessage({ id: 'riskConfig.Monday' })}`, id: '1' },
        { name: `${formatMessage({ id: 'riskConfig.Tuesday' })}`, id: '2' },
        { name: `${formatMessage({ id: 'riskConfig.Wednesday' })}`, id: '3' },
        { name: `${formatMessage({ id: 'riskConfig.Thursday' })}`, id: '4' },
        { name: `${formatMessage({ id: 'riskConfig.Friday' })}`, id: '5' },
        { name: `${formatMessage({ id: 'riskConfig.Saturday' })}`, id: '6' },
        { name: `${formatMessage({ id: 'riskConfig.Sunday' })}`, id: '7' },
      ],
      riskData: {
        '1': {
          params: [
            { paramCode: 'NOT_WORK_TIME_NOON', paramValue: '12:00-13:00' },
            { paramCode: 'NOT_WORK_DAY', paramValue: '' },
            { paramCode: 'NOT_WORK_TIME_NIGHT', paramValue: '22:00-23:00' },
          ],
          riskType: '1',
          state: '2',
        },
        '2': {
          params: [{ paramCode: 'ABNORMAL_QUERY_TIME', paramValue: '' }],
          riskDescribe: `${formatMessage({ id: 'riskConfig.HighNumQueries' })}`,
          riskType: '2',
          state: '2',
          userLevel: null,
        },
        '3': { params: [], riskType: '3', state: '2' },
        '4': { params: [], riskType: '4', state: '2' },
        '5': { params: [], riskType: '5', state: '2' },
      },
      getRiskDetailLoading: false,
    };
  }

  componentDidMount() {
    this.getRiskData();
  }

  getRiskData = () => {
    this.setState({ getRiskDetailLoading: true });
    getRiskDetail({}).then(response => {
      this.setState({ getRiskDetailLoading: false });
      defaultHandleResponse(response, (resultObject = []) => {
        const riskData = {};
        resultObject.forEach(o => {
          const { riskType } = o;
          riskData[riskType] = o;
        });
        this.setState({ riskData });
      });
    });
  };

  setComponentStatus = (value, key) => {
    const { riskData } = this.state;
    if (value) {
      riskData[key].state = '1';
    } else {
      riskData[key].state = '2';
    }
    this.setState({
      riskData,
    });
  };

  onFileChange = value => {
    const { riskData } = this.state;
    riskData['2'].params[0].paramValue = value;
    this.setState({
      riskData,
    });
  };

  getSelectedWorkDayTags = () => {
    const { riskData } = this.state;
    const selArr = riskData['1'].params.filter(item => {
      return item.paramCode === 'NOT_WORK_DAY';
    });
    if (!selArr.length) {
      return [];
    }
    const { paramValue } = selArr[0];
    if (!paramValue) {
      return [];
    }
    return paramValue.split(',');
  };

  handleChange = (tag, checked) => {
    const { riskData } = this.state;
    const newRiskData = { ...riskData };
    const selArr = newRiskData['1'].params.filter(item => {
      return item.paramCode === 'NOT_WORK_DAY';
    })[0];
    const selectedTags = this.getSelectedWorkDayTags();
    const nextSelectedTags = checked
      ? [...selectedTags, tag.id]
      : selectedTags.filter(t => t !== tag.id);
    selArr.paramValue = nextSelectedTags.join(',');
    this.setState({
      riskData: newRiskData,
    });
  };

  timeChange = (index, key, value) => {
    const { riskData } = this.state;
    const selArr = riskData['1'].params.filter(item => {
      return item.paramCode === key;
    })[0];
    const timeArr = selArr.paramValue.split('-');
    timeArr[index] = value;
    selArr.paramValue = timeArr.join('-');
    this.setState({
      riskData,
    });
  };

  getMoon = type => {
    const { riskData } = this.state;
    const selArr = riskData['1'].params.filter(item => {
      if (type === 'moon') {
        return item.paramCode === 'NOT_WORK_TIME_NOON';
      }
      return item.paramCode === 'NOT_WORK_TIME_NIGHT';
    });
    if (selArr.length > 0) {
      return selArr[0].paramValue.split('-');
    }
    return ['', ''];
  };

  // 修改风险识别配置
  updateRiskDetail = () => {
    const { riskData } = this.state;
    const keys = Object.keys(riskData);
    const list = keys.map(item => {
      return riskData[item];
    });
    this.setState({ getRiskDetailLoading: true });
    updateRiskDetail(list).then(response => {
      this.setState({ getRiskDetailLoading: false });
      defaultHandleResponse(response, () => {
        message.success(`${formatMessage({ id: 'riskConfig.ModifySuccessTip' })}`);
      });
    });
  };

  render() {
    const { weakArr, riskData, getRiskDetailLoading } = this.state;
    const selectedTags = this.getSelectedWorkDayTags();

    const moon = this.getMoon('moon');
    const night = this.getMoon();

    return (
      <div className={styles.indexCon}>
        <Collapse
          defaultActiveKey={['1']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'auditManagement.Collapse' })}`
                    : `${formatMessage({ id: 'auditManagement.Expand' })}`}
                </span>
                <MyIcon
                  type="iconjiantou1"
                  className={styles.collIcon}
                  rotate={isActive ? 0 : 180}
                />
              </div>
            );
          }}
        >
          <Panel header={`${formatMessage({ id: 'riskConfig.RiskIdentifyConfig' })}`} key="1">
            <Spin spinning={getRiskDetailLoading}>
              <Fragment>
                <List
                  className={styles.list}
                  header={
                    <Row className={styles.listHeader}>
                      <Col span={3}>{`${formatMessage({ id: 'auditManagement.EventType' })}`}</Col>
                      <Col span={18}>
                        {`${formatMessage({ id: 'riskConfig.EventDesAndConfig' })}`}
                      </Col>
                      <Col span={3}>
                        {`${formatMessage({ id: 'riskConfig.EnableEventRecognition' })}`}
                      </Col>
                    </Row>
                  }
                >
                  <List.Item>
                    <Row className={styles.listItem}>
                      <Col span={3}>
                        {`${formatMessage({ id: 'riskConfig.NonWorkingTimeAccess' })}`}
                      </Col>
                      <Col span={18} className={styles.serarchCon}>
                        <span>{`${formatMessage({ id: 'riskConfig.NonWorkingWeek' })}`}</span>
                        <div>
                          {weakArr.map(tag => (
                            <CheckableTag
                              key={tag.id}
                              checked={selectedTags.indexOf(tag.id) > -1}
                              onChange={checked => this.handleChange(tag, checked)}
                            >
                              {`${tag.name}`}
                            </CheckableTag>
                          ))}
                        </div>
                        <span>{`${formatMessage({ id: 'riskConfig.NonWorkingTime' })}`}</span>
                        <div
                          className={styles.selTimeCon}
                          title={`${formatMessage({ id: 'riskConfig.noon' })}`}
                        >
                          <MyIcon type="iconshizhong" className={styles.iconStyle} />
                          <TimePicker
                            value={moment(`${moon[0]}}`, momentStr)}
                            onChange={(a, b) => {
                              this.timeChange(0, 'NOT_WORK_TIME_NOON', b);
                            }}
                            className={styles.inpitWidth40}
                            allowClear={false}
                            size="small"
                            format={momentStr}
                          />
                          <span>-</span>
                          <TimePicker
                            value={moment(`${moon[1]}}`, momentStr)}
                            onChange={(a, b) => {
                              this.timeChange(1, 'NOT_WORK_TIME_NOON', b);
                            }}
                            className={styles.inpitWidth40}
                            allowClear={false}
                            size="small"
                            format={momentStr}
                          />
                        </div>
                        <div
                          className={styles.selTimeCon}
                          title={`${formatMessage({ id: 'riskConfig.night' })}`}
                        >
                          <MyIcon type="iconshizhong" className={styles.iconStyle} />
                          <TimePicker
                            value={moment(`${night[0]}}`, momentStr)}
                            onChange={(a, b) => {
                              this.timeChange(0, 'NOT_WORK_TIME_NIGHT', b);
                            }}
                            className={styles.inpitWidth40}
                            allowClear={false}
                            size="small"
                            format={momentStr}
                          />
                          <span>-</span>
                          <TimePicker
                            value={moment(`${night[1]}}`, momentStr)}
                            onChange={(a, b) => {
                              this.timeChange(1, 'NOT_WORK_TIME_NIGHT', b);
                            }}
                            className={styles.inpitWidth40}
                            allowClear={false}
                            size="small"
                            format={momentStr}
                          />
                        </div>
                      </Col>
                      <Col span={3}>
                        <Switch
                          checkedChildren={
                            <Icon
                              type="check"
                              title={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                            />
                          }
                          unCheckedChildren={
                            <Icon
                              type="close"
                              title={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                            />
                          }
                          checked={riskData['1'].state === '1'}
                          onChange={value => {
                            this.setComponentStatus(value, '1');
                          }}
                        />
                      </Col>
                    </Row>
                  </List.Item>
                  <List.Item>
                    <Row className={styles.listItem}>
                      <Col span={3}>{`${formatMessage({ id: 'riskConfig.HighNumQueries' })}`}</Col>
                      <Col span={18} className={styles.serarchCon}>
                        <span>{`${formatMessage({ id: 'riskConfig.ExecutePast' })}`}</span>
                        <InputNumber
                          placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
                          min={1}
                          onChange={this.onFileChange}
                          className={styles.inpitWidth100}
                          value={riskData['2'].params[0].paramValue}
                        />
                        <span>{`${formatMessage({ id: 'riskConfig.Times' })}`}</span>
                      </Col>
                      <Col span={3}>
                        <Switch
                          checkedChildren={
                            <Icon
                              type="check"
                              title={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                            />
                          }
                          unCheckedChildren={
                            <Icon
                              type="close"
                              title={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                            />
                          }
                          checked={riskData['2'].state === '1'}
                          onChange={value => {
                            this.setComponentStatus(value, '2');
                          }}
                        />
                      </Col>
                    </Row>
                  </List.Item>
                  <List.Item>
                    <Row className={styles.listItem}>
                      <Col span={3}>
                        {`${formatMessage({ id: 'riskConfig.QueryBlockingData' })}`}
                      </Col>
                      <Col span={18}>
                        {`${formatMessage({ id: 'riskConfig.QueryDenAsBlockedData' })}`}
                      </Col>
                      <Col span={3}>
                        <Switch
                          checkedChildren={
                            <Icon
                              type="check"
                              title={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                            />
                          }
                          unCheckedChildren={
                            <Icon
                              type="close"
                              title={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                            />
                          }
                          checked={riskData['3'].state === '1'}
                          onChange={value => {
                            this.setComponentStatus(value, '3');
                          }}
                        />
                      </Col>
                    </Row>
                  </List.Item>
                  <List.Item>
                    <Row className={styles.listItem}>
                      <Col span={3}>
                        {`${formatMessage({ id: 'riskConfig.DownloadSensitiveData' })}`}
                      </Col>
                      <Col span={18}>
                        {`${formatMessage({ id: 'riskConfig.DownloadSensitiveDataDes' })}`}
                      </Col>
                      <Col span={3}>
                        <Switch
                          checkedChildren={
                            <Icon
                              type="check"
                              title={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                            />
                          }
                          unCheckedChildren={
                            <Icon
                              type="close"
                              title={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                            />
                          }
                          checked={riskData['4'].state === '1'}
                          onChange={value => {
                            this.setComponentStatus(value, '4');
                          }}
                        />
                      </Col>
                    </Row>
                  </List.Item>
                  <List.Item>
                    <Row className={styles.listItem}>
                      <Col span={3}>
                        {`${formatMessage({ id: 'riskConfig.ModifySensitiveAttr' })}`}
                      </Col>
                      <Col span={18}>
                        {`${formatMessage({ id: 'riskConfig.ModifySensitiveAttrDes' })}`}
                      </Col>
                      <Col span={3}>
                        <Switch
                          checkedChildren={
                            <Icon
                              type="check"
                              title={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                            />
                          }
                          unCheckedChildren={
                            <Icon
                              type="close"
                              title={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                            />
                          }
                          checked={riskData['5'].state === '1'}
                          onChange={value => {
                            this.setComponentStatus(value, '5');
                          }}
                        />
                      </Col>
                    </Row>
                  </List.Item>
                </List>
                <div className={styles.btnCon}>
                  <Button style={{ marginRight: '20px' }} onClick={this.getRiskData}>
                    {`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
                  </Button>
                  <Button
                    type="primary"
                    onClick={this.updateRiskDetail}
                    loading={getRiskDetailLoading}
                  >
                    {`${formatMessage({ id: 'riskConfig.modify' })}`}
                  </Button>
                </div>
              </Fragment>
            </Spin>
          </Panel>
        </Collapse>

        <Collapse
          className={styles.alarmSMSCon}
          defaultActiveKey={['1']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'auditManagement.Collapse' })}`
                    : `${formatMessage({ id: 'auditManagement.Expand' })}`}
                </span>
                <MyIcon
                  type="iconjiantou1"
                  className={styles.collIcon}
                  rotate={isActive ? 0 : 180}
                />
              </div>
            );
          }}
        >
          <Panel header={`${formatMessage({ id: 'riskConfig.AlarmSMSConfig' })}`} key="1">
            <TemplateList />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default RiskIdentificationConfig;
