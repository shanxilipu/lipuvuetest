import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import SysCatlog from '../KeyManagement/components/SysCatlog';

@connect()
class CatalogAuth extends PureComponent {
  state = {
    treeData: [],
    selectedKeys: [],
  };

  searchInfo = {
    keyword: '',
  };

  componentDidMount() {
    const { resetSelectedCode } = this.props;
    if (resetSelectedCode) {
      resetSelectedCode(this.resetSelectedCode);
    }
    this.getTreeData();
  }

  getTreeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyAuth/listSystemTree',
      payload: {
        ...this.searchInfo,
      },
    }).then(res => {
      if (!res) return;
      this.setState({
        treeData: res || [],
      });
    });
  };

  onSelect = (id, select) => {
    const {
      node: {
        props: { item },
      },
    } = select;
    const { appsysCode } = item;
    if (!appsysCode) return;
    this.setState({
      selectedKeys: id instanceof Array ? id : [id],
    });
    const { updateCode } = this.props;
    updateCode(appsysCode);
  };

  resetSelectedCode = () => {
    this.setState({
      selectedKeys: []
    })
  }

  searchFun = value => {
    this.searchInfo.keyword = value;
    this.getTreeData();
  };

  render() {
    const { treeData, selectedKeys } = this.state;
    return (
      <div className={classnames('ub-f1', styles.treeWrap)}>
        <SysCatlog
          data={treeData}
          selectedKeys={selectedKeys}
          onSelect={this.onSelect}
          searchFun={this.searchFun}
          title={formatMessage({ id: 'keyAuth.title', defaultMessage: '公钥归属应用系统' })}
        />
      </div>
    );
  }
}

export default CatalogAuth;
