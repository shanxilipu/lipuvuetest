import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Tooltip, Button, message, Popconfirm, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import { debounce } from 'lodash-decorators';
import moment from 'moment';
import getLayoutPageSize from '@/utils/layoutUtils';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import SelTable from '@/pages/AuditManagement/components/SelTable';
import Details from './details';
import CreatKey from './creatKey';
import { checkLanguageIsEnglish } from '@/utils/utils';
import styles from './index.less';

const { confirm } = Modal;
const formatStr = 'YYYY-MM-DD HH:mm:ss';
const keyFrequencyArr = [
  {
    id: 'longTerm',
    name: `${formatMessage({ id: 'keyManagement.LongTerm' })}`,
  },
  {
    id: 'temp',
    name: `${formatMessage({ id: 'keyManagement.shortTerm' })}`,
  },
];

@connect(({ keyCreatConfig, loading }) => ({
  pageSize: keyCreatConfig.pageSize,
  pageIndex: keyCreatConfig.pageIndex,
  rows: keyCreatConfig.rows,
  total: keyCreatConfig.total,
  encryptAlgorithm: keyCreatConfig.encryptAlgorithm,
  loading:
    !!loading.effects['keyCreatConfig/search'] || !!loading.effects['keyCreatConfig/deleteKeys'],
}))
class KeyCreatConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      showDetails: false,
      showCreatKey: false,
      actItem: {},
    };
    this.columns = [
      {
        title: formatMessage({ id: 'keyManagement.ApplicationSysName' }),
        dataIndex: 'genAppSystemName',
        width: checkLanguageIsEnglish() ? 160 : 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.ApplicationSysCoding' }),
        dataIndex: 'genAppSystem',
        width: checkLanguageIsEnglish() ? 180 : 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyName' }),
        dataIndex: 'keyName',
        width: 150,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyID' }),
        dataIndex: 'keyCode',
        width: 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.EncryptionAlgorithm' }),
        dataIndex: 'encryptAlgorithm',
        width: checkLanguageIsEnglish() ? 140 : 120,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.LifeCycle' }),
        dataIndex: 'keyFrequency',
        width: 120,
        className: 'model_table_ellipsis',
        render: text => {
          const arr = keyFrequencyArr.filter(item => {
            return item.id === text;
          });
          return arr.length > 0 ? arr[0].name : '';
        },
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyDescription' }),
        dataIndex: 'keyDescribe',
        width: 130,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'keyManagement.CreateTime' }),
        dataIndex: 'createTime',
        width: 150,
        className: 'model_table_ellipsis',
        render: v => {
          return v ? moment(v).format(formatStr) : '';
        },
      },
      {
        title: formatMessage({ id: 'OPERATE' }),
        key: 'operator',
        width: 200,
        fixed: 'right',
        render: record => {
          return (
            <Fragment>
              <Tooltip title={formatMessage({ id: 'keyManagement.KeyDetails' })}>
                <span
                  className={`${styles.operator} ${styles.mr10}`}
                  onClick={() => {
                    this.viewDetail(record);
                  }}
                >
                  {formatMessage({ id: 'keyManagement.KeyDetails' })}
                </span>
              </Tooltip>
              <Tooltip title={formatMessage({ id: 'keyManagement.CreateNewVersion' })}>
                <span
                  className={`${styles.operator} ${styles.mr10}`}
                  onClick={() => {
                    this.CreateNewVersion(record);
                  }}
                >
                  {formatMessage({ id: 'keyManagement.CreateNewVersion' })}
                </span>
              </Tooltip>
              <Popconfirm
                title={formatMessage({ id: 'COMMON_DELETE_TIP' })}
                onConfirm={() => {
                  this.delete([record.id]);
                }}
              >
                <span className={styles.operator}>{formatMessage({ id: 'COMMON_DELETE' })}</span>
              </Popconfirm>
            </Fragment>
          );
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
      height: conHeight - 37 - 25 - 30,
      itemHeight: 43,
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
      type: 'keyCreatConfig/listAlgorithm2Bit',
    });
  };

  // 获取列表
  getComponentList = (payload = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyCreatConfig/search',
      payload,
    });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const {
      genAppSystem,
      genAppSystemName,
      keyCode,
      keyName,
      executDatetime,
      keyDescribe,
      encryptAlgorithm,
      keyFrequency,
    } = val;
    let createTimeStart = '';
    let createTimeEnd = '';
    if (executDatetime && executDatetime[0]) {
      createTimeStart = moment(executDatetime[0]).format(formatStr);
      createTimeEnd = moment(executDatetime[1]).format(formatStr);
    }
    const payload = {
      genAppSystem,
      genAppSystemName,
      keyCode,
      keyName,
      createTimeStart,
      createTimeEnd,
      keyDescribe,
      encryptAlgorithm,
      keyFrequency,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      genAppSystem: '',
      genAppSystemName: '',
      keyCode: '',
      keyName: '',
      createTimeStart: null,
      createTimeEnd: null,
      keyDescribe: '',
      encryptAlgorithm: '',
      keyFrequency: '',
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 分页查询
  handleTableChange = (pageIndex, pageSize) => {
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

  getSel = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  };

  batchDelete = () => {
    const $this = this;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length <= 0) {
      message.info(`${formatMessage({ id: 'keyManagement.PleaseSelKeyFirst' })}`);
      return false;
    }
    confirm({
      title: `${formatMessage({ id: 'COMMON_BATCH_DELETE_TIP' })}`,
      onOk() {
        $this.delete(selectedRowKeys);
      },
      onCancel() {
        return false;
      },
      cancelText: `${formatMessage({ id: 'COMMON_CANCEL' })}`,
      okText: `${formatMessage({ id: 'COMMON_OK' })}`,
    });
  };

  delete = ids => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyCreatConfig/deleteKeys',
      payload: { ids },
    }).then((res = {}) => {
      const { resultCode } = res;
      if (resultCode === '0') {
        message.success(`${formatMessage({ id: 'applySysUserManagement.SuccessfullyDeleted' })}`);
        this.getComponentList();
      }
    });
  };

  viewDetail = record => {
    this.setState({
      actItem: { ...record },
      showDetails: true,
    });
  };

  CreateNewVersion = record => {
    this.setState({
      actItem: { ...record },
      showCreatKey: true,
    });
  };

  showModelFlag = (key, flag, refresh) => {
    this.setState({
      [key]: flag,
    });
    if (refresh) {
      this.getComponentList();
    }
  };

  render() {
    const { selectedRows, showDetails, showCreatKey, actItem } = this.state;
    const { rows, total, pageIndex, pageSize, loading, encryptAlgorithm } = this.props;
    const data = {
      list: rows,
      pagination: {
        current: pageIndex,
        total,
        pageSize,
      },
    };

    const searchArr = [
      {
        type: 'input',
        name: 'genAppSystem',
        label: `${formatMessage({ id: 'keyManagement.ApplicationSysCoding' })}`,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'genAppSystemName',
        label: `${formatMessage({ id: 'keyManagement.ApplicationSysName' })}`,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'keyCode',
        label: `${formatMessage({ id: 'keyManagement.KeyID' })}`,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'keyName',
        label: `${formatMessage({ id: 'keyManagement.KeyName' })}`,
        colSpan: 8,
      },
      {
        type: 'rangePicker',
        name: 'executDatetime',
        label: `${formatMessage({ id: 'keyManagement.CreateTime' })}`,
        colSpan: 8,
      },
      {
        type: 'input',
        name: 'keyDescribe',
        label: `${formatMessage({ id: 'keyManagement.KeyDescription' })}`,
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
        type: 'select',
        name: 'keyFrequency',
        label: `${formatMessage({ id: 'keyManagement.LifeCycle' })}`,
        colSpan: 8,
        selArr: keyFrequencyArr,
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 8,
        isExpand: false,
      },
    ];

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        <QueryConditions searchArr={searchArr} />
        <div className={styles.mainCon}>
          <div className={styles.btnCon}>
            <Button
              type="primary"
              className={styles.mr10}
              onClick={() => {
                this.setState({ showCreatKey: true, actItem: {} });
              }}
            >
              {formatMessage({ id: 'keyManagement.CreateNewKey' })}
            </Button>
            <Button type="default" onClick={this.batchDelete}>
              {formatMessage({ id: 'COMMON_BATCH_DELETE' })}
            </Button>
          </div>
          <div
            className={styles.tableCon}
            ref={c => {
              this.tableList = c;
            }}
          >
            <SelTable
              scrollX
              data={data}
              primaryKey="id"
              onChange={this.handleTableChange}
              onGetSel={this.getSel}
              columns={this.columns}
              initVlaue={selectedRows}
              btnArr={false}
              isLoading={loading}
            />
          </div>
        </div>
        {showDetails && (
          <Details
            showModel={showDetails}
            showModelFlag={this.showModelFlag}
            actItem={JSON.parse(JSON.stringify(actItem))}
          />
        )}
        <CreatKey showModel={showCreatKey} showModelFlag={this.showModelFlag} actItem={actItem} />
      </div>
    );
  }
}

export default KeyCreatConfig;
