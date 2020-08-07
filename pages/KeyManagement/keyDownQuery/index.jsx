import React, { Component } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { debounce } from 'lodash-decorators';
import moment from 'moment';
import getLayoutPageSize from '@/utils/layoutUtils';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import CommonTable from '@/pages/AuditManagement/components/commonTable';
import { getToolTipColumns } from '@/utils/tableUtil';
import { checkLanguageIsEnglish } from '@/utils/utils';
import styles from './index.less';

const formatStr = 'YYYY-MM-DD HH:mm:ss';

const authTypeArr = [
  {
    id: 'FULL',
    name: `${formatMessage({ id: 'keyManagement.FullKeyAuthor' })}`,
  },
  {
    id: 'SINGLE',
    name: `${formatMessage({ id: 'keyManagement.SpecifyingKeyAuthor' })}`,
  },
];

const authLevelArr = [
  {
    id: 'SYSTEM',
    name: `${formatMessage({ id: 'keyManagement.SystemLevel' })}`,
  },
  {
    id: 'USER',
    name: `${formatMessage({ id: 'keyManagement.UserLevel' })}`,
  },
];

@connect(({ keyDownQuery, loading }) => ({
  pageSize: keyDownQuery.pageSize,
  pageIndex: keyDownQuery.pageIndex,
  rows: keyDownQuery.rows,
  total: keyDownQuery.total,
  encryptAlgorithm: keyDownQuery.encryptAlgorithm,
  loading: !!loading.models.keyDownQuery,
}))
class KeyDownQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.columns = [
      {
        title: formatMessage({ id: 'keyManagement.GenerateSysName' }),
        dataIndex: 'genAppSystemName',
        width: checkLanguageIsEnglish() ? 195 : 145,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.DownloadSystName' }),
        dataIndex: 'downloadAppSystemName',
        width: checkLanguageIsEnglish() ? 170 : 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.AuthorizationType' }),
        dataIndex: 'authType',
        width: checkLanguageIsEnglish() ? 150 : 120,
        className: 'model_table_ellipsis',
        render: text => {
          const arr = authTypeArr.filter(item => {
            return item.id === text;
          });
          return arr.length > 0 ? arr[0].name : '';
        },
      },
      {
        title: formatMessage({ id: 'keyManagement.AuthorizationLevel' }),
        dataIndex: 'authLevel',
        width: checkLanguageIsEnglish() ? 150 : 120,
        className: 'model_table_ellipsis',
        render: text => {
          const arr = authLevelArr.filter(item => {
            return item.id === text;
          });
          return arr.length > 0 ? arr[0].name : '';
        },
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyName' }),
        dataIndex: 'keyName',
        width: 150,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyAlgorithm' }),
        dataIndex: 'encryptAlgorithm',
        width: 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.VersionNumber' }),
        dataIndex: 'versionNum',
        width: checkLanguageIsEnglish() ? 150 : 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.DownloadTime' }),
        dataIndex: 'createTime',
        width: 150,
        className: 'model_table_ellipsis',
        render: v => {
          return v ? moment(new Date(v)).format(formatStr) : '';
        },
      },
    ];
  }

  componentDidMount() {
    window.onresize = this.handleResize;
    const pageSize = this.getPageSize();
    this.getComponentList({ pageSize });
    this.listAlgorithm2Bit();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    window.onresize = null;
    dispatch({
      type: 'keyCreatConfig/clearState',
    });
  }

  @debounce(100)
  handleResize = () => {
    const { pageSize } = this.props;
    const nextSize = this.getPageSize();
    if (pageSize === nextSize) return;
    this.getComponentList({ pageSize: nextSize, pageIndex: 1 });
  };

  // 获取当前页面的列表条数
  getPageSize = () => {
    const conHeight = this.tableList.clientHeight;
    const params = {
      height: conHeight - 20 - 37 - 42,
      itemHeight: 38,
      minPageSize: 5,
      maxRowMargin: 0,
    };
    const { count } = getLayoutPageSize(params);
    return count || 5;
  };

  // 钥算法下拉值
  listAlgorithm2Bit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyDownQuery/listAlgorithm2Bit',
    });
  };

  // 获取列表
  getComponentList = (payload = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyDownQuery/search',
      payload,
    });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const {
      genAppSystemName,
      authType,
      authLevel,
      downloadAppSystemName,
      keyName,
      encryptAlgorithm,
      versionNum,
      executDatetime,
      genAppSystemCode,
      downloadAppSystemCode,
      downloadAppUserCode,
      downloadAppUserName,
      keyCode,
    } = val;
    let createTimeStart = '';
    let createTimeEnd = '';
    if (executDatetime && executDatetime[0]) {
      createTimeStart = moment(executDatetime[0]).format(formatStr);
      createTimeEnd = moment(executDatetime[1]).format(formatStr);
    }
    const payload = {
      genAppSystemName,
      authType,
      authLevel,
      downloadAppSystemName,
      keyName,
      encryptAlgorithm,
      versionNum,
      createTimeStart,
      createTimeEnd,
      genAppSystemCode,
      downloadAppSystemCode,
      downloadAppUserCode,
      downloadAppUserName,
      keyCode,
      pageIndex: 1,
    };

    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      genAppSystemName: '',
      authType: '',
      authLevel: '',
      downloadAppSystemName: '',
      keyName: '',
      encryptAlgorithm: '',
      versionNum: '',
      createTimeStart: null,
      createTimeEnd: null,
      genAppSystemCode: '',
      downloadAppSystemCode: '',
      downloadAppUserCode: '',
      downloadAppUserName: '',
      keyCode: '',
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 分页查询
  handleTableChange = pagination => {
    const { current: pageIndex, pageSize } = pagination;
    const { pageSize: prePageSize } = this.props;
    const param = {
      pageIndex,
      pageSize,
    };
    if (prePageSize !== pageSize) {
      param.pageIndex = 1;
    }
    this.getComponentList(param);
  };

  expendContent = record => {
    return (
      <div className={styles.expendContentCon}>
        <div className={styles.expendContentItem}>
          <span className={styles.label}>
            {`${formatMessage({ id: 'keyManagement.GenerateSysCode' })}:`}
          </span>
          <Tooltip title={record.genAppSystemCode ? record.genAppSystemCode : '-'}>
            <span className={styles.expendContentMain}>
              {record.genAppSystemCode ? record.genAppSystemCode : '-'}
            </span>
          </Tooltip>
        </div>
        <div className={styles.expendContentItem}>
          <span className={styles.label}>
            {`${formatMessage({ id: 'keyManagement.DownloadSystCode' })}:`}
          </span>
          <Tooltip title={record.downloadAppSystemCode ? record.downloadAppSystemCode : '-'}>
            <span className={styles.expendContentMain}>
              {record.downloadAppSystemCode ? record.downloadAppSystemCode : '-'}
            </span>
          </Tooltip>
        </div>
        <div className={styles.expendContentItem}>
          <span className={styles.label}>{`${formatMessage({ id: 'keyManagement.KeyID' })}:`}</span>
          <Tooltip title={record.keyCode ? record.keyCode : '-'}>
            <span className={styles.expendContentMain}>
              {record.keyCode ? record.keyCode : '-'}
            </span>
          </Tooltip>
        </div>
        <div className={styles.expendContentItem}>
          <span className={styles.label}>
            {`${formatMessage({ id: 'keyManagement.DownloadUserCode' })}:`}
          </span>
          <Tooltip title={record.downloadAppUserCode ? record.downloadAppUserCode : '-'}>
            <span className={styles.expendContentMain}>
              {record.downloadAppUserCode ? record.downloadAppUserCode : '-'}
            </span>
          </Tooltip>
        </div>
        <div className={styles.expendContentItem}>
          <span className={styles.label}>
            {`${formatMessage({ id: 'keyManagement.DownloadUserName' })}:`}
          </span>
          <Tooltip title={record.downloadAppUserName ? record.downloadAppUserName : '-'}>
            <span className={styles.expendContentMain}>
              {record.downloadAppUserName ? record.downloadAppUserName : '-'}
            </span>
          </Tooltip>
        </div>
      </div>
    );
  };

  render() {
    const { rows, total, pageIndex, pageSize, loading, encryptAlgorithm } = this.props;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
    };

    const searchArr = [
      {
        type: 'input',
        name: 'genAppSystemName',
        label: `${formatMessage({ id: 'keyManagement.GenerateSysName' })}`,
        colSpan: 8,
      },
      {
        type: 'select',
        name: 'authType',
        label: `${formatMessage({ id: 'keyManagement.AuthorizationType' })}`,
        colSpan: 8,
        selArr: authTypeArr,
      },
      {
        type: 'select',
        name: 'authLevel',
        label: `${formatMessage({ id: 'keyManagement.AuthorizationLevel' })}`,
        colSpan: 8,
        selArr: authLevelArr,
      },
      {
        type: 'input',
        name: 'downloadAppSystemName',
        label: `${formatMessage({ id: 'keyManagement.DownloadSystName' })}`,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'keyName',
        label: `${formatMessage({ id: 'keyManagement.KeyName' })}`,
        colSpan: 8,
      },
      {
        type: 'select',
        name: 'encryptAlgorithm',
        label: `${formatMessage({ id: 'keyManagement.KeyAlgorithm' })}`,
        colSpan: 8,
        selArr: encryptAlgorithm,
      },
      {
        type: 'input',
        name: 'versionNum',
        label: `${formatMessage({ id: 'keyManagement.VersionNumber' })}`,
        colSpan: 8,
      },
      {
        type: 'rangePicker',
        name: 'executDatetime',
        label: `${formatMessage({ id: 'keyManagement.DownloadTime' })}`,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'genAppSystemCode',
        label: `${formatMessage({ id: 'keyManagement.GenerateSysCode' })}`,
        noExand: true,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'downloadAppSystemCode',
        label: `${formatMessage({ id: 'keyManagement.DownloadSystCode' })}`,
        noExand: true,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'downloadAppUserCode',
        label: `${formatMessage({ id: 'keyManagement.DownloadUserCode' })}`,
        noExand: true,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'downloadAppUserName',
        label: `${formatMessage({ id: 'keyManagement.DownloadUserName' })}`,
        noExand: true,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'keyCode',
        label: `${formatMessage({ id: 'keyManagement.KeyID' })}`,
        noExand: true,
        colSpan: 8,
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 16,
        isExpand: true,
        handleResize: this.handleResize,
      },
    ];
    const columns = getToolTipColumns(this.columns);
    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        <QueryConditions searchArr={searchArr} customExpand={true} />
        <div
          className={styles.tableCon}
          ref={c => {
            this.tableList = c;
          }}
        >
          <CommonTable
            columns={columns}
            expendDiv={true}
            expendContent={this.expendContent}
            list={rows}
            loading={loading}
            pagination={pagination}
            handleTableChange={this.handleTableChange}
            rowKey="id"
          />
        </div>
      </div>
    );
  }
}

export default KeyDownQuery;
