import React from 'react';
import moment from 'moment';
import { Switch, Popconfirm, Button, message } from 'antd';
import MyIcon from '@/components/MyIcon';
import { formatMessage } from 'umi/locale';
import AddAuthModal from './AddAuthModal';
import EditAuthModal from './EditAuthModal';
import CommonFilterTableBox from '@/components/CommonFilterTableBox';
import {
  deleteAuth,
  getKeysAuthList,
  batchEnableOrDisableAuth,
} from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import { DEFAULT_DATE_FORMAT } from '@/pages/common/const';
import {
  defaultHandleResponse,
  getCommonPagedResponse,
  getPageIndexAfterDeletion,
} from '@/utils/utils';
import styles from './index.less';

const SHOW_MODAL_NEW_AUTH = 'newAuth';
const SHOW_MODAL_EDIT_AUTH = 'editAuth';

class KeysAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      selectedRowKeys: [],
      showModalName: '',
    };
    this.currentRecord = {};
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
        render: t => {
          return t ? moment(t).format(DEFAULT_DATE_FORMAT) : '';
        },
        title: formatMessage({ id: 'keyAuth.enableStartTime', defaultMessage: '生效时间' }),
      },
      {
        width: 120,
        ellipsis: true,
        dataIndex: 'expDate',
        render: t => {
          return t ? moment(t).format(DEFAULT_DATE_FORMAT) : '';
        },
        title: formatMessage({ id: 'keyAuth.expiredTime', defaultMessage: '失效时间' }),
      },
      {
        width: 90,
        dataIndex: 'state',
        isActionColumn: true,
        render: (v, record) => (
          <div className={styles.switcherCol}>
            <Switch
              checked={v === 'A'}
              onChange={checked => this.handleStateChange([record.authDetailId], checked)}
            />
            <span>{formatMessage({ id: v === 'A' ? 'COMMON_ENABLE' : 'COMMON_DISABLED' })}</span>
          </div>
        ),
        title: formatMessage({ id: 'keyAuth.authState', defaultMessage: '授权状态' }),
      },
      {
        width: 120,
        isActionColumn: true,
        dataIndex: 'action',
        title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
        render: (t, record) => (
          <div className="table-action-column">
            <MyIcon
              type="iconbianjix"
              onClick={() => {
                this.currentRecord = record;
                this.setState({ showModalName: SHOW_MODAL_EDIT_AUTH });
              }}
              title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
            />
            <Popconfirm
              title={formatMessage({
                id: 'COMMON_DELETE_TIP',
                defaultMessage: '您确定要删除吗？',
              })}
              onConfirm={() => this.handleDelete([record.authDetailId])}
            >
              <MyIcon
                type="iconshanchubeifenx"
                title={formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
              />
            </Popconfirm>
          </div>
        ),
      },
    ];
  }

  handleSearch = params => {
    this.searchParams = params;
    this.reloadData(1);
  };

  reloadData = index => {
    const {
      pageInfo: { pageIndex, pageSize },
    } = this.state;
    this.getData(index || pageIndex, pageSize);
  };

  getData = (pageIndex = 1, pageSize = 10) => {
    const payload = { pageIndex, pageSize, ...this.searchParams };
    this.setState({ loading: true });
    getKeysAuthList(payload).then(response => {
      this.setState({ loading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ list, pageInfo, selectedRowKeys: [] });
      }
    });
  };

  getSelectedKeys = keys => {
    let _keys = keys;
    if (!_keys) {
      const { selectedRowKeys } = this.state;
      _keys = selectedRowKeys;
    }
    return _keys;
  };

  handleStateChange = (keys, checked) => {
    const _keys = this.getSelectedKeys(keys);
    this.setState({ loading: true });
    batchEnableOrDisableAuth(_keys, checked).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        const { list } = this.state;
        const newList = list.map(o => {
          const { authDetailId } = o;
          if (_keys.includes(authDetailId)) {
            return { ...o, state: checked ? 'A' : 'X' };
          }
          return { ...o };
        });
        this.setState({ list: newList, selectedRowKeys: [] });
      });
    });
  };

  handleDelete = keys => {
    const _keys = this.getSelectedKeys(keys);
    this.setState({ loading: true });
    deleteAuth(_keys).then(response => {
      defaultHandleResponse(
        response,
        () => {
          message.success(
            formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })
          );
          const {
            list,
            pageInfo: { pageIndex, pageSize },
          } = this.state;
          this.getData(getPageIndexAfterDeletion(list, _keys, pageIndex), pageSize);
        },
        () => {
          this.setState({ loading: false });
        }
      );
    });
  };

  render() {
    const { list, pageInfo, loading, selectedRowKeys, showModalName } = this.state;
    return (
      <CommonFilterTableBox
        checkable
        rowSelectable
        rowKey="authDetailId"
        dataSource={list}
        loading={loading}
        pageInfo={pageInfo}
        columns={this.columns}
        onChange={this.getData}
        tableClassName={styles.table}
        selectedRowKeys={selectedRowKeys}
        onSelectRow={keys => this.setState({ selectedRowKeys: keys })}
        onSelectAll={(b, r, ks) => this.setState({ selectedRowKeys: ks })}
        multiBtnList={[
          {
            onClick: () => this.handleDelete(),
            confirmText: formatMessage({
              id: 'COMMON_DELETE_TIP',
              defaultMessage: '您确定要删除吗？',
            }),
            text: formatMessage({ id: 'COMMON_BATCH_DELETE', defaultMessage: '批量删除' }),
          },
          {
            onClick: () => this.handleStateChange(null, true),
            text: formatMessage({ id: 'COMMON_BATCH_ENABLE', defaultMessage: '批量启用' }),
          },
          {
            onClick: () => this.handleStateChange(null, false),
            text: formatMessage({ id: 'COMMON_BATCH_DISABLE', defaultMessage: '批量禁用' }),
          },
        ]}
        advancedFilterProps={{
          canFold: false,
          columnNumber: 3,
          searchArr: this.searchArr,
          onSearch: this.handleSearch,
        }}
      >
        <div className={styles.topBar}>
          <Button
            type="primary"
            onClick={() => this.setState({ showModalName: SHOW_MODAL_NEW_AUTH })}
          >
            <MyIcon type="iconxinjian1x" />
            {formatMessage({ id: 'BUTTON_ADD', defaultMessage: '新增' })}
          </Button>
        </div>
        <AddAuthModal
          onOk={() => this.reloadData(1)}
          visible={showModalName === SHOW_MODAL_NEW_AUTH}
          onCancel={() => this.setState({ showModalName: '' })}
        />
        <EditAuthModal
          data={this.currentRecord}
          onOk={() => this.reloadData()}
          visible={showModalName === SHOW_MODAL_EDIT_AUTH}
          onCancel={() => this.setState({ showModalName: '' })}
        />
      </CommonFilterTableBox>
    );
  }
}
export default KeysAuth;
