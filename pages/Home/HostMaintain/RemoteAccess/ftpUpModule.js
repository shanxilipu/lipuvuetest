/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Table, Input, message, Tooltip, Spin } from 'antd';
import moment from 'moment';
import MyIcon from '@/components/MyIcon';
import { randomWord } from '@/utils/utils';
import request from '@/utils/request';
import { qryDownloadProgress } from '@/services/hostMaintain';
import styles from './index.less';

@connect(({ remoteAccess }) => ({
  actConnectionFtp: remoteAccess.actConnectionFtp,
}))
class FtpUpModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      pathStr: '/',
      seledRows: [],
      currentRemote: '',
      timerArr: [],
      loading: false,
    };
    this.getList = this.getList.bind(this);
    this.remoteColumns = [
      {
        title: '',
        key: 'directoryOrFile',
        className: 'modelTableIcon',
        render: val => {
          const { directory } = val;
          return directory ? (
            <MyIcon type="iconschema-folder" style={{ color: 'rgba(0,0,0,.25)' }} />
          ) : (
            <MyIcon type="iconyucaozuoqu-iconcopybeifenx" style={{ color: 'rgba(0,0,0,.25)' }} />
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.name' })}`,
        dataIndex: 'filename',
        align: 'left',
        className: 'modelTableName model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.size' })}`,
        // dataIndex: 'size',
        key: 'sizeAndDir',
        align: 'left',
        className: 'modelTableSize model_table_ellipsis',
        render: val => {
          const { size, directory } = val;
          if (directory) {
            return '-';
          }
          let text = '-';
          if (size || `${size}` === '0') {
            text = (size / 1024).toFixed(2);
          }
          return size ? (
            <Tooltip title={`${text}KB`}>
              <span className="titleSpan">{`${text}KB`}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.type' })}`,
        dataIndex: 'directory',
        align: 'left',
        className: 'modelTableType model_table_ellipsis',
        render: directory => {
          const text = !directory
            ? `${formatMessage({ id: 'remoteAccess.file' })}`
            : `${formatMessage({ id: 'remoteAccess.folder' })}`;
          return (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.ChangeTime' })}`,
        dataIndex: 'timestamp',
        align: 'left',
        className: 'modelTableLastModified model_table_ellipsis',
        render: lastModified => {
          return lastModified ? (
            <Tooltip title={moment(lastModified).format('YYYY-MM-DD HH:mm:ss')}>
              <span className="titleSpan">
                {moment(lastModified).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.Attributes' })}`,
        dataIndex: 'permissionsString',
        align: 'left',
        className: 'modelTableLastModified model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { linkInfo, actConnectionFtp, setFtpUpModuleChild } = this.props;
    const { isConn, datasourceId } = linkInfo;
    const { datasourceId: actDatasourceId } = actConnectionFtp;
    if (isConn) {
      this.getList(linkInfo, '/');
    }
    if (datasourceId === actDatasourceId) {
      if (setFtpUpModuleChild) {
        setFtpUpModuleChild(this);
      }
    }
  }

  componentWillUnmount() {
    const { timerArr } = this.state;
    timerArr.forEach(timer => {
      clearInterval(timer);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { linkInfo } = this.props;
    if (nextProps.linkInfo.isConn && nextProps.linkInfo.isConn !== linkInfo.isConn) {
      this.getList(nextProps.linkInfo, '/');
    }
    const { actConnectionFtp, setFtpUpModuleChild } = nextProps;
    const { datasourceId: actDatasourceId } = actConnectionFtp;
    const { datasourceId } = linkInfo;
    if (datasourceId === actDatasourceId) {
      if (setFtpUpModuleChild) {
        setFtpUpModuleChild(this);
      }
    }
  }

  // 获取远程服务器文件列表
  getList = (linkInfo, path) => {
    const { setCommandList } = this.props;
    this.setState({
      seledRows: [],
    });
    const { dispatch } = this.props;
    const { datasourceId } = linkInfo;
    const params = new FormData();
    params.append('datasourceId', datasourceId);
    params.append('ftpPath', path);
    this.setState({
      loading: true,
    });
    dispatch({
      type: 'remoteAccess/lsFile',
      payload: params,
    })
      .then(res => {
        this.setState({
          loading: false,
        });
        const {
          resultCode,
          resultObject = [],
          resultMsg = `${formatMessage({ id: 'remoteAccess.FailedGetFileList' })}`,
        } = res;
        if (resultCode === '0') {
          setCommandList(`ls ${path}`, 'success');
          resultObject.forEach(item => {
            item.itemKey = `file_${randomWord(false, 40)}`;
            item.pathStr = path;
          });
          this.setState({
            dataList: resultObject,
            currentRemote: path,
          });
        } else {
          message.error(resultMsg);
          setCommandList(`ls ${path}`, 'failure');
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  // 输入地址远程服务器文件列表
  searchPath = () => {
    const { pathStr } = this.state;
    const { linkInfo } = this.props;
    const searchPathStr = pathStr || '/';
    this.getList(linkInfo, searchPathStr);
  };

  // 下载多个文件(支持文件夹)，返回压缩包
  downLoadMultipleFile = () => {
    const { timerArr } = this.state;
    const { setCommandList } = this.props;
    const { seledRows } = this.state;
    if (seledRows.length <= 0) {
      message.info(`${formatMessage({ id: 'remoteAccess.SelDownFolder' })}`);
      return false;
    }
    const { linkInfo } = this.props;
    const { datasourceId } = linkInfo;
    const downKey = `file_${randomWord(false, 40)}`;
    const commands = seledRows.map(item => {
      let newPathStr = '';
      if (item.pathStr.endsWith('/')) {
        newPathStr = `${item.pathStr}${item.filename}`;
      } else {
        newPathStr = `${item.pathStr}/${item.filename}`;
      }
      return {
        directory: item.directory,
        ftpPath: newPathStr,
      };
    });
    let downStr = '';
    commands.forEach(item => {
      downStr += ` ${item.ftpPath}`;
    });
    setCommandList(`down ${downStr}`);
    this.setState({
      loading: true,
    });
    request('smartsafe/FptOperationController/downLoadMultipleFile', {
      method: 'POST',
      responseType: 'blob',
      body: {
        datasourceId,
        commands: JSON.stringify(commands),
        key: downKey,
      },
    }).then(res => {
      if (!res.success) {
        this.setState({ loading: false });
      }
    });
    // downloadFile('smartsafe/FptOperationController/downLoadMultipleFile', inputs, 'POST');
    const hasResault = { hasResault: false };
    const downArr = [];
    const timer = setInterval(() => {
      this.qryDownloadProgress(downKey, hasResault, downArr, timer);
    }, 1000);
    timerArr.push(timer);
    this.setState({
      timerArr,
    });
  };

  qryDownloadProgress = (key, hasResault, downArr, timer) => {
    const { setUploadList, linkInfo, setUploadListObj } = this.props;
    const { params: linkParams, datasourceId } = linkInfo;
    const params = new FormData();
    params.append('key', key);
    qryDownloadProgress(params)
      .then(result => {
        if (!result) {
          this.setState({
            loading: false,
          });
          this.clearInterProgress(timer);
          return false;
        }
        const {
          resultCode,
          resultMsg = `${formatMessage({ id: 'remoteAccess.downloadFailed' })}`,
          resultObject,
        } = result;
        if (resultCode !== '0') {
          this.setState({
            loading: false,
          });
          this.clearInterProgress(timer);
          message.error(resultMsg);
        } else if (resultObject instanceof Array && resultObject.length > 0) {
          if (!hasResault.hasResault) {
            // 第一次返回文件信息
            let ftpIp = '';
            linkParams.forEach(element => {
              if (element.paramName === 'ftp_host') {
                ftpIp = element.paramValue;
              }
            });
            resultObject.forEach(item => {
              const fileObj = {
                ftpIp,
                upOrDown: 'down',
                startTime: item.startTime,
                fileUpListId: `file_${randomWord(false, 40)}`,
                remoteAddress: item.ftpPath,
                progress: item.progress,
                size: item.size,
                name: item.name,
              };
              downArr.push(fileObj);
              setUploadList(fileObj, 'unshift');
            });
            hasResault.hasResault = true;
          } else if (resultObject[0].progress !== '100%') {
            // 下载中
            downArr.forEach(item => {
              item.progress = resultObject[0].progress;
              setUploadListObj(item, datasourceId);
            });
          } else {
            // 下载完成
            downArr.forEach(item => {
              item.progress = resultObject[0].progress;
              item.success = true;
              item.endTime = resultObject[0].endTime;
              setUploadListObj(item, datasourceId);
            });
            this.setState({
              loading: false,
            });
            this.clearInterProgress(timer);
          }
        } else if (
          resultObject &&
          (`${resultObject}` === '0' || `${resultObject}` === '-1' || `${resultObject}` === '100%')
        ) {
          // 下载的全是空文件夹 || 下载失败
          this.setState({
            loading: false,
          });
          this.clearInterProgress(timer);
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
        this.clearInterProgress(timer);
      });
  };

  // 取消循环
  clearInterProgress = timer => {
    const { timerArr } = this.state;
    clearInterval(timer);
    const index = timerArr.findIndex(value => {
      return value === timer;
    });
    if (index !== -1) {
      timerArr.splice(index, 1);
      this.setState({
        timerArr,
      });
    }
  };

  setLoading = flag => {
    this.setState({
      loading: flag,
    });
  };

  render() {
    const { dataList, pathStr, loading } = this.state;

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          seledRows: selectedRows,
        });
      },
      onSelect: (record, selected, selectedRows) => {
        this.setState({
          seledRows: selectedRows,
        });
      },
      onSelectAll: (selected, selectedRows) => {
        this.setState({
          seledRows: selectedRows,
        });
      },
    };

    return (
      <div className={styles.FtpUpModuleCon}>
        <Spin spinning={loading} className={styles.spinStyle} />
        <div className={styles.ftpRemoteDirSelCon}>
          <Input
            className={styles.ftpLocalDirPath}
            value={pathStr}
            onChange={e => {
              this.setState({
                pathStr: e.target.value,
              });
            }}
            onPressEnter={() => {
              this.searchPath();
            }}
            placeholder={`${formatMessage({ id: 'remoteAccess.PleaseSelFolder' })}`}
          />
          <span className={styles.ftpLocalDirSel} onClick={this.searchPath}>
            <MyIcon
              type="iconwenjianjiakuangx"
              title={`${formatMessage({ id: 'remoteAccess.OpenFolder' })}`}
            />
          </span>
          <span className={styles.ftpLocalDirUp} onClick={this.downLoadMultipleFile}>
            <MyIcon type="iconxiazai" title={`${formatMessage({ id: 'remoteAccess.Download' })}`} />
          </span>
        </div>
        <div className={styles.dirCon}>
          <div>
            <Table
              rowSelection={rowSelection}
              columns={this.remoteColumns}
              dataSource={dataList}
              rowKey="itemKey"
              pagination={false}
              size="small"
              onRow={record => ({
                onClick: () => {
                  const { directory } = record;
                  if (directory) {
                    const { linkInfo } = this.props;
                    let newPathStr = '';
                    if (record.pathStr.endsWith('/')) {
                      newPathStr = `${record.pathStr}${record.filename}`;
                    } else {
                      newPathStr = `${record.pathStr}/${record.filename}`;
                    }
                    this.setState({
                      pathStr: newPathStr,
                    });
                    this.getList(linkInfo, newPathStr);
                  }
                },
              })}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FtpUpModule;
