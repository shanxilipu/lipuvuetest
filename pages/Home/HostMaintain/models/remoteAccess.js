import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { queryHosts, loginConn, lsFile, closeConn } from '@/services/hostMaintain';

function getHostTree(arr) {
  const parentObj = {
    datasourceName: `${formatMessage({ id: 'remoteAccess.RemoteHost' })}`,
    datasourceId: -1,
  };
  parentObj.children = arr;
  return [parentObj];
}

export default {
  namespace: 'remoteAccess',

  state: {
    searchName: '',
    mode: 'console', // 选择的是ssh还是ftp
    sshHostList: [], // ssh主机列表
    ftpHostList: [], // ftp主机列表
    connectionConsoleArr: [], // 点击过的ssh服务器
    actConnectionHost: {}, // 当前选中的ssh服务器
    connectionFtpArr: [], // 点击过的ftp服务器
    actConnectionFtp: {}, // 当前选中的ftp服务器
    setConnectSSH: {},
  },

  effects: {
    // 主机列表查询
    *queryHosts({ payload }, { call, put }) {
      const formData = new FormData();

      Object.keys(payload).forEach(item => {
        formData.append(item, payload[item]);
      });

      const response = yield call(queryHosts, formData);
      const {
        resultCode,
        resultObject = [],
        resultMsg = `${formatMessage({ id: 'remoteAccess.QueryHostListFailed' })}`,
      } = response;
      if (resultCode === '0') {
        const { datasourceType: type } = payload;
        let params = {};
        if (type === 'ssh') {
          const sshHostList = getHostTree(resultObject);
          params = { sshHostList };
        } else {
          const ftpHostList = getHostTree(resultObject);
          params = { ftpHostList };
        }
        yield put({
          type: 'save',
          payload: {
            ...params,
          },
        });
      } else {
        message.error(resultMsg);
      }
    },
    // ftp登录连接
    *loginConn({ payload }, { call }) {
      const response = yield call(loginConn, payload);
      return response;
    },

    // 展示文件夹下的信息
    *lsFile({ payload }, { call }) {
      const response = yield call(lsFile, payload);
      return response;
    },

    // ftp登录连接
    *closeConn({ payload }, { call }) {
      const response = yield call(closeConn, payload);
      return response;
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeConectHostSet(state, { payload }) {
      const { setConnectSSH } = state;
      const { datasourceId, setData } = payload;
      const oldSet = setConnectSSH[datasourceId] || {};
      setConnectSSH[datasourceId] = { ...oldSet, ...setData };
      return {
        ...state,
        setConnectSSH: { ...setConnectSSH },
      };
    },

    clearState(state) {
      return {
        ...state,
        searchName: '',
        mode: 'console', // 选择的是ssh还是ftp
        sshList: [],
        ftpList: [],
        connectionConsoleArr: [], // 点击过的ssh服务器
        actConnectionHost: {}, // 当前选中的ssh服务器
        connectionFtpArr: [], // 点击过的ftp服务器
        actConnectionFtp: {}, // 当前选中的ftp服务器
        setConnectSSH: [],
      };
    },
  },
};
