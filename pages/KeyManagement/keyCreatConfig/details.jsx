import React, { Component } from 'react';
import { connect } from 'dva';
import { Drawer, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { debounce } from 'lodash-decorators';
import getLayoutPageSize from '@/utils/layoutUtils';
import CommonTable from '@/pages/AuditManagement/components/commonTable';
import BtnCom from '../components/BtnCom';
import styles from './index.less';

const formatStr = 'YYYY-MM-DD HH:mm:ss';

@connect(({ loading }) => ({
  loading: !!loading.effects['keyCreatConfig/listVersion'],
}))
class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      total: 0,
      pageIndex: 1,
      pageSize: 10,
    };
    this.columns = [
      {
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'keyManagement.VersionNumber' })}`}>
              {formatMessage({ id: 'keyManagement.VersionNumber' })}
            </span>
          );
        },
        dataIndex: 'versionNum',
        width: '15%',
        className: 'model_table_ellipsis',
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
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'keyManagement.PublicKeyString' })}`}>
              {formatMessage({ id: 'keyManagement.PublicKeyString' })}
            </span>
          );
        },
        dataIndex: 'publicKey',
        width: '25%',
        className: 'model_table_word',
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
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'keyManagement.PrivateKeyString' })}`}>
              {formatMessage({ id: 'keyManagement.PrivateKeyString' })}
            </span>
          );
        },
        dataIndex: 'privateKey',
        width: '25%',
        className: 'model_table_ellipsis',
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
        title: () => {
          return (
            <span title={`${formatMessage({ id: 'keyManagement.BuildTime' })}`}>
              {formatMessage({ id: 'keyManagement.BuildTime' })}
            </span>
          );
        },
        dataIndex: 'createTime',
        width: '35%',
        className: 'model_table_ellipsis',
        render: v => {
          const text = v ? moment(new Date(v)).format(formatStr) : '';
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
    this.timer = setInterval(() => {
      if (this.tableListD) {
        clearInterval(this.timer);
        window.onresize = this.handleResize;
        const pageSize = this.getPageSize();
        this.setState(
          {
            pageSize,
          },
          () => {
            this.listVersion();
          }
        );
      }
    }, 500);
  }

  componentWillUnmount() {
    window.onresize = null;
    clearInterval(this.timer);
  }

  @debounce(100)
  handleResize = () => {
    const { pageSize } = this.state;
    const nextSize = this.getPageSize();
    if (pageSize === nextSize) return;
    this.setState(
      {
        pageSize: nextSize,
        pageIndex: 1,
      },
      () => {
        this.listVersion();
      }
    );
  };

  // 获取当前页面的列表条数
  getPageSize = () => {
    if (!this.tableListD) {
      return false;
    }
    const conHeight = this.tableListD.clientHeight;
    const params = {
      height: conHeight - 37 - 42,
      itemHeight: 38,
      minPageSize: 5,
      maxRowMargin: 0,
    };
    const { count } = getLayoutPageSize(params);
    return count || 5;
  };

  listVersion = () => {
    const { pageIndex, pageSize } = this.state;
    const { dispatch, actItem } = this.props;
    const { id } = actItem;
    const payload = { keyId: id, pageIndex, pageSize };
    dispatch({
      type: 'keyCreatConfig/listVersion',
      payload,
    }).then(res => {
      const { resultCode, resultObject = {} } = res;
      if (resultCode === '0') {
        const { pageInfo = {}, rows = [] } = resultObject;
        const { total } = pageInfo;
        this.setState({
          total,
          rows,
        });
      }
    });
  };

  // 分页查询
  handleTableChange = pagination => {
    const { current: pageIndex, pageSize } = pagination;
    const { pageSize: prePageSize } = this.state;
    const param = {
      pageIndex,
      pageSize,
    };
    if (prePageSize !== pageSize) {
      param.pageIndex = 1;
    }
    this.setState(
      {
        ...param,
      },
      () => {
        this.listVersion();
      }
    );
  };

  hideModal = () => {
    const { showModelFlag } = this.props;
    if (showModelFlag) {
      showModelFlag('showDetails', false);
    }
  };

  render() {
    const { rows, total, pageSize, pageIndex } = this.state;
    const { showModel, loading } = this.props;
    const btnArr = [
      {
        name: `${formatMessage({ id: 'COMMON_CLOSE' })}`,
        key: 'cancel',
        onClick: this.hideModal,
        type: 'primary',
      },
    ];
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
    };
    return (
      <Drawer
        title={formatMessage({ id: 'keyManagement.KeyDetails' })}
        visible={showModel}
        onClose={() => {
          this.hideModal();
        }}
        width="600px"
        className={styles.detailsCon}
      >
        <div className={styles.detailsMain}>
          <div
            className={styles.tableCon}
            ref={c => {
              this.tableListD = c;
            }}
          >
            <CommonTable
              columns={this.columns}
              expendDiv={false}
              list={rows}
              loading={loading}
              pagination={pagination}
              handleTableChange={this.handleTableChange}
              rowKey="itemKey"
            />
          </div>
          <BtnCom btnArr={btnArr} />
        </div>
      </Drawer>
    );
  }
}

export default Details;
