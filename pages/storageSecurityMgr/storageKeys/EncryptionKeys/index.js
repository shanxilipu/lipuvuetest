import React from 'react';
import { Button, Popconfirm, message } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import MyIcon from '@/components/MyIcon';
import NewKeyModal from './NewKeyModal';
import KeyDetailModal from './KeyDetailModal';
import CommonFilterTableBox from '@/components/CommonFilterTableBox';
import { DEFAULT_DATE_FORMAT } from '@/pages/common/const';
import {
  checkLanguageIsEnglish,
  getCommonPagedResponse,
  defaultHandleResponse,
  getPageIndexAfterDeletion,
} from '@/utils/utils';
import { getKeysList, deleteKey } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import styles from './index.less';

const SHOW_MODAL_NEW_KEY = 'newKey';
const SHOW_MODAL_DETAIL_KEY = 'keyDetail';

class EncryptionKeys extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      selectedRowKeys: [],
      showModalName: '',
    };
    this.keyData = {};
    this.keyDataMode = '';
    this.searchParams = {};
    this.searchArr = [
      {
        name: 'genDataSources',
        label: formatMessage({ id: 'DATASOURCE', defaultMessage: '数据源' }),
      },
      { name: 'genTabCode', label: formatMessage({ id: 'TABLE_CODE', defaultMessage: '表编码' }) },
      {
        name: 'keyCode',
        label: formatMessage({ id: 'keyManagement.KeyID', defaultMessage: '密钥标识' }),
      },
      {
        name: 'keyName',
        label: formatMessage({ id: 'keyManagement.KeyName', defaultMessage: '密钥名称' }),
      },
      {
        name: 'createTime',
        startName: 'createStartDate',
        endName: 'createEndDate',
        label: formatMessage({ id: 'CREATE_DATE', defaultMessage: '创建时间' }),
        type: 'rangePicker',
      },
      {
        name: 'keyDescribe',
        label: formatMessage({ id: 'keyManagement.KeyDescription', defaultMessage: '密钥说明' }),
      },
    ];
    this.columns = [
      {
        title: formatMessage({ id: 'DATASOURCE', defaultMessage: '数据源' }),
        dataIndex: 'genDataSources',
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
        title: formatMessage({ id: 'keyManagement.KeyName', defaultMessage: '密钥名称' }),
        dataIndex: 'keyName',
        width: 150,
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyID', defaultMessage: '密钥标识' }),
        dataIndex: 'keyCode',
        width: 120,
        ellipsis: true,
      },
      {
        title: formatMessage({
          id: 'keyManagement.EncryptionAlgorithm',
          defaultMessage: '加密算法',
        }),
        dataIndex: 'encryptAlgorithm',
        width: checkLanguageIsEnglish() ? 140 : 120,
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyManagement.KeyDescription', defaultMessage: '密钥说明' }),
        dataIndex: 'keyDescribe',
        width: 130,
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'CREATE_DATE', defaultMessage: '创建时间' }),
        dataIndex: 'createTime',
        width: 120,
        ellipsis: true,
        render: t => {
          return t ? moment(t).format(DEFAULT_DATE_FORMAT) : '';
        },
      },
      {
        title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
        dataIndex: 'action',
        width: 120,
        fixed: 'right',
        render: (v, record) => (
          <div className="table-action-column">
            <MyIcon
              type="iconeye"
              onClick={() => this.showKeyModal(record, false)}
              title={formatMessage({ id: 'COMMON_VIEW', defaultMessage: '查看' })}
            />
            <MyIcon
              type="iconbianjix"
              onClick={() => this.showKeyModal(record, true)}
              title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
            />
            <Popconfirm
              title={formatMessage({
                id: 'COMMON_DELETE_TIP',
                defaultMessage: '您确定要删除吗？',
              })}
              onConfirm={() => {
                this.handleDeleteKey(record);
              }}
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

  handleRefresh = () => {
    const {
      pageInfo: { pageSize },
    } = this.state;
    this.getData(1, pageSize);
  };

  getData = (pageIndex = 1, pageSize = 10) => {
    const payload = { pageIndex, pageSize, ...this.searchParams };
    this.setState({ loading: true });
    getKeysList(payload).then(response => {
      this.setState({ loading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ list, pageInfo, selectedRowKeys: [] });
      }
    });
  };

  handleSearch = params => {
    this.searchParams = params;
    this.handleRefresh();
  };

  handleDeleteKey = data => {
    const { enckeyId, genDataSources, genTabCode, keyCode } = data;
    this.setState({ loading: true });
    deleteKey({ enckeyId, genDataSources, genTabCode, keyCode }).then(response => {
      defaultHandleResponse(
        response,
        () => {
          const {
            list,
            pageInfo: { pageIndex = 1, pageSize = 10 },
          } = this.state;
          this.getData(getPageIndexAfterDeletion(list, [enckeyId], pageIndex), pageSize);
          message.success(
            formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })
          );
        },
        () => {
          this.setState({ loading: false });
        }
      );
    });
  };

  showKeyModal = (data, isEdit) => {
    this.keyData = data;
    this.keyDataMode = isEdit ? 'edit' : 'view';
    this.setState({ showModalName: SHOW_MODAL_DETAIL_KEY });
  };

  render() {
    const { list, pageInfo, loading, showModalName, selectedRowKeys } = this.state;
    return (
      <CommonFilterTableBox
        rowKey="enckeyId"
        dataSource={list}
        loading={loading}
        pageInfo={pageInfo}
        columns={this.columns}
        onChange={this.getData}
        tableClassName={styles.table}
        selectedRowKeys={selectedRowKeys}
        advancedFilterProps={{
          columnNumber: 4,
          searchArr: this.searchArr,
          onSearch: this.handleSearch,
        }}
      >
        <div className={styles.topBar}>
          <Button
            type="primary"
            onClick={() => this.setState({ showModalName: SHOW_MODAL_NEW_KEY })}
          >
            <MyIcon type="iconxinjian1x" />
            {formatMessage({ id: 'encrypt.key.new', defaultMessage: '新增密钥' })}
          </Button>
        </div>
        <NewKeyModal
          onOk={this.handleRefresh}
          visible={showModalName === SHOW_MODAL_NEW_KEY}
          onCancel={() => this.setState({ showModalName: '' })}
        />
        <KeyDetailModal
          data={this.keyData}
          mode={this.keyDataMode}
          visible={showModalName === SHOW_MODAL_DETAIL_KEY}
          onCancel={() => this.setState({ showModalName: '' })}
        />
      </CommonFilterTableBox>
    );
  }
}
export default EncryptionKeys;
