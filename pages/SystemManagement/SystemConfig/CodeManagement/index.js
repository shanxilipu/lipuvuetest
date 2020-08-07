import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Collapse, Icon } from 'antd';
import MyIcon from '@/components/MyIcon';
import styles from './index.less';
import TempConfig from './components/TempConfig';
import SendCheck from './components/SendCheck';

const { Panel } = Collapse;

class CodeManagement extends PureComponent {
  render() {
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
                    ? `${formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })}`
                    : `${formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}`}
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
          <Panel
            header={
              <span>
                <Icon type="setting" />
                &nbsp;{' '}
                {formatMessage({
                  id: 'CodeManagement.VerificationCodeTemplateConfiguration',
                  defaultMessage: '验证码模板配置',
                })}
              </span>
            }
            key="0"
          >
            <TempConfig />
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
                    ? `${formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })}`
                    : `${formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}`}
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
          <Panel
            header={
              <span>
                <Icon type="mail" />
                &nbsp;{' '}
                {formatMessage({
                  id: 'CodeManagement.VerificationCodeSendingQuery',
                  defaultMessage: '验证码发送查询',
                })}
              </span>
            }
            key="1"
          >
            <SendCheck />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default CodeManagement;
