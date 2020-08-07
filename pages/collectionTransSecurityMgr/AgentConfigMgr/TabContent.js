import React from 'react';
import { Button, Popconfirm, Badge, Modal, Upload } from 'antd';
import classNames from 'classnames';
import Table from '@/components/Table';
import styles from './index.less';
import MyIcon from '@/components/MyIcon';
import AdvancedFilter from '@/components/AdvancedFilter';
import { defaultHandleResponse, downloadFile } from '@/utils/utils';
import {
  queryAgent,
  removeAgent,
  syncWhitelist,
  queryAgentSyncInfo,
} from '@/services/functionalDesign/agentListController';
import AddAgent from './AddAgent';

class TabContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      showProgModal: false,
      showModal: false,
      queryValue: {},
      titleSwitch: false,
      editValue: '',
      selectedRowKeys: [],
      pageIndex: 1,
      pageSize: 10,
      logList: [],
      logLoading: false,
      logPageInfo: {},
      logPageSize: 9,
      logInfo: {},
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  //日志查询文字
  getSearchArr = () => {
    return [
      {
        type: 'input',
        name: 'datasourceIp',
        label: '数据源IP',
      },
      {
        type: 'select',
        name: 'executeResult',
        label: '状态',
        dataSource: [
          { value: '0', label: '成功' },
          { value: '1', label: '失败' },
          { value: '-1', label: '连机失败' },
        ],
      },
    ];
  };

  //Table顶栏名称
  getColumns = () => {
    return [
      {
        dataIndex: 'agentId',
        title: 'ID',
      },
      {
        dataIndex: 'agentName',
        title: '名称',
      },
      {
        dataIndex: 'agentIp',
        title: 'IP'
      },
      {
        dataIndex: 'agentPort',
        title: 'Port'
      },
      {
        dataIndex: 'createDatetime',
        title: '添加日期'
      },
      {
        dataIndex: 'agentOnline',
        title: '状态',
        render: agentOnline => {
          return (
            <div>
              <Badge
                status={agentOnline === '0' ? 'success' : 'error'}
                text={agentOnline === '0' ? '在线' : '离线'}
              />
            </div>
          );
        },
      },
      {
        dataIndex: 'index',
        title: '操作',
        render: (values, index) => (
          <div className={styles.operaAgentId}>
            <a onClick={() => { this.editButton(index) }}>
              <MyIcon type="iconbianjix" />
            </a>
            <span>|</span>
            <Popconfirm
              title="确定删除该任务吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                this.getRemove([index.agentId]);
              }}
            >
              <a>
                <MyIcon type="iconshanchubeifenx" />
              </a>
            </Popconfirm>
            <span>|</span>
            <Popconfirm
              title="确定同步白名单策略吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                this.getSynStr(index.agentId);
              }}
            >
              <a>
                <MyIcon type="iconshuaxincircle" />
              </a>
            </Popconfirm>
            <span>|</span>
            <a onClick={() => this.getLogId(index.agentId)}>
              <MyIcon type="icon027bianjibeifen31x" />
            </a>
          </div>
        ),
      },
    ];
  };

  //日志Table顶栏名称
  getLogColumns = () => {
    return [
      {
        dataIndex: 'datasourceIp',
        title: '策略IP'
      },
      {
        dataIndex: 'colPort',
        title: '策略Port'
      },
      {
        dataIndex: 'createTime',
        title: '同步时间',
      },
      {
        dataIndex: 'executeResult',
        title: '状态',
        render: executeResult => {
          return (
            <div>
              <Badge
                status={
                  executeResult === '0'
                   ? 'success'
                   : 'error'
                }
                text={
                  executeResult === '0'
                   ? '成功' 
                   : executeResult === '1'
                   ? '失败' 
                   : '连机失败'
                }
              />
            </div>
          );
        },
      },
    ];
  };

  //新增Modal显示
  showModalFlag = flag => {
    if (typeof flag == 'object') {
      this.setState({
        showModal: true,
        titleSwitch: true, //判断是新增还是编辑
      });
    } else {
      this.setState({
        showModal: flag,
        titleSwitch: true,
      });
    }
  };

  //编辑Modal显示
  editButton = values => {
    this.setState({
      showModal: true,
      editValue: values,
      titleSwitch: false,
    });
  };

  //同步策略
  getSynStr = id => {
    this.setState({ loading:true })
    syncWhitelist({ id }).then(response => {
      defaultHandleResponse(response);
    });
    this.setState({ loading:false })
  };

  //查询且设置页码相关信息
  getTabs = (Index, Size) => {
    const { testValues } = this.props;
    this.getQuery(testValues, Index, Size);
    this.setState({
      pageSize: Size,
      pageIndex: Index,
    });
  };

  getLogTabs = (pageIndex, pageSize) => {
    const { logInfo } = this.state;
    this.getLogQuery(logInfo, pageIndex, pageSize);
    this.setState({
      logPageSize: pageSize,
    });
  };

  //查询
  getQuery = (params, Index, Size) => {
    this.setState({
      loading: true,
      queryValue: params,
    });
    params.pageIndex = Index;
    params.pageSize = Size;
    queryAgent(params).then(response => {
      defaultHandleResponse(response, resultObject => {
        const { rows = [], pageInfo } = resultObject;
        this.setState({ list: rows, pageInfo, selectedRowKeys: [], pageIndex: Index });
      });
      this.setState({ loading: false });
    });
  };

  //初值设置
  getLogId = id => {
    this.setState({ logInfo: { agentId: id } });
    this.getLogQuery({ agentId: id });
  };

  //日志查询
  getLogQuery = (params, logPageIndex = 1, logPageSize = 9) => {
    params.pageIndex = logPageIndex;
    params.pageSize = logPageSize;
    this.setState({ logLoading: true });
    queryAgentSyncInfo(params).then(response => {
      defaultHandleResponse(response, resultObject => {
        const { rows, pageInfo } = resultObject;
        this.setState({
          logList: rows,
          logPageInfo: pageInfo,
          logPageSize: pageInfo.pageSize,
        });
      });
      this.setState({ logLoading: false });
    });
    this.progModal(true);
  };

  //是否显示Modal框
  progModal = flag => {
    if (flag) {
      this.setState({
        showProgModal: flag,
      });
    } else {
      this.setState({
        showProgModal: flag,
        logList: [],
      });
    }
  };

  //点击删除
  getRemove = id => {
    const { queryValue, pageIndex, pageSize } = this.state;
    this.setState({ loading: true });
    removeAgent({ id }).then(response => {
      defaultHandleResponse(response);
      this.getQuery(queryValue, pageIndex, pageSize);
    });
  };

  //日志点击搜索
  handleLogSearch = (params, logPageIndex = 1) => {
    const { logInfo, logPageSize } = this.state;
    params.agentId = logInfo.agentId;
    this.getLogQuery(params, logPageIndex, logPageSize);
  };

  //下载模版
  downLoadTemplate = () => {
    downloadFile('smartsafe/AgentManagerController/getTemplate', {});
  };

  //导入模版
  handleUploadFile = info => {
    const { status, response } = info.file;
    const { pageIndex, pageSize, queryValue } = this.state;
    if (status === 'done') {
      defaultHandleResponse(response, () => {
        this.getQuery(queryValue, pageIndex, pageSize);
      });
    }
  };

  render() {
    const {
      list,
      pageInfo,
      loading,
      showModal,
      selectedRowKeys,
      editValue,
      logLoading,
      titleSwitch,
      pageIndex,
      pageSize,
      logList,
      queryValue,
      logPageInfo,
      showProgModal,
    } = this.state;

    return (
      <div className="fullHeight ub ub-ver">
        <div className={classNames(styles.buttonsBar, 'buttons-group')}>
          <Button type="primary" onClick={this.showModalFlag}>
            <MyIcon type="iconxinjian1x" />
            新增
          </Button>
          {/* 增加新Agent */}
          <AddAgent
            showModal={showModal}
            showModalFlag={this.showModalFlag}
            getQuery={this.getQuery}
            titleSwitch={titleSwitch}
            editValue={editValue}
            pageIndex={pageIndex}
            pageSize={pageSize}
            queryValue={queryValue}
          />
          {/* 日志弹窗 */}
          <Modal
            bodyStyle={{ padding: 0 }}
            width={794}
            title="日志"
            visible={showProgModal}
            onOk={() => this.progModal(false)}
            onCancel={() => this.progModal(false)}
          >
            <div>
              <AdvancedFilter
                className={styles.logModal}
                canFold={false}
                pagination={logPageInfo}
                columnNumber={3}
                onSearch={this.handleLogSearch}
                searchArr={this.getSearchArr()}
              />
              <div className={styles.modalHeight}>
                <Table
                  rowKey="k"
                  loading={logLoading}
                  pagination={logPageInfo}
                  dataSource={logList}
                  columns={this.getLogColumns()}
                  onChange={(Index, Size, fromResize) => this.getLogTabs(Index, Size, fromResize)}
                />
              </div>
            </div>
          </Modal>
          <Upload
            name="file"
            action="smartsafe/AgentManagerController/uploadTemplate"
            headers={{ 'signature-sessionId': window.name }}
            accept=".csv"
            showUploadList={false}
            onChange={this.handleUploadFile}
            beforeUpload={() => { }}
          >
            <Button type="default" className={styles.buttonUpload}>
              <MyIcon type="iconxiazai1x" />
              模板导入
            </Button>
          </Upload>
          <a onClick={this.downLoadTemplate}>
            下载模板
          </a>
        </div>
        <div className="ub-f1">
          <Table
            rowKey="agentId"
            loading={loading}
            dataSource={list}
            pagination={pageInfo}
            columns={this.getColumns()}
            onChange={(Index, Size, fromResize) => this.getTabs(Index, Size, fromResize)}
            selectedRowKeys={selectedRowKeys}
          />
        </div>
      </div>
    );
  }
}
export default TabContent;
