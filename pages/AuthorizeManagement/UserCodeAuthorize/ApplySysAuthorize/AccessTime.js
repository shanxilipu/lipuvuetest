import React from 'react';
import { Spin, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { randomWord, defaultHandleResponse } from '@/utils/utils';
import { AllowAccessTimeForm } from '@/pages/AuthorizeManagement/components/AllowAccessTime';
import {
  getAppUserAllowParam,
  saveAppUserAllowParam,
  deleteAppUserAllowParam,
} from '@/services/authorizeManagement/applySysAuthorize';

class AccessTime extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      key: randomWord(false, 6),
    };
  }

  componentDidMount() {
    const { selectedObj } = this.props;
    if (selectedObj.appUserCode) {
      this.getData();
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedObj } = this.props;
    const { selectedObj: preObj } = prevProps;
    if (selectedObj.appUserCode && selectedObj.appUserCode !== preObj.appUserCode) {
      this.getData();
    }
  }

  getData = () => {
    const {
      selectedObj: { appUserCode, appSysCode },
    } = this.props;
    if (!appSysCode && appSysCode !== 0 && appSysCode !== '0') {
      return false;
    }
    this.setState({ loading: true });
    getAppUserAllowParam({ appSysCode, appUserCode }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (data = []) => {
        this.setState({ data, key: randomWord(false, 6) });
      });
    });
  };

  handleSaveData = values => {
    const { data } = this.state;
    const {
      selectedObj: { appUserCode, appsysId },
    } = this.props;
    const paramCodes = Object.keys(values);
    const payload = [];
    paramCodes.forEach(paramCode => {
      const originData = data.find(o => o.paramCode === paramCode) || {};
      payload.push({
        ...originData,
        appUserCode,
        appsysId,
        paramCode,
        paramType: '3',
        paramValue: values[paramCode],
      });
    });
    if (!payload.length) {
      return false;
    }
    this.setState({ loading: true });
    saveAppUserAllowParam(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
        this.getData();
      });
    });
  };

  handleDeleteData = () => {
    const { data } = this.state;
    if (!data.length) {
      return false;
    }
    this.setState({ loading: true });
    deleteAppUserAllowParam(data.map(o => o.id)).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' }));
        this.setState({ data: [], key: randomWord(false, 6) });
      });
    });
  };

  render() {
    const { key, loading, data } = this.state;
    const initialValues = {};
    data.forEach(o => {
      const { paramCode, paramValue } = o;
      initialValues[paramCode] = paramValue;
    });
    return (
      <Spin spinning={loading}>
        <AllowAccessTimeForm
          key={key}
          initialValues={initialValues}
          handleSaveData={this.handleSaveData}
          handleDeleteData={this.handleDeleteData}
        />
      </Spin>
    );
  }
}
export default AccessTime;
