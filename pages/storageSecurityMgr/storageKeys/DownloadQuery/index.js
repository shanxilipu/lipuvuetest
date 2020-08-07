import React from 'react';
import moment from 'moment';
import { Badge } from 'antd';
import { formatMessage } from 'umi/locale';
import CommonFilterTableBox from '@/components/CommonFilterTableBox';
import { DEFAULT_DATE_FORMAT } from '@/pages/common/const';
import { getKeyDownloadRecords } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import { getCommonPagedResponse } from '@/utils/utils';

const renderTime = t => (t ? moment(t).format(DEFAULT_DATE_FORMAT) : '');
const renderDownloadResult = res => {
  const texts = {
    success: formatMessage({ id: 'storage.encrypt.download.success', defaultMessage: '下载成功' }),
    abnormal: formatMessage({
      id: 'storage.encrypt.download.abnormal',
      defaultMessage: '异常中断',
    }),
    timeout: formatMessage({
      id: 'storage.encrypt.download.timeout',
      defaultMessage: '超过失效时间',
    }),
    nottime: formatMessage({
      id: 'storage.encrypt.download.nottime',
      defaultMessage: '未到生效时间',
    }),
  };
  const states = { success: 'success', abnormal: 'error', timeout: 'warning', nottime: 'warning' };
  return <Badge text={texts[res]} status={states[res]} />;
};

class DownloadQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
    };
    this.searchParams = {};
    this.searchArr = [
      { name: 'genTabCode', label: formatMessage({ id: 'TABLE_CODE', defaultMessage: '表编码' }) },
      {
        name: 'userCode',
        label: formatMessage({ id: 'USERMGR_USER_CODE', defaultMessage: '用户编码' }),
      },
      {
        name: 'effectTime',
        startName: 'startActDate',
        endName: 'endActDate',
        label: formatMessage({ id: 'keyAuth.enableStartTime', defaultMessage: '生效时间' }),
        type: 'rangePicker',
      },
      {
        name: 'expiredTime',
        startName: 'startExpDate',
        endName: 'endExpDate',
        label: formatMessage({ id: 'keyAuth.expiredTime', defaultMessage: '失效时间' }),
        type: 'rangePicker',
      },
      {
        name: 'downloadTime',
        startName: 'startDownTime',
        endName: 'endDownTime',
        label: formatMessage({ id: 'DOWNLOAD_DATE', defaultMessage: '下载时间' }),
        type: 'rangePicker',
      },
    ];
    this.columns = [
      {
        title: formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' }),
        dataIndex: 'dataSources',
        width: 120,
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'TABLE_CODE', defaultMessage: '表编码' }),
        dataIndex: 'genTabCode',
        width: 120,
        ellipsis: true,
      },
      {
        width: 100,
        ellipsis: true,
        dataIndex: 'userCode',
        title: formatMessage({ id: 'USERMGR_USER_CODE', defaultMessage: '用户编码' }),
      },
      {
        width: 120,
        ellipsis: true,
        dataIndex: 'actDate',
        render: renderTime,
        title: formatMessage({ id: 'keyAuth.enableStartTime', defaultMessage: '生效时间' }),
      },
      {
        width: 120,
        ellipsis: true,
        dataIndex: 'expDate',
        render: renderTime,
        title: formatMessage({ id: 'keyAuth.expiredTime', defaultMessage: '失效时间' }),
      },
      {
        width: 120,
        ellipsis: true,
        dataIndex: 'downTime',
        render: renderTime,
        title: formatMessage({ id: 'DOWNLOAD_DATE', defaultMessage: '下载时间' }),
      },
      {
        width: 120,
        dataIndex: 'downResult',
        render: renderDownloadResult,
        title: formatMessage({ id: 'keyManagement.DownloadResult', defaultMessage: '下载结果' }),
      },
    ];
  }

  handleSearch = params => {
    this.searchParams = params;
    const {
      pageInfo: { pageSize },
    } = this.state;
    this.getData(1, pageSize);
  };

  getData = (pageIndex = 1, pageSize = 10) => {
    this.setState({ loading: true });
    const payload = { pageIndex, pageSize, ...this.searchParams };
    getKeyDownloadRecords(payload).then(response => {
      this.setState({ loading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ list, pageInfo });
      }
    });
  };

  render() {
    const { loading, list, pageInfo } = this.state;
    return (
      <CommonFilterTableBox
        rowKey="keyDownId"
        loading={loading}
        dataSource={list}
        pageInfo={pageInfo}
        columns={this.columns}
        onChange={this.getData}
        advancedFilterProps={{
          canFold: false,
          columnNumber: 3,
          searchArr: this.searchArr,
          onSearch: this.handleSearch,
        }}
      />
    );
  }
}
export default DownloadQuery;
