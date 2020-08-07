import React from 'react';
import GroupTree from './GroupTree';
import DatasourceList from './DatasourceList';
import styles from './index.less';

class EncryptStorageGroupMgr extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTreeNode: {},
    };
  }

  render() {
    const { activeTreeNode } = this.state;
    return (
      <div className={styles.container}>
        <GroupTree
          activeTreeNode={activeTreeNode}
          setActiveTreeNode={node => this.setState({ activeTreeNode: { ...node } })}
        />
        <DatasourceList activeTreeNode={activeTreeNode} />
      </div>
    );
  }
}
export default EncryptStorageGroupMgr;
