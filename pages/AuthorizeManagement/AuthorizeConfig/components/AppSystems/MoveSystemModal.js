import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { formatMessage } from 'umi/locale';
import _ from 'lodash';
import TreeCatalog from '../AppSystemCatague';
import styles from './index.less';

class MoveSystemModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actItem: {},
    };
  }

  getItem = actItem => {
    this.setState({
      actItem,
    });
  };

  hideModal = () => {
    const { showModelFlag } = this.props;
    showModelFlag(false);
  };

  handleOk = () => {
    const { actItem } = this.state;
    if (_.isEmpty(actItem)) {
      message.info(`${formatMessage({ id: 'applySysUserManagement.MoveToDirectoryTip' })}`);
      return false;
    }
    const { moveSys } = this.props;
    if (moveSys) {
      moveSys(actItem);
    }
    this.hideModal();
  };

  render() {
    const { actItem } = this.state;
    const { showModel } = this.props;
    return (
      <Modal
        title={`${formatMessage({ id: 'applySysUserManagement.MoveToDirectory' })}`}
        visible={showModel}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
        width="400px"
        className={styles.modelTreeCon}
        bodyStyle={{ padding: '0' }}
      >
        <TreeCatalog isPopUps={true} setItem={this.getItem} actItem={actItem} />
      </Modal>
    );
  }
}

export default MoveSystemModal;
