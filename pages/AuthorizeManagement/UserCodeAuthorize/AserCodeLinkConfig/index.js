import React, { Component } from 'react';
import { connect } from 'dva';
import TreeCatalog from './components/treeCatalog';
import styles from './index.less';
import HostAccountsLink from './components/HostAccountsLink';
import DbAccountsLink from './components/DbAccountsLink';
import { getCurrentHostAddr } from '@/services/authorizeManagement/userCodeLinkConfig';
import { defaultHandleResponse } from '@/utils/utils';

@connect(({ UserCodeLinkModel }) => ({
  selectedItem: UserCodeLinkModel.selectedItem,
}))
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIpAddr: '',
    };
  }

  componentDidMount() {
    getCurrentHostAddr().then(response => {
      defaultHandleResponse(response, (currentIpAddr = '') => {
        this.setState({ currentIpAddr });
      });
    });
  }

  render() {
    const { currentIpAddr } = this.state;
    return (
      <div className={`${styles.mainCon} smartsafeCon`}>
        <TreeCatalog />
        <div className={styles.rightCon}>
          <HostAccountsLink currentIpAddr={currentIpAddr} />
          <DbAccountsLink currentIpAddr={currentIpAddr} />
        </div>
      </div>
    );
  }
}

export default Home;
