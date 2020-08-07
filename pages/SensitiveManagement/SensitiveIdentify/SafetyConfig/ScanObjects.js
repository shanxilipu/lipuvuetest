import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Table, Button, message } from 'antd';
import styles from './index.less';
import ObjectSelector from './ObjectSelector';

const { Column } = Table;

class ScanObjects extends PureComponent {
  // ===================================
  // life cycle
  // ===================================

  constructor(props) {
    super(props);
    this.state = {
      isInitTableStatus: true,
      selectedRows: [],
      selectedRowKeys: [],
      dataSource: [],
    };
  }

  componentDidMount() {
    const { viewDidMountHandler } = this.props;

    if (viewDidMountHandler) {
      viewDidMountHandler('ScanObjects', this);
    }
  }

  // ===================================
  // events
  // ===================================

  getSelectedRowKeys = () => {
    const dataSource = this.getDataSource();
    return { dataSource };
  };

  resetModel = () => {
    this.setState({
      isInitTableStatus: true,
      selectedRows: [],
      selectedRowKeys: [],
      dataSource: [],
    });
  };

  handleDeleteItem = datasourceId => {
    const dataList = this.getDataSource();
    const data = dataList.find(o => o.key === `${datasourceId}`);
    if (data) {
      const index = dataList.indexOf(data);
      if (index !== -1) {
        dataList.splice(index, 1);
        if (dataList.length > 0) {
          for (let i = 0; i < dataList.length; i++) {
            dataList[i].serialNumber = i + 1;
          }
        }
        this.setState({
          isInitTableStatus: false,
          dataSource: dataList,
        });
      }
    }
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  };

  multiDeleteItem = () => {
    const { selectedRows } = this.state;
    const dataList = this.getDataSource();
    if (selectedRows && selectedRows.length === 0) {
      message.error(
        `${formatMessage({
          id: 'SafetyConfig.SelectItemDeletedTip',
          defaultMessage: '请至少选择一条数据进行批量删除',
        })}`
      );
    } else {
      for (let i = 0; i < selectedRows.length; i++) {
        const data = dataList.find(
          o => o.key === `${selectedRows[i].datasourceId || selectedRows[i].key}`
        );
        if (data) {
          const index = dataList.indexOf(data);
          if (index !== -1) {
            dataList.splice(index, 1);
          }
        }
      }
      if (dataList.length > 0) {
        for (let i = 0; i < dataList.length; i++) {
          dataList[i].serialNumber = i + 1;
        }
      }
      this.setState({
        isInitTableStatus: false,
        dataSource: dataList,
        selectedRowKeys: [],
        selectedRows: [],
      });
    }
  };

  showObjectSelection = () => {
    this.setState({ showSelection: true });
  };

  handleCancelSelection = () => {
    this.setState({ showSelection: false });
  };

  getDataSource = () => {
    const { dataSource, isInitTableStatus } = this.state;
    const { editedItem } = this.props;
    let dataList = JSON.parse(JSON.stringify(dataSource));
    if (
      isInitTableStatus &&
      dataList.length === 0 &&
      editedItem &&
      editedItem.safeItemObjectList &&
      editedItem.safeItemObjectList.length > 0
    ) {
      dataList = JSON.parse(JSON.stringify(editedItem.safeItemObjectList));
      for (let i = 0; i < dataList.length; i++) {
        dataList[i].serialNumber = i + 1;
        dataList[i].key = `${dataList[i].datasourceId}`;
      }
    }
    return dataList;
  };

  handleDoneSelection = treeDatasourceKeyTitle => {
    this.setState({ showSelection: false });
    const dataList = this.getDataSource();
    if (treeDatasourceKeyTitle && treeDatasourceKeyTitle.length > 0) {
      treeDatasourceKeyTitle.forEach(item => {
        const keyItem = item.key.split('_');
        if (keyItem.length === 2) {
          let b = false;
          const newDataInDataSource = {
            serialNumber: dataList.length + 1,
            datasourceName: item.title,
            datasourceType: keyItem[0],
            key: keyItem[1],
          };
          if (dataList && dataList.length > 0) {
            dataList.forEach(o => {
              if (o.key === keyItem[1]) {
                b = true;
                message.error(
                  `${item.title}${formatMessage({
                    id: 'SafetyConfig.DataAlreadyExists',
                    defaultMessage: '数据已经存在',
                  })}`
                );
              }
            });
            if (!b) {
              dataList.push(newDataInDataSource);
            }
          } else {
            dataList.push(newDataInDataSource);
          }
        }
      });
    }
    this.setState({
      dataSource: dataList,
    });
  };

  // ===================================
  // render
  // ===================================

  render() {
    const { selectedRowKeys, showSelection } = this.state;
    const { editable } = this.props;
    const dataList = this.getDataSource();
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: () => ({ disabled: !editable }),
    };
    const footer = () => {
      return (
        <div>
          <span>
            {formatMessage({ id: 'SELECTED', defaultMessage: '已选中' })}
            {selectedRowKeys.length}/{dataList.length}
            {formatMessage({ id: 'ITEMS', defaultMessage: '个' })}
          </span>
          <Button
            type="default"
            className={styles.ml10}
            disabled={!editable}
            onClick={this.multiDeleteItem}
          >
            {formatMessage({ id: 'COMMON_BATCH_DELETE', defaultMessage: '批量删除' })}
          </Button>
          <Button
            type="primary"
            className={styles.ml10}
            disabled={!editable}
            ghost
            onClick={this.showObjectSelection}
          >
            {formatMessage({ id: 'SafetyConfig.AddObject', defaultMessage: '新增对象' })}
          </Button>
        </div>
      );
    };
    return (
      <div>
        <Table
          rowKey="serialNumber"
          dataSource={dataList}
          rowSelection={rowSelection}
          pagination={false}
          footer={footer}
        >
          <Column
            title={formatMessage({ id: 'SafetyConfig.SerialNumber', defaultMessage: '序号' })}
            dataIndex="serialNumber"
            key="serialNumber"
          />
          <Column
            title={formatMessage({ id: 'SafetyConfig.ScanDatabase', defaultMessage: '扫描数据库' })}
            dataIndex="datasourceName"
            key="datasourceName"
          />
          <Column
            title={formatMessage({ id: 'SafetyConfig.DatabaseType', defaultMessage: '数据库类型' })}
            dataIndex="datasourceType"
            key="datasourceType"
          />
          <Column
            title={formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}
            dataIndex="opts"
            key="opts"
            render={(text, record) => (
              <span>
                <a onClick={() => this.handleDeleteItem(record.key)} disabled={!editable}>
                  {formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
                </a>
              </span>
            )}
          />
        </Table>
        <ObjectSelector
          visible={showSelection}
          cancelHandler={this.handleCancelSelection}
          doneHandler={this.handleDoneSelection}
        />
      </div>
    );
  }
}
export default ScanObjects;
