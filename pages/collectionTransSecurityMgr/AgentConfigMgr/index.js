import React from 'react';
import AdvancedFilter from '@/components/AdvancedFilter';
import TabContent from './TabContent';
import styles from './index.less';

class AgentConfigMgr extends React.Component {
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
        type: 'input',
        name: 'agentIp',
        label: 'Agent IP' 
      },
      {
        type: 'input',
        name: 'agentPort',
        label: 'Agent Port' 
      },
      {
        type: 'rangePicker',
        name: 'addTime',
        label: '添加时间' 
      },
    ];
  };

  //查询搜索
  handleSearch = (params, pageIndex = 1) => {
    if (params.addTime !== undefined && JSON.stringify(params.addTime) !== '[]') {
      params.endCreateTime = params.addTime[1].format('YYYY-MM-DD HH:mm:ss');
      params.startCreateTime = params.addTime[0].format('YYYY-MM-DD HH:mm:ss');
      delete params.addTime;
    }
    this.child.getQuery(params, pageIndex, this.child.state.pageSize);
    this.setState({ testValues: params }); //查询时设置值
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

export default AgentConfigMgr;
