import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import { formatMessage } from 'umi/locale';
import { Collapse, Input, Button, Popconfirm, Tooltip, message, Modal } from 'antd';
import MyIcon from '@/components/MyIcon';
import {
  listSafeAppSystem,
  deleteSafeAppSystem,
  multiDeleteSafeAppSystem,
  moveSafeAppSystem,
  batchSaveSafeAppSystem,
} from '@/services/authorizeManagement/applySysUserManagement';
import { downloadFile } from '@/utils/utils';
import AddSys from './AddSystem';
import MoveSystemModal from './MoveSystemModal';
import CSVUpLoad from '../CSVUpLoad';
import PageSelTable from '@/pages/AuthorizeManagement/components/pageSelTable';
import _styles from './index.less';
import commonStyles from '../common.less';

const styles = { ..._styles, ...commonStyles };
const { Panel } = Collapse;
const { Search } = Input;
const { confirm } = Modal;

class AppSystems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      selectedRowKeys: [],
      selectedRowArr: [],
      dataSource: [],
      showModel: false,
      showSelCatlogModel: false,
      type: 'add',
      sysItemAct: {},
      pageInfo: {
        pageIndex: 1,
        pageSize: 5,
        total: 0,
        searchName: '',
      },
    };
    this.columns = [
      {
        title: `${formatMessage({ id: 'applySysUserManagement.SystemCode' })}`,
        dataIndex: 'appsysCode',
        width: '25%',
        ellipsis: true,
        className: 'modelTableEllipsis',
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
        title: `${formatMessage({ id: 'applySysUserManagement.SystemName' })}`,
        dataIndex: 'appsysName',
        width: '25%',
        className: 'modelTableEllipsis',
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
        title: `${formatMessage({ id: 'applySysUserManagement.SystemDescription' })}`,
        dataIndex: 'appsysDescribe',
        width: '30%',
        className: 'modelTableEllipsis',
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
        title: `${formatMessage({ id: 'applySysUserManagement.Operate' })}`,
        key: 'caozuo',
        width: '20%',
        render: val => {
          const { defaultAppsysCode } = this.props;
          const { appsysCode } = val;
          const isBss = THEME === 'bss';
          if (appsysCode === defaultAppsysCode && isBss) {
            return '';
          }
          return (
            <div className="table-action-column">
              <MyIcon
                type="iconbianjix"
                title={`${formatMessage({ id: 'applySysUserManagement.EditeSystem' })}`}
                onClick={this.editSys.bind(this, val)}
                className="square-icon"
              />
              <Popconfirm
                title={`${formatMessage({ id: 'applySysUserManagement.DeleteSystemTip' })}`}
                onConfirm={() => this.delSys(val)}
                okText={`${formatMessage({ id: 'applySysUserManagement.determine' })}`}
                cancelText={`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
              >
                <MyIcon
                  type="iconshanchubeifenx"
                  title={`${formatMessage({ id: 'applySysUserManagement.DeleteSystem' })}`}
                  className="square-icon"
                />
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    if (props.editable === false) {
      this.columns.pop();
      this.columns.forEach(c => {
        delete c.width;
      });
    }
    this.upFileColumns = [
      {
        title: `${formatMessage({ id: 'applySysUserManagement.SystemCode' })}`,
        dataIndex: 'appsysCode',
        width: '20%',
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
        title: `${formatMessage({ id: 'applySysUserManagement.SystemName' })}`,
        dataIndex: 'appsysName',
        width: '20%',
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
        title: `${formatMessage({ id: 'applySysUserManagement.SystemDescription' })}`,
        dataIndex: 'appsysDescribe',
        width: '45%',
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
        title: `${formatMessage({ id: 'applySysUserManagement.IsRepeated' })}`,
        dataIndex: 'status',
        width: '15%',
        className: 'model_table_ellipsis',
        render: val => {
          const text =
            val === 'true'
              ? `${formatMessage({ id: 'applySysUserManagement.Yes' })}`
              : `${formatMessage({ id: 'applySysUserManagement.No' })}`;
          return (
            <Tooltip title={text}>
              <span className="titleSpan" style={val === 'true' ? { color: 'red' } : {}}>
                {text}
              </span>
            </Tooltip>
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { selectedCatalogue, setSysChild } = this.props;
    if (selectedCatalogue.catalogId || `${selectedCatalogue.catalogId}` === '0') {
      this.getListSafeAppSystem(selectedCatalogue.catalogId);
    }
    if (setSysChild) {
      setSysChild(this);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedCatalogue } = this.props;
    if (
      (nextProps.selectedCatalogue.catalogId ||
        `${nextProps.selectedCatalogue.catalogId}` === '0') &&
      nextProps.selectedCatalogue.catalogId !== selectedCatalogue.catalogId
    ) {
      const { pageInfo } = this.state;
      pageInfo.pageIndex = 1;
      this.setState(
        {
          pageInfo,
        },
        () => {
          this.getListSafeAppSystem(nextProps.selectedCatalogue.catalogId);
        }
      );
    }
  }

  // 分页变化
  handlePaginationOnChanges = pageIndex => {
    const { pageInfo } = this.state;
    pageInfo.pageIndex = pageIndex;
    this.setState(
      {
        pageInfo,
      },
      () => {
        this.getListSafeAppSystem();
      }
    );
  };

  // 获取系统列表
  getListSafeAppSystem = id => {
    let appsysCatalogId = '';
    const { selectedCatalogue, setSelectedSystem } = this.props;
    const { pageInfo } = this.state;
    if (id) {
      appsysCatalogId = id;
    } else {
      appsysCatalogId = selectedCatalogue.catalogId;
    }
    const params = {
      appsysCatalogId,
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
      searchName: pageInfo.searchName,
    };
    this.setState({
      loading: true,
    });
    setSelectedSystem({});
    listSafeAppSystem(params).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject = [] } = result;
        const { pageInfo: pageData, rows } = resultObject;
        pageInfo.total = pageData.total;
        this.setState({
          dataSource: rows,
          pageInfo,
          selectedRowKeys: [],
          selectedRowArr: [],
        });
      }
    });
  };

  showModelFlag = (flag, refresh, setPage) => {
    this.setState({
      showModel: flag,
    });
    if (refresh && setPage) {
      const pageInfo = {
        pageIndex: 1,
        pageSize: 5,
        total: 0,
        searchName: '',
      };
      this.setState(
        {
          pageInfo,
        },
        () => {
          this.getListSafeAppSystem();
        }
      );
    } else if (refresh) {
      this.getListSafeAppSystem();
    }
  };

  showCatlogModelFlag = flag => {
    this.setState({
      showSelCatlogModel: flag,
    });
  };

  // 编辑系统
  editSys = val => {
    this.setState({
      type: 'edit',
      sysItemAct: val,
      showModel: true,
    });
  };

  // 删除系统
  delSys = val => {
    this.setState({
      loading: true,
    });
    deleteSafeAppSystem({ id: val.id }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.FailedToDelete' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(`${formatMessage({ id: 'applySysUserManagement.SuccessfullyDeleted' })}`);
        this.getListSafeAppSystem();
      }
    });
  };

  // 批量删除系统
  delList = () => {
    const { selectedRowKeys } = this.state;
    const idList = selectedRowKeys.map(item => {
      return { id: item };
    });
    this.setState({
      loading: true,
    });
    multiDeleteSafeAppSystem({ idList }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.FailedToDelete' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(`${formatMessage({ id: 'applySysUserManagement.SuccessfullyDeleted' })}`);
        this.getListSafeAppSystem();
      }
    });
  };

  // 批量移动
  moveSys = catlog => {
    const { selectedRowKeys } = this.state;
    const idList = selectedRowKeys.map(item => {
      return { id: item };
    });
    const parms = { idList };
    parms.targetCatalogId = catlog.catalogId;
    this.setState({
      loading: true,
    });
    moveSafeAppSystem(parms).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.MoveFailed' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(`${formatMessage({ id: 'applySysUserManagement.MoveSuccess' })}`);
        this.getListSafeAppSystem();
      }
    });
  };

  // 下载系统模板
  downloadTemp = () => {
    downloadFile('smartsafe/SafeAppUserController/downloadSafeAppSystemTemplate', {}, 'POST');
  };

  getFooterBtn = selectedRowKeys => {
    const { editable } = this.props;
    if (editable === false) {
      return null;
    }
    return (
      <Fragment>
        <Button
          style={{ marginLeft: 30 }}
          size="small"
          disabled={selectedRowKeys.length <= 0}
          onClick={() => {
            this.showCatlogModelFlag(true);
          }}
        >
          {`${formatMessage({ id: 'applySysUserManagement.Move' })}`}
        </Button>
        <Popconfirm
          title={`${formatMessage({ id: 'applySysUserManagement.DeleteSelSystemTip' })}`}
          onConfirm={() => this.delList()}
          okText={`${formatMessage({ id: 'applySysUserManagement.determine' })}`}
          cancelText={`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
        >
          <Button style={{ marginLeft: 10 }} size="small" disabled={selectedRowKeys.length <= 0}>
            {`${formatMessage({ id: 'applySysUserManagement.Delete' })}`}
          </Button>
        </Popconfirm>
      </Fragment>
    );
  };

  getSell = (selectedRowKeys, selectedRowArr) => {
    this.setState({
      selectedRowKeys,
      selectedRowArr,
    });
  };

  getDataSource = itemArr => {
    const [status = '', appsysCode = '', appsysName = '', appsysDescribe = ''] = itemArr;
    return { status, appsysCode, appsysName, appsysDescribe };
  };

  // 批量创建应用系统
  handleOk = (dataSource, callback) => {
    const { selectedCatalogue } = this.props;
    const appsysCatalogId = selectedCatalogue.catalogId;
    const repeatCodeArr = [];
    const repeatCodeFalse = [];
    const newDataSource = dataSource.map(item => {
      const { appsysCode, appsysName, appsysDescribe, status } = item;
      if (status === 'true') {
        repeatCodeArr.push(appsysCode);
      }
      if (!/^A\d{6}$/.test(`${appsysCode}`)) {
        repeatCodeFalse.push(appsysCode);
      }
      return { appsysCode, appsysName, appsysDescribe, appsysCatalogId };
    });
    if (repeatCodeFalse.length > 0) {
      message.error(
        `${formatMessage({
          id: 'applySysUserManagement.repeatCodeFalseTipLeft',
        })} ${repeatCodeFalse.join(',')} ${formatMessage({
          id: 'applySysUserManagement.repeatCodeFalseTipRight',
        })}`
      );
      return false;
    }
    if (repeatCodeArr.length > 0) {
      const _this = this;
      confirm({
        title: `${formatMessage({ id: 'applySysUserManagement.ConfirmationOperate' })}`,
        content: (
          <div>
            {formatMessage({ id: 'applySysUserManagement.repeatCodeFalseTipLeft' })}
            {repeatCodeArr.join(',')}
            {formatMessage({ id: 'applySysUserManagement.repeatCodeFalseTipRightTwo' })}
          </div>
        ),
        okText: `${formatMessage({ id: 'applySysUserManagement.determine' })}`,
        cancelText: `${formatMessage({ id: 'applySysUserManagement.cancel' })}`,
        onOk() {
          _this.batchSaveSafeAppSystem(newDataSource, callback);
          callback();
        },
        onCancel() {
          return false;
        },
      });
    } else {
      this.batchSaveSafeAppSystem(newDataSource, callback);
      callback();
    }
  };

  batchSaveSafeAppSystem = newDataSource => {
    this.setState({
      loading: true,
    });
    batchSaveSafeAppSystem({ safeAppSystemList: newDataSource }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.ImportFailed' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(`${formatMessage({ id: 'applySysUserManagement.ImportSuccessTip' })}`);
        const { pageInfo } = this.state;
        pageInfo.pageIndex = 1;
        this.setState(
          {
            pageInfo,
          },
          () => {
            this.getListSafeAppSystem();
          }
        );
      }
    });
  };

  setclickRecord = record => {
    const { setSelectedSystem } = this.props;
    setSelectedSystem(record);
  };

  render() {
    const {
      loading,
      selectedRowArr,
      dataSource,
      showModel,
      type,
      sysItemAct,
      pageInfo,
      showSelCatlogModel,
    } = this.state;
    const { selectedCatalogue, selectedSys, defaultAppsysCode, editable = true } = this.props;
    const isBss = THEME === 'bss';
    const customRowSelection = {
      getCheckboxProps: record => ({
        disabled: record.appsysCode === defaultAppsysCode && isBss,
      }),
    };

    return (
      <div className={styles.sysManageCon}>
        <Collapse
          defaultActiveKey={['1']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'auditManagement.Collapse' })}`
                    : `${formatMessage({ id: 'auditManagement.Expand' })}`}
                </span>
                <MyIcon
                  type="iconjiantou1"
                  className={styles.collIcon}
                  rotate={isActive ? 0 : 180}
                />
              </div>
            );
          }}
        >
          <Panel
            header={`${formatMessage({ id: 'applySysUserManagement.ApplicationManagement' })}`}
            key="1"
          >
            <div className={styles.sysHeaderCon}>
              <span>{selectedCatalogue.catalogName}</span>
              <div className={styles.sysHeaderRight}>
                <Search
                  className={classNames(styles.searchInput, editable ? 'mr10' : '')}
                  placeholder={`${formatMessage({
                    id: 'applySysUserManagement.ApplicationSearchTip',
                  })}`}
                  onSearch={value => {
                    pageInfo.searchName = value;
                    pageInfo.pageIndex = 1;
                    this.setState(
                      {
                        pageInfo,
                      },
                      () => {
                        this.getListSafeAppSystem();
                      }
                    );
                  }}
                />
                {editable && (
                  <React.Fragment>
                    <Button
                      icon="plus"
                      type="primary"
                      className="mr10"
                      onClick={() => {
                        this.setState(
                          {
                            type: 'add',
                            sysItemAct: {},
                          },
                          () => {
                            this.showModelFlag(true);
                          }
                        );
                      }}
                    >
                      {`${formatMessage({ id: 'applySysUserManagement.AddSystem' })}`}
                    </Button>
                    <CSVUpLoad
                      upFileColumns={this.upFileColumns}
                      getDataSource={this.getDataSource}
                      handleOk={this.handleOk}
                      modelTitle={`${formatMessage({
                        id: 'applySysUserManagement.SystemImportConfirm',
                      })}`}
                      type="systemInfo"
                      selectedCatalogue={selectedCatalogue}
                      showModelFlag={this.showModelFlag}
                    />
                    <span className={styles.sysHeaderDownTemp} onClick={this.downloadTemp}>
                      {`${formatMessage({ id: 'applySysUserManagement.DownloadTemplate' })}`}
                    </span>
                  </React.Fragment>
                )}
              </div>
            </div>
            <PageSelTable
              noRowSelection={!editable}
              handlePaginationOnChanges={this.handlePaginationOnChanges}
              getFooterBtn={this.getFooterBtn}
              isLoading={loading}
              pageInfo={pageInfo}
              dataSource={dataSource}
              initVlaue={selectedRowArr}
              primaryKey="id"
              columns={this.columns}
              onGetSel={this.getSell}
              setclickRecord={this.setclickRecord}
              selectRecord={selectedSys}
              customRowSelection={customRowSelection}
            />
            <AddSys
              showModel={showModel}
              showModelFlag={this.showModelFlag}
              type={type}
              selectedCatalogue={selectedCatalogue}
              sysItemAct={JSON.parse(JSON.stringify(sysItemAct))}
            />
            <MoveSystemModal
              showModel={showSelCatlogModel}
              showModelFlag={this.showCatlogModelFlag}
              moveSys={this.moveSys}
            />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default AppSystems;
