import React from 'react';
import { Tabs } from 'antd';
import { formatMessage } from 'umi/locale';
import CollectionAlarm from './CollectionAlarm';
import TemplateList from '../../components/TemplateList';
import {
  RISK_TYPE_COLUMN,
  TEMPLATE_COLUMN,
  TEMPLATE_NUMBER_COLUMN,
  TEMPLATE_PARAMETER_COLUMN,
  RECEIVE_USER_COLUMN,
  ALARM_ENABLE_COLUMN,
  SEND_TYPE_COLUMN,
} from '../../common/const';
import styles from './index.less';

class AlarmCollectionConfig extends React.PureComponent {
  render() {
    return (
      <Tabs className={styles.tab}>
        <Tabs.TabPane
          key="0"
          tab={formatMessage({ id: 'alarmCollectionConfig.title', defaultMessage: '采集告警配置' })}
        >
          <CollectionAlarm />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="1"
          tab={formatMessage({
            id: 'alarmCollectionConfig.alarmTemplateConfig',
            defaultMessage: '告警模板配置',
          })}
        >
          <TemplateList
            templateType="11"
            columnNames={[
              RISK_TYPE_COLUMN,
              TEMPLATE_COLUMN,
              TEMPLATE_NUMBER_COLUMN,
              TEMPLATE_PARAMETER_COLUMN,
              RECEIVE_USER_COLUMN,
              ALARM_ENABLE_COLUMN,
              SEND_TYPE_COLUMN,
            ]}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
export default AlarmCollectionConfig;
