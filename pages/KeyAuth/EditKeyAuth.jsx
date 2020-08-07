import React, { PureComponent, Fragment } from 'react';
import { Drawer, message, Popconfirm } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import moment from 'moment';
import CommonTable from '@/pages/AuditManagement/components/commonTable';
import styles from './index.less';
import { AUTH_LEVEL_LIST, AUTH_STATE_LIST, AUTH_TYPE_LIST } from './models/keyAuth';

const PAGE_INFO = {
  pageIndex: 1,
  pageSize: 10,
};

@connect(({ loading, keyAuth }) => ({
  loading: loading.effects['keyAuth/listAuth'],
  stateLoading: loading.effects['keyAuth/reverseState'],
  keyAuth,
}))
class EditKeyAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: formatMessage({ id: 'keyAuth.keyCode', defaultMessage: '密钥标识' }),
        key: 'keyCode',
        dataIndex: 'keyCode',
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyAuth.keyName', defaultMessage: '密钥名称' }),
        key: 'keyName',
        dataIndex: 'keyName',
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyAuth.encry', defaultMessage: '加密算法' }),
        key: 'encryptAlgorithm',
        dataIndex: 'encryptAlgorithm',
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyAuth.enableStartTime', defaultMessage: '生效时间' }),
        key: 'enableStartTime',
        dataIndex: 'enableStartTime',
        ellipsis: true,
        width: '150px',
        render: text => {
          return text && moment(text).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: formatMessage({ id: 'keyAuth.enableEndTime', defaultMessage: '失效时间' }),
        key: 'enableEndTime',
        dataIndex: 'enableEndTime',
        ellipsis: true,
        width: '150px',
        render: text => {
          return text && moment(text).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: formatMessage({ id: 'keyAuth.authState', defaultMessage: '授权状态' }),
        key: 'state',
        dataIndex: 'state',
        ellipsis: true,
        align: 'center',
        width: '80px',
        render: text => {
          const [currItem] = AUTH_STATE_LIST.filter(item => item.value === text);
          return (currItem && currItem.name) || text;
        },
      },
      {
        title: formatMessage({ id: 'keyAuth.action', defaultMessage: '操作' }),
        key: 'action',
        dataIndex: 'action',
        align: 'right',
        ellipsis: true,
        width: '120px',
        render: (text, record) => (
          <Fragment>
            {record.state === AUTH_STATE_LIST[1].value && (
              <a onClick={() => this.handleSwitchItem(record)}>
                {formatMessage({ id: 'applySysUserManagement.Enable', defaultMessage: '启用' })}
              </a>
            )}
            {record.state === AUTH_STATE_LIST[0].value && (
              <a onClick={() => this.handleSwitchItem(record)}>
                {formatMessage({ id: 'applySysUserManagement.Disable', defaultMessage: '停用' })}
              </a>
            )}
            <Popconfirm
              title={formatMessage({ id: 'COMMON_DELETE_TIP', defaultMessage: '您确定要删除吗？' })}
              onConfirm={() => this.handleDelete(record)}
            >
              <a>{formatMessage({ id: 'keyAuth.delete', defaultMessage: '删除' })}</a>
            </Popconfirm>
          </Fragment>
        ),
      },
    ];
    if (props.detailInfo && props.detailInfo.authType === AUTH_TYPE_LIST[0].value) {
      // 全部密钥类型，去掉密钥信息字段
      this.columns.splice(0, 3)
    }
    if (props.detailInfo && props.detailInfo.authLevel === AUTH_LEVEL_LIST[1].value) {
      this.columns = [
        {
          title: formatMessage({ id: 'keyAuth.authUserCode', defaultMessage: '授权用户编码' }),
          key: 'appUserCode',
          dataIndex: 'appUserCode',
          ellipsis: true,
        },
        {
          title: formatMessage({ id: 'keyAuth.authUserName', defaultMessage: '授权用户姓名' }),
          key: 'appUserName',
          dataIndex: 'appUserName',
          ellipsis: true,
        },
      ].concat(this.columns);
    }
  }

  state = {
    dataSource: {
      list: [],
      ...PAGE_INFO,
    },
  };

  searchInfo = {
    ...PAGE_INFO,
  };

  componentDidMount() {
    this.getDataSource();
  }

  getDataSource = () => {
    const { dispatch, detailInfo } = this.props;
    const payload = {
      ...this.searchInfo,
      belongToSystemCode: detailInfo.genSysCode,
      authType: detailInfo.authType,
      authLevel: detailInfo.authLevel,
    };
    if (detailInfo.authLevel === AUTH_LEVEL_LIST[0].value) {
      payload.appSystemCode = detailInfo.appCode;
    } else {
      payload.appUserCode = detailInfo.appCode;
    }
    dispatch({
      type: 'keyAuth/listAuth',
      payload,
    }).then(res => {
      if (!res) return;
      this.setState({
        dataSource: {
          list: res.rows,
          pageIndex: res.pageInfo && res.pageInfo.pageIndex,
          pageSize: res.pageInfo && res.pageInfo.pageSize,
          total: res.pageInfo && res.pageInfo.total,
        },
      });
    });
  };

  // 分页查询
  handleTableChange = pagination => {
    const prePageSize = this.searchInfo.pageSize;
    const { current: pageIndex, pageSize } = pagination;
    this.searchInfo = {
      pageIndex,
      pageSize,
    };
    if (prePageSize !== pageSize) {
      this.searchInfo.pageIndex = 1;
    }
    this.getDataSource();
  };

  // 删除授权
  handleDelete = record => {
    const { dispatch } = this.props;
    const payload = {
      ids: [record.id],
    };
    dispatch({
      type: 'keyAuth/deleteAuth',
      payload,
    }).then(res => {
      if (!res) return;
      const { dataSource } = this.state;
      const list = [];
      dataSource.list.forEach(item => {
        if (payload.ids.indexOf(item.id) === -1) {
          list.push(item);
        }
      });
      this.setState({
        dataSource: {
          ...dataSource,
          list,
        },
      });
    });
  };

  // 切换状态
  handleSwitchItem = record => {
    const { dispatch, stateLoading } = this.props;
    if (stateLoading) return;
    dispatch({
      type: 'keyAuth/reverseState',
      payload: {
        id: record.id,
      },
    }).then(res => {
      if (!res) return;
      const {
        dataSource,
        dataSource: { list },
      } = this.state;
      const [currItem] = list.filter(item => item.id === record.id);
      if (!currItem) return;
      message.success(
        formatMessage({ id: 'keyAuth.switchKeySuccess', defaultMessage: '切换状态成功' })
      );
      currItem.state = res;
      this.setState({
        dataSource: {
          ...dataSource,
          list,
        },
      });
    });
  };

  render() {
    const { dataSource } = this.state;
    const { onCancel, loading, detailInfo } = this.props;

    const title = formatMessage({
      id:
        detailInfo && detailInfo.authLevel === AUTH_LEVEL_LIST[0].value
          ? 'keyAuth.authAppTitle'
          : 'keyAuth.authUserTitle',
      defaultMessage:
        detailInfo && detailInfo.authLevel === AUTH_LEVEL_LIST[0].value
          ? '密钥授权系统编辑'
          : '密钥授权用户编辑',
    });

    const pagination = {
      total: dataSource.total,
      pageSize: dataSource.pageSize,
      current: dataSource.pageIndex,
    };

    return (
      <Drawer
        visible={true}
        maskClosable={true}
        onClose={onCancel}
        width={1000}
        title={title}
        className={styles.drawWrap}
      >
        <div className="ub-f1 ub">
          <CommonTable
            columns={this.columns}
            list={dataSource.list}
            pagination={pagination}
            handleTableChange={this.handleTableChange}
            rowKey="id"
            size="small"
            loading={loading}
          />
        </div>
      </Drawer>
    );
  }
}

export default EditKeyAuth;
