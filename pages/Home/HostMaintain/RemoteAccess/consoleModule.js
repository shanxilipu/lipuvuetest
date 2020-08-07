import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Tabs } from 'antd';

import MyIcon from '@/components/MyIcon';
import SSHModule from './sshModule';

import styles from './index.less';

const { TabPane } = Tabs;

@connect(({ remoteAccess }) => ({
  mode: remoteAccess.mode,
  connectionConsoleArr: remoteAccess.connectionConsoleArr,
  actConnectionHost: remoteAccess.actConnectionHost,
}))
class ConsoleModule extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // this.initpage();
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  //  删除现在的tab
  remove = targetKey => {
    const { connectionConsoleArr, actConnectionHost, dispatch } = this.props;
    const arr = connectionConsoleArr.filter(item => {
      return `${item.datasourceId}` !== `${targetKey}`;
    });
    dispatch({
      type: 'remoteAccess/save',
      payload: {
        connectionConsoleArr: arr,
      },
    });
    if (`${targetKey}` === `${actConnectionHost.datasourceId}`) {
      dispatch({
        type: 'remoteAccess/save',
        payload: {
          actConnectionHost: arr[0] || {},
        },
      });
    }
  };

  onTabChange = activeKey => {
    const { connectionConsoleArr, dispatch } = this.props;
    const activeTab = connectionConsoleArr.filter(
      item => `${item.datasourceId}` === `${activeKey}`
    );
    if (!activeTab.length) return;

    dispatch({
      type: 'remoteAccess/save',
      payload: {
        actConnectionHost: activeTab[0],
      },
    });
  };

  render() {
    const { mode, connectionConsoleArr, actConnectionHost } = this.props;

    return (
      <div className={styles.consoleCon} style={mode !== 'console' ? { display: 'none' } : {}}>
        {!connectionConsoleArr || connectionConsoleArr.length <= 0 ? (
          <div className={styles.noSelFile}>
            <MyIcon type="icon-zanwushuju" style={{ fontSize: '80px' }} />
            <span>{formatMessage({ id: 'remoteAccess.PleaseSelHost' })}</span>
          </div>
        ) : (
          <Tabs
            hideAdd
            onChange={this.onTabChange}
            activeKey={`${actConnectionHost.datasourceId}`}
            type="editable-card"
            onEdit={this.onEdit}
            className={styles.tabCon}
          >
            {connectionConsoleArr.map(item => (
              <TabPane
                className={styles.painCon}
                tab={`${item.username}@${item.datasourceName}`}
                key={item.datasourceId}
              >
                <SSHModule linkInfo={item} />
              </TabPane>
            ))}
          </Tabs>
        )}
      </div>
    );
  }
}

export default ConsoleModule;
