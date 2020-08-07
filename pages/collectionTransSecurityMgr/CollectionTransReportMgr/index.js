import React from 'react';
import { Tabs, Badge } from 'antd';
import AdvancedFilter from '@/components/AdvancedFilter';
import TabContent from './TabContent';
import { APPROVAL_STATES, DATASOURCE_TAPE, TRANS_PROTOCOL, TRANSFER_FORM } from './const';
import styles from './index.less';

class CollectionTransReportMgr extends React.Component {
  constructor(props) {
    super(props);
    this.tabRefs = {};
    const tabsData = [
      {
        name:  '全部' ,
        num: 0,
      },
    ].concat(APPROVAL_STATES.map(o => ({ name: o.label, num: 0 })));
    this.state = {
      activeTab: 0,
      tabsData,
      testValues: {},
    };
  }

  onRef = ref => {
    this.child = ref;
  };

  getSearchArr = () => {
    return [
      {
        name: 'taskName',
        label:  '采集任务名称',
      },
      {
        name: 'taskIp',
        label:  '采集任务IP' ,
      },
      {
        name: 'datasourceIp',
        label:  '数据源IP' ,
      },
      {
        type: 'select',
        name: 'transType',
        label:  '传输形式' ,
        dataSource: TRANSFER_FORM,
      },
      {
        type: 'select',
        name: 'transProtocol',
        label:  '通信协议',
        dataSource: TRANS_PROTOCOL,
      },
      {
        type: 'select',
        name: 'datasourceType',
        label:  '数据源类型' ,
        dataSource: DATASOURCE_TAPE,
      },
    ];
  };

  handleSearch = (params, pageIndex = 1) => {
    console.log(params)
    const { activeTab } = this.state;
    console.log( activeTab ) 
    if (activeTab == 1) {
      params.state = 'PASS';
    } else if (activeTab == 2) {
      params.state = 'REJECT';
    } else if (activeTab == 3) {
      params.state = 'SUBMITTED';
    } else if (activeTab == 4) {
      params.state = 'WAIT_SUBMIT';
    } else if (activeTab == 5) {
      params.state = 'REJECT_SUBMIT';
    }
    this.child.getQuery(params, pageIndex, this.child.state.pageSize);
    this.setState({ 
      testValues: params,

     }); //含查询时设置值
  };

  render() {
    const { activeTab, tabsData, testValues } = this.state;
    return (
      <div className="fullHeight ub ub-ver">
        <AdvancedFilter
          canFold={false}
          columnNumber={4}
          onSearch={this.handleSearch}
          searchArr={this.getSearchArr()}
        />
        <Tabs
          className={styles.tabs}
          activeKey={`${activeTab}`}
          onChange={tab => {
            this.setState({ activeTab: tab });
          }}
        >
          {tabsData.map((o, index) => (
            <Tabs.TabPane 
              key={`${index}`} 
              tab={
                <span>
                  {o.name}
                  <Badge count={23499} overflowCount={9999} style={{ backgroundColor: '#52c41a',display:'relative', top:'-2px',marginLeft:'5px'}} />
                </span>
                
              
              }
            >
              <TabContent onRef={this.onRef} activeTab={activeTab} testValues={testValues} />
            </Tabs.TabPane>
              ))}
        </Tabs>
       
      </div>
    );
  }
}

export default CollectionTransReportMgr;
