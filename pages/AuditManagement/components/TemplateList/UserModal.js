import React, { Component } from 'react';
import { Modal, message, Tree, Input, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import { getUserByComAcctId } from '@/services/auditManagement/riskIdentConfig';
import { defaultHandleResponse } from '@/utils/utils';
import styles from './index.less';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class UserModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      actItem: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.getTreeData('', treeData => {
      const { onUserDataReady } = this.props;
      onUserDataReady(treeData);
    });
  }

  componentDidUpdate(prevProps) {
    const { visible, actItem } = this.props;
    if (visible && !prevProps.visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        actItem,
      });
    }
  }

  getTreeData = (queryCode, callback) => {
    const params = { queryCode: '' };
    if (queryCode) {
      params.queryCode = queryCode;
    }
    this.setState({ loading: true });
    getUserByComAcctId(params).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (resultObject = {}) => {
        const { data = [] } = resultObject;
        this.setState({ treeData: data });
        if (callback) {
          callback(data);
        }
      });
    });
  };

  renderTreeNodes = nodeArr => {
    return nodeArr.map(item => {
      return (
        <TreeNode
          title={
            <div
              className={styles.directoryTitleCon}
              onClick={this.setSelectedItem.bind(this, item)}
            >
              <span className={styles.directoryTitleName} title={item.catalogName}>
                {item.userName}
              </span>
            </div>
          }
          item={item}
          key={`${item.userId}`}
          isLeaf={!(item.children && item.children.length > 0)}
        >
          {item.children && item.children.length > 0 ? this.renderTreeNodes(item.children) : ''}
        </TreeNode>
      );
    });
  };

  setSelectedItem = item => {
    const { userId, userCode, userName } = item;
    const { actItem } = this.state;
    this.setState({
      actItem: { ...actItem, userId, userCode, userName },
    });
  };

  handleOk = () => {
    const { actItem } = this.state;
    const { onOk, onCancel } = this.props;
    const { userId } = actItem;
    if (!userId && `${userId}` !== '0') {
      message.info(`${formatMessage({ id: 'riskConfig.PleaseSelectUser' })}`);
      return false;
    }
    onOk(actItem);
    onCancel();
  };

  render() {
    const { actItem, treeData, loading } = this.state;
    const { visible, onCancel } = this.props;
    const selectedKeys = [];
    const { userId } = actItem;
    if (userId || `${userId}==='0'`) {
      selectedKeys.push(`${userId}`);
    }

    return (
      <Modal
        title={`${formatMessage({ id: 'riskConfig.SelectAlarmSMS' })}`}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        width="400px"
        bodyStyle={{ padding: '0' }}
      >
        <div className={styles.userModal}>
          <div className={styles.searchCon}>
            <Search
              placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
              onSearch={value => {
                this.getTreeData(value);
              }}
            />
          </div>
          <div className={styles.treeOutCon}>
            <Spin spinning={loading} wrapperClassName="full-height-spin">
              <DirectoryTree selectedKeys={selectedKeys} defaultExpandAll={false} showIcon={false}>
                {this.renderTreeNodes(treeData)}
              </DirectoryTree>
            </Spin>
          </div>
        </div>
      </Modal>
    );
  }
}

export default UserModel;
