import React from 'react';
import { Button, Popconfirm, message, Badge, Upload } from 'antd';
import Modal from '@/components/Modal/index.js';
import classNames from 'classnames';
import Table from '@/components/Table';
import MyIcon from '@/components/MyIcon';
import { APPROVAL_STATES } from './const';
import AddTaskFrom from './AddTaskForm';
import ImpTem from './ImportTemplate';
import SubRep from './SubmitReport';
import ReportProgress from './ReportProgress';
import { defaultHandleResponse, downloadFile } from '@/utils/utils';
import {
  queryReportTask,
  batchRemoveReportTask,
  listApprovalProgress,
} from '@/services/functionalDesign/dataReportTaskManagement';
import styles from './index.less';

const { confirm } = Modal;
class TabContent extends React.Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      showModal: false,
      showProgModal: false,
      showResModal: false,
      list: [],
      pageInfo: {},
      loading: false,
      editValue: '',
      titleSwitch: false,
      reportValue: '',
      importList: [],
      reImportList: [],
      reportList: [],
      queryValue: {},
      selectedRowKeys: [],
      pageIndex: 1,
      pageSize: 10,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  getColumns = () => {
    return [
      {
        dataIndex: 'taskName',
        title: '采集任务名称',

      },
      {
        dataIndex: 'taskIp',
        title: '采集任务IP',
      },
      {
        dataIndex: 'datasourceType',
        title: '数据源类型',
        sorter: (a, b) => (a.datasourceType > b.datasourceType ? 1 : -1),
      },
      {
        dataIndex: 'datasourceIp',
        title: '数据源IP',
      },
      {
        dataIndex: 'state',
        title: '审批状态',
        render: state => {
          const obj = APPROVAL_STATES.find(o => o.value === state) || {};
          const label = obj.label || '';
          return (
            <div>
              <Badge
                status={
                  state === 'PASS'
                    ? 'success'
                    : state === 'SUBMITTED'
                    ? 'processing'
                    : state === 'REJECT_SUBMIT'
                    ? 'error'
                    : state === 'REJECT'
                    ? 'error'
                    : 'warning'
                }
                text={label}
              />
            </div>
          );
        },
      },
      {
        dataIndex: 'datcolTaskId',
        title: '操作',
        render: (datcolTaskId, values) => (
          <div className={styles.datcolTaskId}>
            <a onClick={() => this.reportSchedule(datcolTaskId)}>报备进度</a>
            <Popconfirm
              disabled={values.state !== 'PASS'}
              title='是否取消审批通过的报备?'
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                this.editButton(values);
              }}
            >
              <a
                onClick={
                  values.state !== 'PASS'
                    ? () => this.editButton(values)
                    : ''
                }
              >
                编辑
              </a>
            </Popconfirm>
            <Popconfirm
              title="确定删除该任务吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                if (values.state == 'SUBMITTED') {
                  this.getRemove([datcolTaskId]);
                } else {
                  message.error('该状态不可以删除！');
                }
              }}
            >
              <a>删除</a>
            </Popconfirm>
            {['WAIT_SUBMIT', 'REJECT'].includes(values.state) && (
              <a onClick={() => this.showResModalFlag([datcolTaskId])}>
                {values.state == 'WAIT_SUBMIT'
                  ? '提交报备'
                  : values.state == 'REJECT'
                  ? '重新提交'
                  : ''}
              </a>
            )}

          </div>
        ),
      },
    ];
  };

  editButton = values => {
    this.setState({
      showModal: true,
      editValue: values,
      titleSwitch: false,
    });
  };

  showModalFlag = (flag, load) => {
    if (typeof flag == 'object') {
      this.setState({
        titleSwitch: true,
        showModal: true,
      });
    } else {
      this.setState({
        titleSwitch: true,
        showModal: flag,
        loading: load,
      });
    }
  };

  showImportModalFlag = (flag, load) => {
    this.setState({
      showImportModal: flag,
      loading: load,
    });
  };

  //批量提交对话框
  showResModalFlag = (flag, load) => {
    if (typeof flag == 'object') {
      this.setState({
        showResModal: true,
        reportValue: flag.toString(),
      });
    } else {
      this.setState({
        showResModal: flag,
        loading: load,
      });
    }
  };

  //根据Tabs标签查询
  getTabs = (Index, Size) => {
    const { activeTab } = this.props;
    if (activeTab == 0) {
      this.getQuery({}, Index, Size);
    } else if (activeTab == 1) {
      this.getQuery({ state: 'PASS' }, Index, Size);
    } else if (activeTab == 2) {
      this.getQuery({ state: 'REJECT' }, Index, Size);
    } else if (activeTab == 3) {
      this.getQuery({ state: 'SUBMITTED' }, Index, Size);
    } else if (activeTab == 4) {
      this.getQuery({ state: 'WAIT_SUBMIT' }, Index, Size);
    } else {
      this.getQuery({ state: 'REJECT_SUBMIT' }, Index, Size);
    }
    this.setState({
      pageSize: Size,
      pageIndex: Index,
    });
  };

  //查询
  getQuery = (params, Index, Size) => {
    const { activeTab } = this.props
    console.log('查询')
    console.log( activeTab )
    this.setState({
      loading: true,
      queryValue: params,
    });
    params.pageIndex = Index;
    params.pageSize = Size;
    queryReportTask(params).then(response => {
      defaultHandleResponse(response, (resultObject = {}) => {
        const { rows = [], pageInfo } = resultObject;
        this.setState({ list: rows, pageInfo, selectedRowKeys: [], pageIndex: Index });
      });
      this.setState({ loading: false });
    });
  };

  //报备进度
  reportSchedule = id => {
    listApprovalProgress({ id }).then(response => {
      defaultHandleResponse(response, (resultObject = {}) => {
        const { rows = [] } = resultObject;
        this.setState({ reportList: rows });
      });
    });
    this.progModal(true);
  };

  //是否显示Modal框
  progModal = flag => {
    this.setState({
      showProgModal: flag,
    });
  };

  //批量删除
  getBatchRemove = ids => {
    const { list, queryValue, pageIndex, pageSize } = this.state;
    //判断是否有不允许删除项
    for (let i = 0; i <= list.length; i++) {
      for (let j = 0; j < ids.length; j++) {
        if (i < list.length && list[i].datcolTaskId == ids[j]) {
          if (list[i].state !== 'SUBMITTED') {
            message.error('含有不可删除状态');
            return false;
          }
        } else if (i == list.length) {
          confirm({
            title: '删除确认',
            content: '确认批量删除选中行吗？',
            width: '433px',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
              this.setState({ loading: true })
              batchRemoveReportTask(ids).then(response => {
                defaultHandleResponse(response);
                this.getQuery(queryValue, pageIndex, pageSize);
              });
            },
          });
          return false;
        }
      }
    }
  };

  //删除
  getRemove = id => {
    const { queryValue, pageIndex, pageSize } = this.state;
    this.setState({ loading: true })
    batchRemoveReportTask(id).then(response => {
      defaultHandleResponse(response);
      this.getQuery(queryValue, pageIndex, pageSize);
    });
  };

  handleSearch = values => {
    this.searchParams = values;
  };

  //下载模版
  downLoadTemplate = () => {
    downloadFile('smartsafe/DatColReportController/getTemplate', {});
  };

  //解析导入模版
  handleUploadFile = info => {
    const { status, response } = info.file;
    this.setState({ loading: true });
    if (status === 'done') {
      for (let i = 0; i < response.resultObject.length; i++) {
        response.resultObject[i].id = i.toString();
      }
      if (response.resultObject.length > 0) {
        this.showImportModalFlag(true);
      } else {
        message.error('导入模版为空');
      }
      this.setState({
        importList: response.resultObject,
        reImportList: response.resultObject,
        loading: false,
      });
    }
  };

  //解析导入模版导入设置
  setImport = list => {
    this.setState({
      importList: list,
    });
  };

  //解析导入模版导入搜索
  reSetImport = list => {
    this.setState({
      reImportList: list,
    });
  };

  render() {
    const {
      list,
      loading,
      pageInfo,
      showModal,
      showResModal,
      editValue,
      queryValue,
      showImportModal,
      titleSwitch,
      reportValue,
      reportList,
      selectedRowKeys,
      pageIndex,
      pageSize,
      importList,
      reImportList,
      showProgModal,
    } = this.state;
    return (
      <div className="fullHeight ub ub-ver">
        <div className={classNames(styles.buttonsBar, 'buttons-group')}>
          <Button type="primary" onClick={this.showModalFlag}>
            <MyIcon type="iconxinjian1x" />
           新增任务
          </Button>
          {/* 增加新任务 */}
          <AddTaskFrom
            showModal={showModal}
            showModalFlag={this.showModalFlag}
            getQuery={this.getQuery}
            titleSwitch={titleSwitch}
            editValue={editValue}
            pageIndex={pageIndex}
            pageSize={pageSize}
            queryValue={queryValue}
          />
          {/* 报备进度 */}

          <ReportProgress
            reportList={reportList}
            showProgModal={showProgModal}
            progModal={this.progModal}
          />
          {/* 重新提交报备 */}
          <SubRep
            showResModal={showResModal}
            showResModalFlag={this.showResModalFlag}
            getQuery={this.getQuery}
            reportValue={reportValue}
            pageIndex={pageIndex}
            pageSize={pageSize}
            queryValue={queryValue}
          />
          {/* 导入模版文件 */}
          <Upload
            name="file"
            action="smartsafe/DatColReportController/parseTemplate"
            headers={{ 'signature-sessionId': window.name }}
            accept=".csv"
            showUploadList={false}
            onChange={this.handleUploadFile}
          >
            <Button type="default" className={styles.buttonUpload}>
              <MyIcon type="iconxiazai1x" />
             模板导入
            </Button>
          </Upload>
          {/* 导入模版框 */}
          <ImpTem
            className={styles.importModal}
            showImportModal={showImportModal}
            showImportModalFlag={this.showImportModalFlag}
            importList={importList}
            reImportList={reImportList}
            getQuery={this.getQuery}
            queryValue={queryValue}
            pageIndex={pageIndex}
            pageSize={pageSize}
            setImport={this.setImport}
            reSetImport={this.reSetImport}
          />
          {/* 下载模版 */}
          <a onClick={this.downLoadTemplate}>
            下载模板
          </a>
        </div>
        <div className="ub-f1">
          <Table
            rowKey="datcolTaskId"
            checkable
            loading={loading}
            dataSource={list}
            pagination={pageInfo}
            columns={this.getColumns()}
            onChange={(Index, Size, fromResize) => this.getTabs(Index, Size, fromResize)}
            selectedRowKeys={selectedRowKeys}
            expandedRowRender={record => (
              <div className={styles.expanded}>
                <div> 传输形式：{record.transType == 'interface' ? '接口' : '文件'}</div>
                <div> 通讯协议：{record.transProtocol}</div>
                <div> 采集端口：{record.colPort}</div>
                <div className={styles.expanded.expandedDiv} />
                <div className={styles.expanded.expandedDiv} />
                <div className={styles.expanded.expandedDiv} />
              </div>
            )}
            multiBtnList={[
              {
                text: '批量删除',
                onClick: this.getBatchRemove,
              },
              {
                text: '批量提交报备',
                onClick: this.showResModalFlag,
              },
              {
                text: '批量重新提交',
                onClick: this.showResModalFlag,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}
export default TabContent;
