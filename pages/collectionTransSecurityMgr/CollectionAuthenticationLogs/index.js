import React from 'react';
import AdvancedFilter from '@/components/AdvancedFilter';
import { DATASOURCE_TAPE, AUTHENTICATION_RES } from './const';
import TabContent from './TabContent';
import styles from './index.less';

class AuthenticationLogs extends React.Component {
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
        name: 'taskName',
        label: '任务名称' ,
      },
      {
        type: 'input',
        name: 'taskDue',
        label:  '任务账期' ,
      },
      {
        type: 'select',
        name: 'authResult',
        label: '鉴权结果',
        dataSource: AUTHENTICATION_RES,
      },
      {
        type: 'select',
        name: 'datasourceType',
        label:  '数据源类型' ,
        dataSource: DATASOURCE_TAPE,
      },
      {
        type: 'rangePicker',
        name: 'authenTime',
        label:  '鉴权时间' ,
      },
    ];
  };

  //查询搜索
  handleSearch = (params, pageIndex = 1) => {
    if (params.authenTime !== undefined && JSON.stringify(params.authenTime) !== '[]') {
      params.endAuthTime = params.authenTime[1].format('YYYY-MM-DD HH:mm:ss');
      params.startAuthTime = params.authenTime[0].format('YYYY-MM-DD HH:mm:ss');
      delete params.authenTime;
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

export default AuthenticationLogs;
