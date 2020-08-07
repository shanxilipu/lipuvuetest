import React from 'react';
import { Input, Select, Modal } from 'antd';
import Table from '@/components/Table';
import styles from './index.less';
import { defaultHandleResponse } from '@/utils/utils';
import { batchAddData } from '@/services/functionalDesign/dataReportTaskManagement';

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;
class ImportTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
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
        dataIndex: 'transType',
        title: '传输形式',
        render: transType => <span>{transType == 'interface' ? '接口' : '文件'}</span>,
      },
      {
        dataIndex: 'transProtocol',
        title: '通信协议',
      },
      {
        dataIndex: 'colPort',
        title: '采集端口',
      },
      {
        dataIndex: 'isCover',
        title: '操作',
        render: (isCover, index) => (
          <Select
            value={isCover == 0 ? '新增' : isCover == 1 ? '覆盖' : '忽略'}
            onChange={value => this.setSelect(value, index.id)}
          >
            <Option value="0">新增</Option>
            <Option value="1">覆盖</Option>
            <Option value="2">忽略</Option>
          </Select>
        ),
      },
    ];
  };

  //Select选择时调用
  setSelect = (value, id) => {
    if (value == 0) {
      this.setBatchAdd([id]);
    } else if (value == 1) {
      this.setBatchCover([id]);
    } else {
      this.setBatchIgnore([id]);
    }
  };

  //Modal的显示和消失
  hideModal = (falg, load) => {
    const { showImportModalFlag } = this.props;
    showImportModalFlag(falg, load);
  };

  //查询
  inputSearch = value => {
    const { importList, reSetImport } = this.props;
    if (value == '') {
      reSetImport(importList);
    } else {
      reSetImport(importList.filter(item => item.taskName == value));
    }
  };

  //点击确定后批量添加
  handleOk = () => {
    const { reImportList, pageIndex, pageSize, queryValue, getQuery } = this.props;
    batchAddData(reImportList.filter(item => item.isCover !== '2')).then(response => {
      defaultHandleResponse(response, () => {
        getQuery(queryValue, pageIndex, pageSize);
      });
    });
    this.hideModal( false, true );
  };

  //批量删除
  batchRemove = ids => {
    const { importList, setImport } = this.props;
    const List = importList;
    confirm({
      title: '删除确认',
      content: '确认批量删除选中行吗？',
      width: '433px',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        for (let i = 0; i < List.length; i++) {
          for (let s = 0; s < ids.length; s++) {
            if (List[i].id == ids[s]) {
              List.splice(i, 1);
            }
          }
        }
        for (let i = 0; i < List.length; i++) {
          List[i].id = i.toString();
        }
        setImport(List);
      }
    })
  };

  //设置新增
  setBatchAdd = ids => {
    const { importList, setImport } = this.props;
    const list = importList;
    ids.forEach(id => {
      list[id].isCover = '0';
    });
    setImport(list);
  };

  //设置覆盖
  setBatchCover = ids => {
    const { importList, setImport } = this.props;
    const list = importList;
    ids.forEach(id => {
      list[id].isCover = '1';
    });
    setImport(list);
  };

  //设置忽略
  setBatchIgnore = ids => {
    const { importList, setImport } = this.props;
    const list = importList;
    ids.forEach(id => {
      list[id].isCover = '2';
    });
    setImport(list);
  };

  render() {
    const { selectedRowKeys } = this.state;
    const { showImportModal, reImportList } = this.props;
    return (
      <Modal
        width={1200}
        title="采集任务导入确认"
        visible={showImportModal}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
      >
        <div className="fullHeight ub ub-ver">
          <div className={styles.inputSearch}>
            <Search placeholder="请输入" onSearch={this.inputSearch} enterButton />
          </div>
          <div className="ub-f1">
            <div className={styles.inputmodalHeight}>
              <Table
                rowKey="id"
                checkable
                dataSource={reImportList}
                columns={this.getColumns()}
                selectedRowKeys={selectedRowKeys}
                paginationProps={{ showPagination: false }}
                multiBtnList={[
                  {
                    text: '批量设置新增',
                    onClick: this.setBatchAdd,
                  },
                  {
                    text: '批量设置覆盖',
                    onClick: this.setBatchCover,
                  },
                  {
                    text: '批量设置忽略',
                    onClick: this.setBatchIgnore,
                  },
                  {
                    text: '批量删除',
                    onClick: this.batchRemove,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
export default ImportTemplate;
