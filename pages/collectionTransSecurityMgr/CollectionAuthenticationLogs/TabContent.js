import React from 'react';
import {  Badge } from 'antd';
import Table from '@/components/Table';
import { defaultHandleResponse } from '@/utils/utils';
import { queryAuthentication } from '@/services/functionalDesign/authenticationLogQuery';
import styles from './index.less';

class TabContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      selectedRowKeys: [],
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
        title:  '采集任务名称',
      },
      {
        dataIndex: 'taskDue',
        title: '采集任务账期' ,
      },
      {
        dataIndex: 'datasourceType',
        title: '数据源类型' ,
        sorter: (a, b) => (a.datasourceType > b.datasourceType ? 1 : -1),
      },
      {
        dataIndex: 'authResult',
        title: '鉴权结果',
        sorter: (a, b) => (a.authResult > b.authResult ? 1 : -1),
        render: authResult => {
          return (
            <div>
              <Badge
                status={
                  authResult == 'ACCETP' ? 'success' : authResult == 'REJECT' ? 'error' : 'warning'
                }
                text={
                  authResult == 'ACCETP'
                    ? '鉴权通过'
                    : authResult == 'REJECT'
                    ? '鉴权失败'
                    : '任务丢弃'
                }
              />
            </div>
          );
        },
      },
      {
        dataIndex: 'failReason',
        title: '失败原因' ,
      },
      {
        dataIndex: 'authDatetime',
        title: '鉴权采集时间' ,
        sorter: (a, b) => (a.authDatetime > b.authDatetime ? 1 : -1),
      },
    ];
  };

  //查询设置页码信息
  getTabs = (Index, Size) => {
    const { testValues } = this.props;
    this.getQuery(testValues, Index, Size);
  };

  //查询
  getQuery = (params, Index, Size) => {
    this.setState({
      loading: true,
    });
    params.pageIndex = Index;
    params.pageSize = Size;
    queryAuthentication(params).then(response => {
        defaultHandleResponse(response, resultObject => {
          const { rows = [], pageInfo = { Index } } = resultObject;
          this.setState({ list: rows, pageInfo, selectedRowKeys: [] });
        });
      this.setState({ loading: false });
    });
  };

  render() {
    const { list, pageInfo, loading, selectedRowKeys } = this.state;
    return (
      <div className="fullHeight ub ub-ver">
        <div className="ub-f1">
          <Table
            rowKey="id"
            loading={loading}
            dataSource={list}
            pagination={pageInfo}
            columns={this.getColumns()}
            onChange={(Index, Size, fromResize) => this.getTabs(Index, Size, fromResize)}
            selectedRowKeys={selectedRowKeys}
            expandedRowRender={record => (
              <div className={styles.expanded}>
                <div> 采集源IP地址：{record.sourceIp} </div>
                <div> 传输形式：{record.transType == 'interface' ? '接口' : '文件'}</div>
                <div> 采集端口：{record.colPort}</div>
                <div> 通讯协议：{record.transProtocol}</div>
                <div className={styles.expanded.expandedDiv} />
                <div className={styles.expanded.expandedDiv} />
              </div>
            )}
          />
        </div>
      </div>
    );
  }
}
export default TabContent;
