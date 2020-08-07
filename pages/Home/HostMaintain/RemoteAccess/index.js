import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Spin, Input, Tree, message } from 'antd';
import MyIcon from '@/components/MyIcon';
import ConsoleModule from './consoleModule';
import FtpModule from './ftpModule';

import styles from './index.less';

const { Search } = Input;
const { TreeNode } = Tree;

@connect(({ remoteAccess }) => ({
  mode: remoteAccess.mode,
  searchName: remoteAccess.searchName,
  sshHostList: remoteAccess.sshHostList,
  ftpHostList: remoteAccess.ftpHostList,
  connectionConsoleArr: remoteAccess.connectionConsoleArr,
  connectionFtpArr: remoteAccess.connectionFtpArr,
}))
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      collapsed: false,
      editConWidth: 580,
    };
  }

  componentWillMount() {
    this.initHostList('ssh');
    this.initHostList('ftp');
  }

  componentDidMount() {
    this.setEditConWidth();
    window.onresize = this.setEditConWidth.bind(this);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    window.onresize = null;
    dispatch({
      type: 'remoteAccess/clearState',
    });
  }

  setEditConWidth = () => {
    const outer = this.codeCon.clientWidth;
    const inner = this.directoryCon.clientWidth;
    const editConWidth = outer - inner - 1;
    this.setState({
      editConWidth: editConWidth > 580 ? editConWidth : 580,
    });
  };

  changeSearchName = e => {
    const { value } = e.target;
    const { dispatch } = this.props;
    dispatch({
      type: 'remoteAccess/save',
      payload: {
        searchName: value,
      },
    });
  };

  handelSearch = value => {
    const { mode } = this.props;

    this.initHostList(mode === 'console' ? 'ssh' : 'ftp', value);
  };

  updateHostList = () => {
    const { mode, dispatch } = this.props;
    dispatch({
      type: 'remoteAccess/save',
      payload: {
        searchName: '',
      },
    });
    this.initHostList(mode === 'console' ? 'ssh' : 'ftp', '');
  };

  // 查询主机列表
  initHostList = (type, value) => {
    const datasourceName = value || '';
    const params = { datasourceType: type, datasourceName, 'signature-sessionId': window.name };
    const { dispatch } = this.props;
    dispatch({
      type: 'remoteAccess/queryHosts',
      payload: {
        ...params,
      },
    });
  };

  // 控制台和ftp切换
  getBtn = () => {
    const { mode } = this.props;
    const objInfo = [
      {
        type: 'console',
        txt: `${formatMessage({ id: 'remoteAccess.console' })}`,
      },
      {
        type: 'ftp',
        txt: `${formatMessage({ id: 'remoteAccess.FTPService' })}`,
      },
    ];
    const arr = [];
    objInfo.forEach((item, index) => {
      arr.push(
        <span
          key={index}
          className={`${mode == item.type ? styles.avtiveBtn : ''}`}
          onClick={this.btnClick.bind(this, item.type)}
        >
          {item.txt}
        </span>
      );
    });
    return arr;
  };

  btnClick = type => {
    const { dispatch } = this.props;
    dispatch({
      type: 'remoteAccess/save',
      payload: {
        mode: type,
        searchName: '',
      },
    });
  };

  initTree = nodeArr => {
    return nodeArr.map(item => {
      let iconStr = '';
      const title = item.datasourceName;
      if (item.datasourceId === -1) {
        iconStr = 'iconschema-folder';
      } else {
        iconStr = 'iconzhujizisex';
      }
      return (
        <TreeNode
          title={
            <div className={styles.directoryTitleCon} onClick={this.hostClick.bind(this, item)}>
              <MyIcon
                type={iconStr}
                title={title}
                style={{ marginRight: '5px', cursor: 'pointer' }}
              />
              <span className={styles.directoryTitleName} title={title}>
                {title}
              </span>
            </div>
          }
          item={item}
          key={`${item.datasourceId}`}
        >
          {item.children && item.children.length > 0 ? this.initTree(item.children) : ''}
        </TreeNode>
      );
    });
  };

  hostClick = item => {
    if (item.datasourceId === -1) {
      return false;
    }
    const { connectionConsoleArr, connectionFtpArr, mode, dispatch } = this.props;
    if (mode === 'console') {
      if (connectionConsoleArr.length >= 10) {
        message.info(`${formatMessage({ id: 'remoteAccess.CreateConnMaxTip' })}`);
        return false;
      }
      for (let i = 0; i < connectionConsoleArr.length; i++) {
        if (connectionConsoleArr[i].datasourceId === item.datasourceId) {
          dispatch({
            type: 'remoteAccess/save',
            payload: {
              actConnectionHost: item,
            },
          });
          return false;
        }
      }
      const arr = [...connectionConsoleArr];
      arr.push(item);
      dispatch({
        type: 'remoteAccess/save',
        payload: {
          connectionConsoleArr: arr,
          actConnectionHost: item,
        },
      });
    } else {
      if (connectionFtpArr.length >= 10) {
        message.info(`${formatMessage({ id: 'remoteAccess.CreateConnMaxTip' })}`);
        return false;
      }
      for (let i = 0; i < connectionFtpArr.length; i++) {
        if (connectionFtpArr[i].datasourceId === item.datasourceId) {
          dispatch({
            type: 'remoteAccess/save',
            payload: {
              actConnectionFtp: item,
            },
          });
          return false;
        }
      }
      const arr = [...connectionFtpArr];
      arr.push(item);
      dispatch({
        type: 'remoteAccess/save',
        payload: {
          connectionFtpArr: arr,
          actConnectionFtp: item,
        },
      });
      this.$ftpModule.loginConn(item);
    }
  };

  setftpModuleChild = ftpModule => {
    this.$ftpModule = ftpModule;
  };

  getHostDataByParams = (params = []) => {
    const paramsObj = {};
    params.forEach(param => {
      switch (param.paramName) {
        case 'ssh_port':
          paramsObj.port = param.paramValue;
          break;
        case 'ssh_host':
          paramsObj.ip = param.paramValue;
          break;
        case 'ssh_password':
          paramsObj.password = param.paramValue;
          break;
        case 'ssh_username':
          paramsObj.username = param.paramValue;
          break;
        default:
          break;
      }
    });
    return paramsObj;
  };

  resetHostList = hostList => {
    return hostList.map(item => {
      const { children } = item;
      if (!children) return item;
      return {
        ...item,
        children: children.map(child => {
          const paramsObj = this.getHostDataByParams(child.params);

          return {
            ...child,
            ...paramsObj,
          };
        }),
      };
    });
  };

  render() {
    const { loading, collapsed, editConWidth } = this.state;
    const { mode, searchName, ftpHostList, sshHostList } = this.props;
    //  const treeArr = mode === 'console' ? hostList : ftpHostList;
    const hostList = mode === 'console' ? sshHostList : ftpHostList;
    const treeArr = this.resetHostList(hostList);

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        <Spin spinning={loading} className={styles.spinStyle} />
        <div
          className={styles.mainCon}
          ref={c => {
            this.codeCon = c;
          }}
        >
          <div
            className={styles.leftCon}
            ref={c => {
              this.directoryCon = c;
            }}
          >
            <div className={styles.leftTitle}>
              <div style={collapsed ? { display: 'none' } : {}}>
                {`${formatMessage({ id: 'remoteAccess.RemoteHostSel' })}`}
              </div>
              <div>
                <MyIcon
                  type={collapsed ? 'iconmenuunfold' : 'iconmenufold'}
                  style={{ fontSize: '18px', cursor: 'pointer' }}
                  onClick={() => {
                    // eslint-disable-next-line no-shadow
                    const { collapsed } = this.state;
                    this.setState(
                      {
                        collapsed: !collapsed,
                      },
                      () => {
                        this.setEditConWidth();
                      }
                    );
                  }}
                />
              </div>
            </div>
            <div className={styles.leftTreeCon} style={collapsed ? { display: 'none' } : {}}>
              <div className={styles.tabAndSearchCon}>
                <div className={styles.tabCon}>
                  <div className={styles.btnCon}>{this.getBtn()}</div>
                </div>
                <div className={styles.searchCon}>
                  <Search
                    value={searchName}
                    placeholder={`${formatMessage({ id: 'remoteAccess.searchKeyword' })}`}
                    onSearch={value => this.handelSearch(value)}
                    onChange={this.changeSearchName}
                    className={styles.childListSearch}
                  />
                  <MyIcon
                    onClick={this.updateHostList}
                    type="iconshuaxin"
                    className={styles.refreshIcon}
                  />
                </div>
              </div>
              <div className={styles.childList}>
                {treeArr.length > 0 ? (
                  <Fragment>
                    <Tree
                      defaultExpandAll
                      className={styles.childListCon}
                      style={mode === 'console' ? { display: 'none' } : {}}
                    >
                      {this.initTree(treeArr)}
                    </Tree>
                    <Tree
                      defaultExpandAll
                      className={styles.childListCon}
                      style={mode === 'console' ? {} : { display: 'none' }}
                    >
                      {this.initTree(treeArr)}
                    </Tree>
                  </Fragment>
                ) : (
                  <div className={styles.noDataTip}>
                    {`${formatMessage({ id: 'remoteAccess.HostListEmpty' })}`}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.rightCon} style={{ width: `${editConWidth}px` }}>
            <ConsoleModule />
            <FtpModule setftpModuleChild={this.setftpModuleChild} />
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
