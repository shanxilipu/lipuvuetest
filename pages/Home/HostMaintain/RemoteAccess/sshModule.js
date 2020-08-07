import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
// eslint-disable-next-line import/no-extraneous-dependencies
import openSocket from 'socket.io-client';
import * as Terminal from 'xterm/dist/xterm';
import * as fit from 'xterm/dist/addons/fit/fit';
import moment from 'moment';
import { Button, message, Tooltip } from 'antd';
import MyIcon from '@/components/MyIcon';
import SSHSetModal from './SSHSetModal';
import styles from './index.less';
import 'xterm/dist/xterm.css';

import {
  getSSHServerUrl,
  saveSSHConsoleLog,
  getUserLastLogin,
  checkAccessRights,
} from '../../../../services/hostMaintain';

// const sshHttp = 'http://10.45.47.65:2222';
const sshConnectEmit = 'connectData';
const sshNetSuccess = 'sshNetSuccess';
const getLoginSuccess = 'getLoginSuccess';
const noAuthAccess = 'noAuthAccess';
const overConnectTime = 'overConnectTime';
const maxLine = 20;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const keyCode = {
  enter: 'Enter',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  backspace: 'Backspace',
};

@connect(({ remoteAccess }) => ({ setConnectSSH: remoteAccess.setConnectSSH }))
class SSHModule extends React.PureComponent {
  loginTime = '';

  handleCommandTime = '';

  // 记录当前执行的命令行
  commandArr = [''];

  commandIndex = 0;

  cursorPosition = {
    x: 0,
    y: 0,
  };

  socket;

  sshServerUrl = null;

  componentDidMount() {
    window.addEventListener('resize', this.windowChange);
    getSSHServerUrl().then(response => {
      const { resultCode, resultObject } = response;
      if (resultCode === '0') {
        this.sshServerUrl = resultObject.standDisplayValue;
        this.linkSocket();
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowChange);
    // 断开连接
    this.closeLink();

    // 时间还没有超时的话
    if (this.disConnectTimer) clearTimeout(this.disConnectTimer);
  }

  windowChange = () => {
    if (this.term) {
      this.term.fit();
      this.term.scrollToBottom();
    }
  };

  removeTerminalContainerChild = () => {
    const htmlContent = this.terminalContainer;

    while (htmlContent && htmlContent.hasChildNodes()) {
      // 当div下还存在子节点时 循环继续
      htmlContent.removeChild(htmlContent.firstChild);
    }
  };

  linkSocket = setData => {
    const {
      setConnectSSH,
      linkInfo: { datasourceId },
    } = this.props;
    const setInfo = setData || setConnectSSH[datasourceId] || {};
    this.socket = openSocket(this.sshServerUrl);
    this.removeTerminalContainerChild();
    Terminal.applyAddon(fit);
    this.term = new Terminal({
      rendererType: 'canvas', // 渲染类型
      convertEol: true, // 启用时，光标将设置为下一行的开头
      scrollback: setInfo.scrollBack || 100, // 终端中的回滚量
      cursorStyle: 'underline', // 光标样式
      cursorBlink: true, // 光标闪烁
      theme: {
        foreground: 'yellow', // 字体
        background: '#060101', // 背景色
      },
    });
    this.term.open(this.terminalContainer);
    this.term.fit();

    this.bindSocketEvent();
    this.xtermBindEvent();
    this.connectNodeSSH();
  };

  connectNodeSSH = () => {
    const {
      linkInfo: { ip, username, password, datasourceId },
    } = this.props;

    if (this.loginTime) return;
    // 获取登录的操作事件
    this.loginTime = new Date().getTime();
    const paramsData = new FormData();
    paramsData.append('datasourceId', datasourceId);
    paramsData.append('signature-sessionId', window.name);
    // 判断当前的主机时候可以访问
    checkAccessRights(paramsData).then((res = {}) => {
      const { resultCode, resultObject } = res;
      if (resultCode !== '0') {
        message.error(res.resultMsg);
      } else {
        // 可以访问的时长要处理 超过改时长断开链接，提示连接超时雪瑶重新连接
        this.setTimeToDisconnect(resultObject);
        this.socket.emit('createNewServer', {
          msgId: sshConnectEmit,
          ip,
          username,
          password,
          sshNetSuccess,
          getLoginSuccess,
          overConnectTime,
        });
      }
    });
  };

  // 多少s过后就自动断开连接
  setTimeToDisconnect = time => {
    this.disConnectTimer = setTimeout(() => {
      this.socket.emit(overConnectTime);
      clearTimeout(this.disConnectTimer);
    }, time * 1000);
  };

  bindSocketEvent = () => {
    // 连接后的数据显示
    this.socket.on(sshConnectEmit, data => {
      this.term.write(data);
    });

    this.socket.on(noAuthAccess, data => {
      this.term.write(data);
    });

    this.socket.on(sshNetSuccess, () => {
      // 保存登录
      this.saveSSHLog('login', { executDatetime: this.loginTime });

      // 获取上一次登录的时间和ip
      this.handelGetlastLoginInfo();
    });
  };

  xtermBindEvent = () => {
    // 只能用key keydown 空格不触发；keypress没有事件源
    this.term.attachCustomKeyEventHandler(e => {
      const curcommand = this.commandArr[this.commandArr.length - 1] || '';
      switch (e.code) {
        // 回车 执行命令处理
        case keyCode.enter:
          this.handleCommandTime = new Date().getTime();
          break;
        // 上一步
        case keyCode.arrowUp:
          this.commandIndex--;
          this.handleUpdateLastCommand(this.commandArr[this.commandIndex]);
          break;
        // 下一步
        case keyCode.arrowDown:
          this.commandIndex++;
          this.handleUpdateLastCommand(this.commandArr[this.commandIndex]);
          break;
        // 回退
        case keyCode.backspace:
          this.handleUpdateLastCommand(curcommand.substring(0, curcommand.length - 1));
          break;
        // 默认
        default:
          this.handleUpdateLastCommand(`${curcommand}${e.key}`);
      }
    });

    // 获取
    this.term.on('refresh', () => {
      // 执行了clear命令？？
      // 行列处理
      const { cursorX, cursorY } = this.term.buffer;
      this.cursorPosition.x = cursorX;
      this.cursorPosition.y = cursorY + this.term.buffer._buffer.ybase + 1;
      this.termOverMaxLine();
      this.forceUpdate();
    });

    this.term.on('data', data => {
      if (this.handleCommandTime) {
        this.handleCommand();
      }
      this.socket.emit(sshConnectEmit, data);
    });
  };

  // 超出最大行久清空
  termOverMaxLine = () => {
    const { setConnectSSH, linkInfo } = this.props;
    const { datasourceId } = linkInfo;
    const setInfo = setConnectSSH[datasourceId] || {};
    const curRows = this.cursorPosition.y;
    const { maxRows = maxLine } = setInfo;
    if (curRows <= maxRows) return;
    this.term.selectLines(0, curRows - maxRows);
    this.term.clearSelection();
  };

  handelGetlastLoginInfo = () => {
    const {
      linkInfo: { datasourceId },
    } = this.props;
    getUserLastLogin({
      datasourceId,
      'signature-sessionId': window.name,
    }).then((res = {}) => {
      // 登录结束
      this.loginTime = '';
      const { resultCode, resultObject } = res;
      if (resultCode === '0' && resultObject) {
        const { sourceIp, finishDatetime } = resultObject;
        const lastLoginMsg = `${formatMessage({ id: 'remoteAccess.LastLoginTime' })}: ${moment(
          finishDatetime
        ).format(dateFormat)} ${formatMessage({ id: 'remoteAccess.LoginIp' })}: ${sourceIp}\n`;
        this.socket.emit(getLoginSuccess, lastLoginMsg);
      } else {
        this.socket.emit(getLoginSuccess, `${formatMessage({ id: 'remoteAccess.NoLoginInfo' })}\n`);
      }
    });
  };

  // 更新当前命令
  handleUpdateLastCommand = newCommand => {
    this.commandArr[this.commandArr.length - 1] = newCommand;
  };

  // 保存ssh操作日志
  saveSSHLog = (command = '', options = {}) => {
    const { linkInfo } = this.props;
    saveSSHConsoleLog({
      commandScript: command,
      commandCode: command.split(' ')[0],
      consoleCode: linkInfo.datasourceId,
      consoleIp: linkInfo.ip,
      consoleName: linkInfo.datasourceName,
      consoleUserCode: linkInfo.username,
      finishDatetime: new Date().getTime(),
      executDatetime: new Date().getTime(),
      logSource: 1,
      'signature-sessionId': window.name,
      ...options,
    });
  };

  linkHost = () => {
    this.connectNodeSSH();
  };

  handleCommand = () => {
    const curcommand = this.commandArr[this.commandArr.length - 1] || '';
    this.saveSSHLog(curcommand, { executDatetime: this.handleCommandTime });

    this.handleCommandTime = '';
    this.commandIndex++;
    this.commandArr.push('');
  };

  // 关闭连接
  closeLink = (overTime = false) => {
    if (!this.socket) return;
    console.log('colse===>>>>', overTime);
    if (!overTime) {
      this.socket.emit(`${sshConnectEmit}close`);
    } else {
      this.socket.emit(`${overConnectTime}close`);
    }
  };

  openSSHSet = () => {
    const { dispatch, linkInfo } = this.props;

    dispatch({
      type: 'remoteAccess/changeConectHostSet',
      payload: {
        datasourceId: linkInfo.datasourceId,
        setData: {
          visible: true,
        },
      },
    });
  };

  closeSSHSet = () => {
    const { dispatch, linkInfo } = this.props;

    dispatch({
      type: 'remoteAccess/changeConectHostSet',
      payload: {
        datasourceId: linkInfo.datasourceId,
        setData: {
          visible: false,
        },
      },
    });
  };

  getSetSSHModalProps = () => {
    const { setConnectSSH, linkInfo } = this.props;
    const { datasourceId } = linkInfo;
    const setInfo = setConnectSSH[datasourceId] || {};
    return {
      visible: setInfo.visible,
      setInfo: {
        dataCode: 'utf8', // 默认的字符集
        scrollBack: 100, // 默认的滚动行数
        ...setInfo,
        ...linkInfo,
      },
      onCancel: this.closeSSHSet,
      onOk: this.changeSSHSet,
    };
  };

  // 修改SSH的配置的信息
  changeSSHSet = setOptions => {
    const { dispatch, linkInfo } = this.props;
    this.closeLink();
    this.linkSocket(setOptions);
    dispatch({
      type: 'remoteAccess/changeConectHostSet',
      payload: {
        datasourceId: linkInfo.datasourceId,
        setData: {
          ...setOptions,
          visible: false,
        },
      },
    });
  };

  render() {
    const sshSetModalProps = this.getSetSSHModalProps();
    return (
      <div className={styles.sshCon}>
        <div className={styles.sshBtnCon}>
          <Tooltip title={`${formatMessage({ id: 'remoteAccess.ConnectHost' })}`} key="connect">
            <Button onClick={this.linkSocket}>
              <MyIcon type="iconlianjiekuangx" />
            </Button>
          </Tooltip>
          <Tooltip title={`${formatMessage({ id: 'remoteAccess.Disconnect' })}`} key="disConnect">
            <Button
              onClick={() => {
                this.closeLink();
              }}
            >
              <MyIcon type="iconduankailianjiex" />
            </Button>
          </Tooltip>
          <Tooltip title={`${formatMessage({ id: 'remoteAccess.Reconnect' })}`} key="reconnect">
            <Button onClick={this.linkHost}>
              <MyIcon type="iconshuaxinkuangx" />
            </Button>
          </Tooltip>
          <Tooltip title={`${formatMessage({ id: 'remoteAccess.Setting' })}`} key="setting">
            <Button onClick={this.openSSHSet}>
              <MyIcon type="iconbuttonbeifenx" />
            </Button>
          </Tooltip>
        </div>
        <div
          className={styles.terminalCon}
          ref={c => {
            this.terminalContainer = c;
          }}
        />
        <div className={styles.terminFooter}>
          <div>
            {`${formatMessage({ id: 'remoteAccess.RowAndcolumn' })}`}：{this.cursorPosition.y}，
            {this.cursorPosition.x}
          </div>
          <div>{`${formatMessage({ id: 'remoteAccess.characterSet' })}`}：UTF-8</div>
          <div>{formatMessage({ id: 'remoteAccess.Ssh2Protocol' })}</div>
        </div>
        {sshSetModalProps.visible && <SSHSetModal {...sshSetModalProps} />}
      </div>
    );
  }
}

export default SSHModule;
