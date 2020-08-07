import React from 'react';
import { Button, Switch, Popconfirm, message, Upload } from 'antd';
import Modal from '@/components/Modal';
import classNames from 'classnames';
import Table from '@/components/Table';
import styles from './index.less';
import MyIcon from '@/components/MyIcon';
import { defaultHandleResponse, downloadFile } from '@/utils/utils';
import AddWhiteForm from './AddWhiteForm';
import {
  queryWhiteList,
  batchRemoveWhiteList,
  batchDisableWhiteList,
  batchEnableWhiteList,
  removeWhiteList,
} from '@/services/functionalDesign/dataWhiteListManagement';

const { confirm } = Modal;
class TabContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      showModal: false,
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
        dataIndex: 'datasourceCode',
        title: '数据源编码',
      },
      {
        dataIndex: 'state',
        title: '白名单状态',
        render: (state, Id) => (
          <div>
            <span onClick={() => this.onSwitch(Id)}>
              <Switch checked={state == 1} />
            </span>
            <span className={styles.switchStyle}>{state == 1 ? '启用' : '停用'}</span>
          </div>
        ),
      },
      {
        dataIndex: 'whiteListId',
        title: '操作',
        render: (whiteListId, value) => (
          <Popconfirm
            title="确定删除该任务吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() =>
              value.state == 2
                ? this.getRemove(whiteListId)
                : message.error('启用状态，不能删除')
            }
          >
            <a className={styles.operation}> 删除 </a>
          </Popconfirm>
        ),
      },
    ];
  };

  //新增任务对话框
  showModalFlag = (flag, load)=> {
    if (typeof flag == 'object') {
      this.setState({
        showModal: true,
      });
    } else {
      this.setState({
        showModal: flag,
        loading:load
      });
    }
  };

  //点击开关执行的启用或停用
  onSwitch = id => {
    const { queryValue, pageIndex, pageSize } = this.state;
    this.setState({ loading: true })
    if (id.state == 1) {
      batchDisableWhiteList([id.whiteListId]).then(response => {
        defaultHandleResponse(response);
        this.getQuery(queryValue, pageIndex, pageSize);
      });
    } else {
      batchEnableWhiteList([id.whiteListId]).then(response => {
        defaultHandleResponse(response);
        this.getQuery(queryValue, pageIndex, pageSize);
      });
    }
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

  //查询
  getQuery = (params, Index, Size) => {
    this.setState({
      loading: true,
      queryValue: params,
    });
    params.pageIndex = Index;
    params.pageSize = Size;
    queryWhiteList(params).then(response => {
      defaultHandleResponse(response, resultObject => {
        const { rows = [], pageInfo } = resultObject;
        this.setState({ list: rows, pageInfo, selectedRowKeys: [], pageIndex: Index });
      });
      this.setState({ loading: false });
    });
  };

  //批量删除
  getBatchRemove = ids => {
    const { list, queryValue, pageIndex, pageSize } = this.state;
    //判断是否有启用项
    for (let i = 0; i <= list.length; i++) {
      for (let j = 0; j < ids.length; j++) {
        if (i < list.length && list[i].whiteListId == ids[j]) {
          if (list[i].state == 1) {
            message.error('含有启用状态，不能删除');
            return false;
          }
        } else if (i == list.length) {
          confirm({
            title: '删除确认',
            content: '确认批量删除选中行吗？',
            width: '433px',
            onOk: () => {
              this.setState({ loading: true })
              batchRemoveWhiteList(ids).then(response => {
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

  //批量启用
  getBatchEnable = ids => {
    const { queryValue, pageIndex, pageSize } = this.state;
    confirm({
      title: '启用确认',
      content: '确认批量启用选中行吗？',
      width: '433px',
      onOk: () => {
        this.setState({ loading:true })
        batchEnableWhiteList(ids).then(response => {
          defaultHandleResponse(response);
          this.getQuery(queryValue, pageIndex, pageSize);
        });
      },
    });
  };

  //批量停用
  getBatchDisable = ids => {
    const { queryValue, pageIndex, pageSize } = this.state;
    confirm({
      title: '停用确认',
      content: '确认批量停用选中行吗？',
      width: '433px',
      onOk: () => {
        this.setState({ loading:true })
        batchDisableWhiteList(ids).then(response => {
          defaultHandleResponse(response);
          this.getQuery(queryValue, pageIndex, pageSize);
        });
      },
    });
  };

  //点击删除
  getRemove = id => {
    const { queryValue, pageIndex, pageSize } = this.state;
    this.setState({ loading:true })
    removeWhiteList({ id }).then(response => {
      defaultHandleResponse(response);
      this.getQuery(queryValue, pageIndex, pageSize);
    });
  };

  //下载模版
  downLoadTemplate = () => {
    downloadFile('smartsafe/DatColWhiteListController/getTemplate', {});
  };

  //导入模版
  handleUploadFile = info => {
    const { status, response } = info.file;
    const { pageIndex, pageSize, queryValue } = this.state;
    if (status === 'done') {
      defaultHandleResponse(response, () => {
        message.success('导入成功');
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
      pageIndex,
      pageSize,
      queryValue,
    } = this.state;
    return (
      <div className="fullHeight ub ub-ver">
        <div className={classNames(styles.buttonsBar, 'buttons-group')}>
          <Button type="primary" onClick={this.showModalFlag}>
            <MyIcon type="iconxinjian1x" />
            新增
          </Button>
          {/* 增加新任务 */}
          <AddWhiteForm
            showModal={showModal}
            showModalFlag={this.showModalFlag}
            getQuery={this.getQuery}
            pageIndex={pageIndex}
            pageSize={pageSize}
            queryValue={queryValue}
          />
          {/* 模版导入 */}
          <Upload
            name="file"
            action="smartsafe/DatColWhiteListController/uploadTemplate"
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
          {/* 下载模版 */}
          <a onClick={this.downLoadTemplate}>
            下载模板
          </a>
        </div>

        <div className="ub-f1">
          <Table
            rowKey="whiteListId"
            checkable
            loading={loading}
            dataSource={list}
            pagination={pageInfo}
            columns={this.getColumns()}
            onChange={(Index, Size, fromResize) => this.getTabs(Index, Size, fromResize)}
            selectedRowKeys={selectedRowKeys}
            multiBtnList={[
              {
                text: '批量删除',
                onClick: this.getBatchRemove,
              },
              {
                text: '批量启用',
                onClick: this.getBatchEnable,
              },
              {
                text: '批量停用',
                onClick: this.getBatchDisable,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}
export default TabContent;
