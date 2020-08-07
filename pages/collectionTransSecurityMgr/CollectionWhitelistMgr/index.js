import React from 'react';
import TabContent from './TabContent';
import AdvancedFilter from '@/components/AdvancedFilter';
import { DATASOURCE_TAPE } from './const';
import styles from './index.less';

class CollectionWhitelistMgr extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testValues: {},
    };
  }

  onRef = ref => {
    this.child = ref;
  };

  getSearchArr = () => {
    return [
      {
        type: 'select',
        name: 'datasourceType',
        label:  '数据源类型' ,
        dataSource: DATASOURCE_TAPE,
      },
      {
        type: 'input',
        name: ' datasourceCode',
        label:  '数据源编码' ,
      },
      {
        type: 'input',
        name: 'datasourceName',
        label: '数据源名称' ,
      },
      {
        type: 'input',
        name: 'taskName',
        label:  '任务名称' ,
      },
      {
        type: 'input',
        name: 'taskIp',
        label: '任务IP' ,
      },
      {
        type: 'rangePicker',
        name: 'addTime',
        label: '添加时间' ,
      },
    ];
  };

  //点击搜索
  handleSearch = (params, pageIndex = 1) => {
    if (params.addTime !== undefined && JSON.stringify(params.addTime) !== '[]') {
      params.endCreateTime = params.addTime[1].format('YYYY-MM-DD HH:mm:ss');
      params.startCreateTime = params.addTime[0].format('YYYY-MM-DD HH:mm:ss');
      delete params.addTime;
    }
    this.child.getQuery(params, pageIndex, this.child.state.pageSize);
    this.setState({ testValues: params }); //设置查询值
  };

  render() {
    const { testValues } = this.state;
    return (
      <div className="fullHeight ub ub-ver">
        <AdvancedFilter
          canFold={false}
          columnNumber={4}
          searchArr={this.getSearchArr()}
          onSearch={this.handleSearch}
        />
        <div className={styles.tabs}>
          <TabContent onRef={this.onRef} testValues={testValues}>
            {' '}
          </TabContent>
        </div>
      </div>
    );
  }
}

export default CollectionWhitelistMgr;
