import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Input, Table, Tabs, message, Tooltip, Button, Dropdown, Menu } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import MyIcon from '@/components/MyIcon';
import { randomWord } from '@/utils/utils';
import { uploadFile } from '@/services/hostMaintain';
import FtpUpModule from './ftpUpModule';
import styles from './index.less';

const { TabPane } = Tabs;
const formatStr = 'YYYY-MM-DD HH:mm:ss';

@connect(({ remoteAccess }) => ({
  mode: remoteAccess.mode,
  connectionFtpArr: remoteAccess.connectionFtpArr,
  actConnectionFtp: remoteAccess.actConnectionFtp,
}))
class FtpModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seledRows: [],
      dataList: [],
      dirPath: '',
      catlogAndFileLength: 0,
      uploadListObj: {},
    };
    this.uploadList = [];
    this.localColumns = [
      {
        title: '',
        key: 'fileType',
        className: 'modelTableIcon',
        render: val => {
          const { type } = val;
          return type === 0 ? (
            <MyIcon type="iconprocedure-folder" style={{ color: 'rgba(0,0,0,.25)' }} />
          ) : (
            <MyIcon type="iconyucaozuoqu-iconcopybeifenx" style={{ color: 'rgba(0,0,0,.25)' }} />
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.name' })}`,
        dataIndex: 'name',
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
        dataIndex: 'size',
        align: 'left',
        className: 'modelTableSize model_table_ellipsis',
        render: size => {
          return size ? (
            <Tooltip title={`${size}KB`}>
              <span className="titleSpan">{`${size}KB`}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.type' })}`,
        dataIndex: 'type',
        align: 'left',
        className: 'modelTableType model_table_ellipsis',
        render: type => {
          const text =
            type == 1
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
        dataIndex: 'lastModified',
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
    ];
    this.upColumns = [
      {
        title: `${formatMessage({ id: 'remoteAccess.projectName' })}`,
        dataIndex: 'name',
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
        title: `${formatMessage({ id: 'remoteAccess.address' })}`,
        dataIndex: 'ftpIp',
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
        title: '< - >',
        dataIndex: 'upOrDown',
        align: 'left',
        className: 'modelTableType model_table_ellipsis',
        render: upOrDown => {
          const text =
            upOrDown === 'up'
              ? `${formatMessage({ id: 'remoteAccess.Upload' })}`
              : upOrDown === 'down'
              ? `${formatMessage({ id: 'remoteAccess.Download' })}`
              : '-';
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
        dataIndex: 'size',
        align: 'left',
        className: 'modelTableSize model_table_ellipsis',
        render: size => {
          let text = '-';
          if (size || `${size}` === '0') {
            if (`${size}`.indexOf('KB') > -1 || `${size}`.indexOf('MB') > -1) {
              text = size;
            } else {
              text = `${size}KB`;
            }
          }
          return size ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.progress' })}`,
        dataIndex: 'progress',
        align: 'left',
        className: 'modelTableType model_table_ellipsis',
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
        title: `${formatMessage({ id: 'remoteAccess.local' })}`,
        dataIndex: 'webkitRelativePath',
        align: 'left',
        className: 'modelTableLastModified model_table_ellipsis',
        render: webkitRelativePath => {
          return webkitRelativePath ? (
            <Tooltip title={webkitRelativePath}>
              <span className="titleSpan">{webkitRelativePath}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'remoteAccess.StartTime' })}`,
        dataIndex: 'startTime',
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
      {
        title: `${formatMessage({ id: 'remoteAccess.EndTime' })}`,
        dataIndex: 'endTime',
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
      {
        title: `${formatMessage({ id: 'remoteAccess.Remote' })}`,
        dataIndex: 'remoteAddress',
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
      {
        title: `${formatMessage({ id: 'remoteAccess.status' })}`,
        dataIndex: 'success',
        align: 'left',
        className: 'modelTableLastModified model_table_ellipsis',
        render: success => {
          const text =
            success === true
              ? `${formatMessage({ id: 'remoteAccess.TransferCompleted' })}`
              : success === false
              ? `${formatMessage({ id: 'remoteAccess.TransferFailed' })}`
              : `${formatMessage({ id: 'remoteAccess.Transferring' })}`;
          return (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          );
        },
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.Operate' })}`,
        key: 'operate',
        className: 'modelTableOperate',
        render: val => {
          const { success, upOrDown } = val;
          return success === false && upOrDown === 'up' ? (
            <Button
              type="primary"
              onClick={() => {
                this.reUpload(val);
              }}
            >
              {formatMessage({ id: 'remoteAccess.reUpload' })}
            </Button>
          ) : (
            '-'
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { setftpModuleChild } = this.props;
    setftpModuleChild(this);
  }

  fileChange = () => {
    if (!this.fileUrl.files || this.fileUrl.files.length <= 0) {
      return false;
    }
    this.setState({
      seledRows: [],
    });
    const obj = {};
    const item = this.fileUrl.files[0];
    obj.name = item.name;
    obj.id = '00';
    obj.fileListId = `file_${randomWord(false, 40)}`;
    obj.size = (item.size / 1024).toFixed(1);
    obj.lastModified = item.lastModified;
    obj.webkitRelativePath = item.name;
    obj.pId = -1;
    obj.type = 1;
    obj.file = item;
    this.setState({
      dataList: [obj],
      dirPath: '-',
    });
    this.fileUrl.value = '';
  };

  catlogChange = () => {
    const arr = [];
    if (!this.catlogUrl.files || this.catlogUrl.files.length <= 0) {
      return false;
    }
    this.setState({
      seledRows: [],
    });
    for (let i = 0; i < this.catlogUrl.files.length; i++) {
      const obj = {};
      obj.pathArr = this.catlogUrl.files[i].webkitRelativePath.split('/').slice(1); // 去除上传的根目录
      obj.fileObj = this.catlogUrl.files[i];
      obj.lastModified = this.catlogUrl.files[i].lastModified;
      arr.push(obj);
    }
    const pathValue = this.catlogUrl.files[0].webkitRelativePath.split('/').slice(0, 1);
    this.setState({
      dirPath: pathValue,
    });
    const treeData = [];
    arr.forEach((item, i) => {
      item.pathArr.forEach((item2, j) => {
        const obj = {};
        obj.name = item2;
        obj.id = `${i}${j}`;
        obj.fileListId = `file_${randomWord(false, 40)}`;
        if (j == item.pathArr.length - 1) {
          obj.type = 1;
          obj.file = item.fileObj;
          obj.size = (item.fileObj.size / 1024).toFixed(1);
          obj.lastModified = item.lastModified;
          obj.webkitRelativePath = item.pathArr.slice(0, j + 1).join('/');
        } else {
          obj.type = 0;
          obj.webkitRelativePath = item.pathArr.slice(0, j + 1).join('/');
        }
        if (j == 0) {
          obj.pId = -1;
        } else {
          treeData[j - 1].forEach(n => {
            if (n.webkitRelativePath == item.pathArr.slice(0, j).join('/')) {
              obj.pId = n.id;
            }
          });
        }
        if (treeData[j]) {
          let flag = true;
          treeData[j].forEach(n => {
            if (n.webkitRelativePath == item.pathArr.slice(0, j + 1).join('/') && obj.type == 0) {
              flag = false;
            }
          });
          if (flag) {
            treeData[j].push(obj);
          }
        } else {
          treeData[j] = [obj];
        }
      });
    });
    let treeDataSet = [];
    treeData.forEach(element => {
      treeDataSet = _.concat(treeDataSet, element);
    });
    const result = treeDataSet.reduce((prev, item) => {
      // eslint-disable-next-line no-unused-expressions
      prev[item.pId] ? prev[item.pId].push(item) : (prev[item.pId] = [item]);
      return prev;
    }, {});
    /* eslint-disable */
    for (let prop in result) {
      result[prop].forEach((item, i) => {
        result[item.id] ? (item.children = result[item.id]) : '';
      });
    }

    const treeDataArr = result['-1'];
    const dataList = [];
    treeDataArr.forEach(item => {
      if (item.type == 1) {
        dataList.push(item);
      } else {
        dataList.unshift(item);
      }
    });
    console.log(dataList);
    this.setState({
      dataList,
    });
    this.catlogUrl.value = '';
  };

  // 切换选中的ftp
  onChange = activeKey => {
    const { connectionFtpArr, dispatch } = this.props;
    for (let i = 0; i < connectionFtpArr.length; i++) {
      if (`${connectionFtpArr[i].datasourceId}` === `${activeKey}`) {
        dispatch({
          type: 'remoteAccess/save',
          payload: {
            actConnectionFtp: connectionFtpArr[i],
          },
        });
        break;
      }
    }
  };

  onEdit = targetKey => {
    const { connectionFtpArr, actConnectionFtp, dispatch } = this.props;
    const arr = connectionFtpArr.filter(item => {
      return `${item.datasourceId}` !== `${targetKey}`;
    });
    dispatch({
      type: 'remoteAccess/save',
      payload: {
        connectionFtpArr: arr,
      },
    });
    if (`${targetKey}` === `${actConnectionFtp.datasourceId}`) {
      dispatch({
        type: 'remoteAccess/save',
        payload: {
          actConnectionFtp: {},
        },
      });
    }
  };

  // ftp登录连接
  loginConn = item => {
    const { dispatch } = this.props;
    const { datasourceId } = item;
    const params = new FormData();
    params.append('datasourceId', datasourceId);
    dispatch({
      type: 'remoteAccess/loginConn',
      payload: params,
    }).then(res => {
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'remoteAccess.ConnectionFailed' })}`,
      } = res;
      if (resultCode === '0') {
        this.setCommandList('login', 'success');
        const { connectionFtpArr } = this.props;
        connectionFtpArr.forEach((connItem, index) => {
          if (connItem.datasourceId === item.datasourceId) {
            connItem.isConn = true;
          }
        });
        let newConnectionFtpArr = JSON.stringify(connectionFtpArr);
        newConnectionFtpArr = JSON.parse(newConnectionFtpArr);
        dispatch({
          type: 'remoteAccess/save',
          payload: {
            connectionFtpArr: newConnectionFtpArr,
          },
        });
      } else {
        message.error(resultMsg);
        this.setCommandList('login', 'failure');
      }
    });
  };

  // 断开链接 type为true断开后要再连接
  closeConn = (item, type) => {
    const { dispatch } = this.props;
    const { datasourceId } = item;
    const params = new FormData();
    params.append('datasourceId', datasourceId);
    dispatch({
      type: 'remoteAccess/closeConn',
      payload: params,
    }).then(res => {
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'remoteAccess.FailedDisconnect' })}`,
      } = res;
      if (resultCode === '0') {
        this.setCommandList('close', 'success');
        const { connectionFtpArr } = this.props;
        connectionFtpArr.forEach((connItem, index) => {
          if (connItem.datasourceId === item.datasourceId) {
            connItem.isConn = false;
          }
        });
        let newConnectionFtpArr = JSON.stringify(connectionFtpArr);
        newConnectionFtpArr = JSON.parse(newConnectionFtpArr);
        dispatch({
          type: 'remoteAccess/save',
          payload: {
            connectionFtpArr: newConnectionFtpArr,
          },
        });
        if (type) {
          this.loginConn(item);
        }
      } else {
        message.error(resultMsg);
        this.setCommandList('close', 'failure');
      }
    });
  };

  // 组装ftp上传的tab页签
  geFtpTitle = item => {
    const { params } = item;
    let ftp_username = '';
    let ftp_port = '';
    let ftp_host = '';
    params.forEach(element => {
      if (element.paramName === 'ftp_username') {
        ftp_username = element.paramValue;
      }
      if (element.paramName === 'ftp_port') {
        ftp_port = element.paramValue;
      }
      if (element.paramName === 'ftp_host') {
        ftp_host = element.paramValue;
      }
    });
    return `${ftp_username}@${ftp_host}:${ftp_port}`;
  };

  // 从connectionFtpArr中找出当前选中的一项
  getActItem = () => {
    const { actConnectionFtp, connectionFtpArr } = this.props;
    let actItem = {};
    connectionFtpArr.forEach((connItem, index) => {
      if (connItem.datasourceId === actConnectionFtp.datasourceId) {
        actItem = connItem;
      }
    });
    return actItem;
  };

  getFtpUpModule = () => {
    const { connectionFtpArr, actConnectionFtp } = this.props;
    const arr = connectionFtpArr.map(item => {
      const { isConn } = item;
      return (
        <TabPane
          className={styles.painCon}
          tab={this.geFtpTitle(item)}
          key={`${item.datasourceId}`}
        >
          {isConn ? (
            <FtpUpModule
              linkInfo={item}
              setFtpUpModuleChild={this.setFtpUpModuleChild}
              activeKey={`${actConnectionFtp.datasourceId}`}
              setCommandList={this.setCommandList}
              setUploadList={this.setUploadList}
              setUploadListObj={this.setUploadListObj}
            />
          ) : (
            <div className={styles.noConnTip}>
              {formatMessage({ id: 'remoteAccess.NotConnected' })}
            </div>
          )}
        </TabPane>
      );
    });
    return arr;
  };

  setFtpUpModuleChild = ftpUpModule => {
    this.$ftpUpModule = ftpUpModule;
  };

  upfile = () => {
    const { seledRows } = this.state;
    if (seledRows.length <= 0) {
      message.info(`${formatMessage({ id: 'remoteAccess.PleaseSelFile' })}`);
      return false;
    }
    const actFtpUpModule = this.$ftpUpModule;
    const { currentRemote, loading } = this.$ftpUpModule.state;
    if (loading) {
      message.error(`${formatMessage({ id: 'remoteAccess.ConnectionIsInUse' })}`);
      return false;
    }
    const { linkInfo } = this.$ftpUpModule.props;
    const { datasourceId, params } = linkInfo;
    let ftpIp = '';
    params.forEach(element => {
      if (element.paramName === 'ftp_host') {
        ftpIp = element.paramValue;
      }
    });
    this.uploadList = [];
    let putStr = '';
    seledRows.forEach(item => {
      putStr += ` ${item.webkitRelativePath}`;
    });
    this.setCommandList(`put ${putStr}`);
    const newSeledRow = _.cloneDeep(seledRows);
    actFtpUpModule.setLoading(true);
    this.creatFileAndCatlog(
      newSeledRow,
      datasourceId,
      currentRemote,
      ftpIp,
      linkInfo,
      actFtpUpModule
    );
  };

  // 获取要上传文件数量
  getFileLength = arr => {
    let num = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == 0) {
        if (arr[i].children && arr[i].children.length > 0) {
          num += this.getFileLength(arr[i].children);
        }
      } else if (arr[i].type == 1) {
        num += 1;
      }
    }
    return num;
  };

  creatFileAndCatlog = async (arr, datasourceId, baseUrl, ftpIp, linkInfo, actFtpUpModule) => {
    const creatArr = [];
    const creatCatArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == 0) {
        if (arr[i].children && arr[i].children.length > 0) {
          creatCatArr.push(arr[i].children);
        }
      } else if (arr[i].type == 1) {
        arr[i].ftpIp = ftpIp;
        arr[i].upOrDown = 'up';
        arr[i].fileUpListId = `file_${randomWord(false, 40)}`;
        creatArr.push(arr[i]);
      }
    }
    if (creatArr.length > 0) {
      const chunkArr = _.chunk(creatArr, 5);
      for (let i = 0; i < chunkArr.length; i++) {
        const UpArr = chunkArr[i].map(item => {
          return this.creatFile(item, datasourceId, baseUrl, linkInfo, actFtpUpModule);
        });
        await Promise.allSettled(UpArr);
      }
    }
    if (creatCatArr.length > 0) {
      for (let i = 0; i < creatCatArr.length; i++) {
        await this.creatFileAndCatlog(
          creatCatArr[i],
          datasourceId,
          baseUrl,
          ftpIp,
          linkInfo,
          actFtpUpModule
        );
      }
    }
  };

  creatFile = (obj, datasourceId, baseUrl, linkInfo, actFtpUpModule, isReUpload) => {
    const params = new FormData();
    params.append('datasourceId', datasourceId);
    params.append('file', obj.file);
    let ftpPath = '';
    if (baseUrl.endsWith('/')) {
      ftpPath = `${baseUrl}${obj.webkitRelativePath}`;
    } else {
      ftpPath = `${baseUrl}/${obj.webkitRelativePath}`;
    }
    ftpPath = ftpPath
      .split('/')
      .slice(0, -1)
      .join('/');
    params.append('ftpPath', `${ftpPath}/`);
    params.append('fileName', `${obj.name}`);
    obj.remoteAddress = `${ftpPath}/${obj.name}`;
    obj.startTime = moment().format(formatStr);
    if (!isReUpload) {
      this.setUploadList(obj, 'unshift');
    }
    return uploadFile(params, this.onProgress.bind(this, obj, datasourceId))
      .then(result => {
        obj.endTime = moment().format(formatStr);
        if (!result) {
          if (isReUpload) {
            message.error(`${formatMessage({ id: 'remoteAccess.uploadFailed' })}`);
            this.setReUploadLoading(datasourceId, false);
            return false;
          }
          obj.success = false;
          this.setUploadListObj(obj, datasourceId);
          this.uploadList.unshift(obj);
          this.setLoadingFalse(linkInfo, baseUrl, actFtpUpModule);
          return false;
        }
        const { resultCode } = result;
        if (resultCode !== '0') {
          if (isReUpload) {
            message.error(`${formatMessage({ id: 'remoteAccess.uploadFailed' })}`);
            this.setReUploadLoading(datasourceId, false);
            return false;
          }
          obj.success = false;
          this.setUploadListObj(obj, datasourceId);
          this.uploadList.unshift(obj);
          this.setLoadingFalse(linkInfo, baseUrl, actFtpUpModule);
        } else {
          obj.success = true;
          if (isReUpload) {
            this.setUploadListObj(obj, datasourceId);
            actFtpUpModule.getList(linkInfo, baseUrl);
            this.setReUploadLoading(datasourceId, false);
            return false;
          }
          this.setUploadListObj(obj, datasourceId);
          this.uploadList.push(obj);
          this.setLoadingFalse(linkInfo, baseUrl, actFtpUpModule);
        }
      })
      .catch(err => {
        if (isReUpload) {
          message.error(`${formatMessage({ id: 'remoteAccess.uploadFailed' })}`);
          this.setReUploadLoading(datasourceId, false);
          return false;
        }
        obj.endTime = moment().format(formatStr);
        obj.success = false;
        this.setUploadListObj(obj, datasourceId);
        this.uploadList.unshift(obj);
        this.setLoadingFalse(linkInfo, baseUrl, actFtpUpModule);
      });
  };

  onProgress = (item, datasourceId, e) => {
    let percent = Math.floor((e.loaded / e.total) * 100);
    percent = `${percent}%`;
    item.progress = percent;
    this.setUploadListObj(item, datasourceId);
  };

  setLoadingFalse = (linkInfo, baseUrl, actFtpUpModule) => {
    const { catlogAndFileLength } = this.state;
    if (this.uploadList.length == catlogAndFileLength) {
      const falseArr = this.uploadList.filter(item => {
        return !item.success;
      });
      const tip =
        falseArr.length <= 0
          ? `${formatMessage({ id: 'remoteAccess.uploadCompletedTip' })}`
          : `${formatMessage({ id: 'remoteAccess.uploadCompletedTip1' })} ${
              falseArr.length
            } ${formatMessage({ id: 'remoteAccess.uploadCompletedTip2' })}`;
      message.success(`${tip}`);
      actFtpUpModule.setLoading(false);
      actFtpUpModule.getList(linkInfo, baseUrl);
    }
  };

  // 传输失败的文件手动上传
  reUpload = obj => {
    const actFtpUpModule = this.$ftpUpModule;
    const { linkInfo } = this.$ftpUpModule.props;
    const { datasourceId } = linkInfo;
    const { currentRemote } = this.$ftpUpModule.state;
    this.setReUploadLoading(datasourceId, true);
    this.creatFile(obj, datasourceId, currentRemote, linkInfo, actFtpUpModule, true);
  };

  // 设置文件传输列表loading状态
  setReUploadLoading = (datasourceId, flag) => {
    const { uploadListObj } = this.state;
    const actUploadObj = uploadListObj[datasourceId] || {};
    actUploadObj.reUploadLoading = flag;
    this.setState({
      uploadListObj,
    });
  };

  // 设置文件的传输状态
  setUploadList = (fileObj, type) => {
    const { uploadListObj } = this.state;
    const { actConnectionFtp } = this.props;
    const { datasourceId } = actConnectionFtp;
    const keys = Object.keys(uploadListObj);
    const index = keys.findIndex(value => {
      return `${value}` === `${datasourceId}`;
    });
    if (index !== -1) {
      if (!uploadListObj[keys[index]].uploadList) {
        uploadListObj[keys[index]].uploadList = [];
      }
    } else {
      uploadListObj[`${datasourceId}`] = {};
      uploadListObj[`${datasourceId}`].uploadList = [];
    }
    if (type === 'unshift') {
      uploadListObj[`${datasourceId}`].uploadList.unshift(fileObj);
    } else {
      uploadListObj[`${datasourceId}`].uploadList.push(fileObj);
    }
    this.setState({
      uploadListObj,
    });
  };

  // 记录命令
  setCommandList = (command, statu) => {
    const { uploadListObj } = this.state;
    const { actConnectionFtp } = this.props;
    const { datasourceId } = actConnectionFtp;
    const keys = Object.keys(uploadListObj);
    const index = keys.findIndex(value => {
      return `${value}` === `${datasourceId}`;
    });
    if (index !== -1) {
      if (!uploadListObj[keys[index]].commandList) {
        uploadListObj[keys[index]].commandList = [];
      }
    } else {
      uploadListObj[`${datasourceId}`] = {};
      uploadListObj[`${datasourceId}`].commandList = [];
    }
    uploadListObj[`${datasourceId}`].commandList.unshift({
      command,
      statu,
      itemKey: `file_${randomWord(false, 40)}`,
    });
    this.setState({
      uploadListObj,
    });
  };

  // 更新文件进度状态
  setUploadListObj = (item, datasourceId) => {
    const { uploadListObj } = this.state;
    const { uploadList = [] } = uploadListObj[`${datasourceId}`];
    uploadList.forEach(fileItem => {
      if (fileItem.id === item.id) {
        fileItem = { ...fileItem, ...item };
      }
    });
    this.setState({
      uploadListObj,
    });
  };

  render() {
    const { dataList, dirPath, uploadListObj, seledRows } = this.state;
    const { mode, connectionFtpArr, actConnectionFtp } = this.props;
    const { datasourceId } = actConnectionFtp;
    const actItem = this.getActItem();

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

    const actUploadObj = uploadListObj[datasourceId] || {};
    let { uploadList = [], commandList = [], reUploadLoading } = actUploadObj;

    return (
      <div className={styles.ftpCon} style={mode !== 'ftp' ? { display: 'none' } : {}}>
        {!connectionFtpArr || connectionFtpArr.length <= 0 ? (
          <div className={styles.noSelFile}>
            <MyIcon type="icon-zanwushuju" style={{ fontSize: '80px' }} />
            <span>{formatMessage({ id: 'remoteAccess.PleaseSelHost' })}</span>
          </div>
        ) : (
          <div className={styles.ftpOutCon}>
            <div className={styles.ftpBtnCon}>
              <span
                style={{ cursor: 'pointer' }}
                className={actItem.isConn ? styles.disabled : ''}
                onClick={() => {
                  if (actItem.isConn) {
                    return false;
                  }
                  this.loginConn(actItem);
                }}
              >
                <MyIcon
                  type="iconlianjiekuangx"
                  title={`${formatMessage({ id: 'remoteAccess.ConnectHost' })}`}
                  disabled={actItem.isConn}
                />
              </span>
              <span
                style={{ cursor: 'pointer' }}
                className={!actItem.isConn ? styles.disabled : ''}
                onClick={() => {
                  if (!actItem.isConn) {
                    return false;
                  }
                  this.closeConn(actItem);
                }}
              >
                <MyIcon
                  type="iconduankailianjiex"
                  title={`${formatMessage({ id: 'remoteAccess.Disconnect' })}`}
                  disabled={!actItem.isConn}
                />
              </span>
              <span
                style={{ cursor: 'pointer' }}
                className={!actItem.isConn ? styles.disabled : ''}
                onClick={() => {
                  if (!actItem.isConn) {
                    return false;
                  }
                  this.closeConn(actItem, true);
                }}
              >
                <MyIcon
                  type="iconshuaxinkuangx"
                  title={`${formatMessage({ id: 'remoteAccess.Reconnect' })}`}
                  disabled={!actItem.isConn}
                />
              </span>
            </div>
            <div className={styles.ftpTransportCon}>
              <div className={styles.ftpLocalCon}>
                <p className={styles.ftpLocalTitle}>{`${formatMessage({
                  id: 'remoteAccess.LocalDirectory',
                })}`}</p>
                <div className={styles.ftpLocalDirSelCon}>
                  <Input
                    className={styles.ftpLocalDirPath}
                    placeholder={`${formatMessage({ id: 'remoteAccess.PleaseSelFolder' })}`}
                    value={dirPath}
                    disabled
                    prefix={
                      <MyIcon type="iconprocedure-folder" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                  />
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() => {
                            this.catlogUrl.click();
                          }}
                        >
                          <span>
                            {formatMessage({
                              id: 'remoteAccess.folder',
                              defaultMessage: '文件夹',
                            })}
                          </span>
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => {
                            this.fileUrl.click();
                          }}
                        >
                          <span>
                            {formatMessage({
                              id: 'remoteAccess.file',
                              defaultMessage: '文件',
                            })}
                          </span>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <span className={styles.ftpLocalDirSel}>
                      <MyIcon
                        type="iconwenjianjiakuangx"
                        // title={`${formatMessage({ id: 'remoteAccess.SelectFileOrFolder' })}`}
                      />
                      <input
                        className={styles.inputFile}
                        type="file"
                        id="catlog"
                        webkitdirectory="true"
                        mozdirectory="true"
                        ref={c => {
                          this.catlogUrl = c;
                        }}
                        onChange={this.catlogChange}
                      />
                      <input
                        className={styles.inputFile}
                        type="file"
                        id="file"
                        ref={c => {
                          this.fileUrl = c;
                        }}
                        onChange={this.fileChange}
                      />
                    </span>
                  </Dropdown>
                  <span
                    className={styles.ftpLocalDirUp}
                    onClick={() => {
                      const catlogAndFileLength = this.getFileLength(seledRows);
                      this.setState(
                        {
                          catlogAndFileLength,
                        },
                        () => {
                          this.upfile();
                        }
                      );
                    }}
                  >
                    <MyIcon
                      type="iconshangchuankuangx"
                      title={`${formatMessage({ id: 'remoteAccess.Upload' })}`}
                    />
                  </span>
                </div>
                <div className={styles.dirCon}>
                  <div>
                    <Table
                      className={styles.localDirTable}
                      columns={this.localColumns}
                      rowSelection={rowSelection}
                      dataSource={dataList}
                      rowKey="fileListId"
                      pagination={false}
                      size="small"
                      childrenColumnName={null}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.ftpRemoteCon}>
                <Tabs
                  hideAdd
                  onChange={this.onChange}
                  activeKey={`${datasourceId}`}
                  type="editable-card"
                  onEdit={this.onEdit}
                  className={styles.tabCon}
                >
                  {this.getFtpUpModule()}
                </Tabs>
              </div>
            </div>
            <div className={styles.commandCon}>
              <Tabs type="card">
                <TabPane tab={`${formatMessage({ id: 'remoteAccess.ExecutionMessage' })}`} key="1">
                  <div className={`${styles.panChild} ${styles.commandOutCon}`}>
                    {commandList.map(item => {
                      if (item.statu) {
                        return (
                          <div key={item.itemKey}>
                            <div className={styles.comandItem}>
                              <span className={styles.lable}>{'COMMAND : > '}</span>
                              <span className={styles.content}>{item.command}</span>
                            </div>
                            <div className={styles.comandItem}>
                              <span className={styles.lable}>{'STATUS : > '}</span>
                              <span className={styles.content}>{item.statu}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className={styles.comandItem} key={item.itemKey}>
                          <span className={styles.lable}>{'COMMAND : > '}</span>
                          <span className={styles.content}>{item.command}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabPane>
                <TabPane tab={`${formatMessage({ id: 'remoteAccess.FileTransferQueue' })}`} key="2">
                  <div className={styles.panChild} style={{ background: '#fff' }}>
                    <Table
                      className={styles.localDirTable}
                      columns={this.upColumns}
                      dataSource={uploadList}
                      rowKey="fileUpListId"
                      pagination={false}
                      size="small"
                      childrenColumnName={null}
                      loading={reUploadLoading}
                    />
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default FtpModule;
