import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Collapse } from 'antd';
import BaseInfo from './BaseInfo';
import ScanObjects from './ScanObjects';
import ScanRules from './ScanRules';
import RelationalRules from './RelationalRules';
import SensitiveRule from './SensitiveRule';
import MyIcon from '@/components/MyIcon';
import styles from './index.less';

const { Panel } = Collapse;

class SafetyItemConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.subviews = [];
    this.subViewMap = new Map();
  }

  componentDidMount() {
    const { viewDidMountHandler } = this.props;
    if (viewDidMountHandler) {
      viewDidMountHandler('SafetyItemConfig', this);
    }
  }

  // ===================================
  // public
  // ===================================

  isItemFormValid = () => {
    let isValid = true;
    let view;
    for (let index = 0; index < this.subviews.length; index++) {
      view = this.subviews[index];
      if (view && view.isFieldsValid && !view.isFieldsValid()) {
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  getItemFormValue = () => {
    if (this.isItemFormValid()) {
      const value = [];
      this.subviews.forEach(view => {
        if (view.getValue) value.push(view.getValue());
      });
      return value;
    }
    return {};
  };

  // ===================================
  // events
  // ===================================

  handleViewDidMount = (viewName, view) => {
    this.subviews.push(view);
    this.subViewMap.set(viewName, view);
  };

  // ===================================
  // render
  // ===================================

  render() {
    const { editable, editedItem } = this.props;

    const props = {
      viewDidMountHandler: this.handleViewDidMount,
      editable,
      editedItem,
    };

    return (
      <Collapse
        defaultActiveKey={['1']}
        bordered
        expandIconPosition="right"
        expandIcon={({ isActive }) => {
          return (
            <div>
              <span className={styles.collTitle}>
                {isActive
                  ? `${formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })}`
                  : `${formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}`}
              </span>
              <MyIcon type="iconjiantou1" className={styles.collIcon} rotate={isActive ? 0 : 180} />
            </div>
          );
        }}
      >
        <Panel
          header={formatMessage({ id: 'SafetyConfig.ConfigDetails', defaultMessage: '配置详情' })}
          key="1"
        >
          <Collapse defaultActiveKey={['1', '2', '3', '4', '5']} bordered>
            <Panel
              header={formatMessage({ id: 'SafetyConfig.BasicInfo', defaultMessage: '基本信息' })}
              key="1"
            >
              <BaseInfo {...props} />
            </Panel>
            <Panel
              header={formatMessage({ id: 'SafetyConfig.ScanObject', defaultMessage: '扫描对象' })}
              key="2"
            >
              <ScanObjects {...props} />
            </Panel>
            <Panel
              header={formatMessage({ id: 'SafetyConfig.ScanRules', defaultMessage: '扫描规则' })}
              key="3"
            >
              <ScanRules {...props} />
            </Panel>
            <Panel
              header={formatMessage({
                id: 'SafetyConfig.LinkageRules',
                defaultMessage: '联动规则',
              })}
              key="4"
            >
              <RelationalRules {...props} />
            </Panel>
            <Panel
              header={formatMessage({
                id: 'SafetyConfig.DesensitizationRule',
                defaultMessage: '脱敏规则',
              })}
              key="5"
            >
              <SensitiveRule {...props} />
            </Panel>
          </Collapse>
        </Panel>
      </Collapse>
    );
  }
}
export default SafetyItemConfig;
