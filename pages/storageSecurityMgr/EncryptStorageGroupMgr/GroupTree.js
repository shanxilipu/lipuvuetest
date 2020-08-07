import React from 'react';
import { formatMessage } from 'umi/locale';
import { Spin, message } from 'antd';
import Tree from '@/components/Tree';
import MyIcon from '@/components/MyIcon';
import GroupModal from './GroupModal';
import Modal from '@/components/Modal';
import { randomWord, defaultHandleResponse, getPlaceholder } from '@/utils/utils';
import { appendTreeChildren, deleteTreeNode, updateTreeNodeData } from '@/utils/tree';
import {
  getGroupList,
  deleteGroup,
} from '@/pages/storageSecurityMgr/services/encryptStorageGroupMgr';
import styles from './index.less';

const ROOT_KEY = '-1';
const ROOT_NODE = {
  key: ROOT_KEY,
  title: formatMessage({ id: 'storage.encrypt.group', defaultMessage: '存储加密分组' }),
};

class GroupTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      treeData: [ROOT_NODE],
      showModal: false,
      treeMark: randomWord(false, 8),
    };
    this.searchParams = {};
    this.currentGroupItem = {};
  }

  componentDidMount() {
    this.getGroupList();
  }

  getMappedData = o => ({
    ...o,
    title: o.groupName,
    key: `${o.groupId}`,
  });

  getGroupList = () => {
    this.setState({ loading: true });
    getGroupList({ ...this.searchParams }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, resultObject => {
        const list = (resultObject || []).map(o => this.getMappedData(o));
        this.setState({
          treeData: [{ ...ROOT_NODE, children: list }],
          treeMark: randomWord(false, 8),
        });
      });
    });
  };

  showModal = (item = {}) => {
    this.currentGroupItem = { ...item };
    this.setState({ showModal: true });
  };

  deleteGroup = item => {
    const handleDelete = () => {
      this.setState({ loading: true });
      deleteGroup({ groupId: item.groupId }).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(response, () => {
          const { key } = item;
          const { treeData } = this.state;
          const {
            activeTreeNode: { key: oldActiveTreeKey },
            setActiveTreeNode,
          } = this.props;
          const newTreeData = [...treeData];
          deleteTreeNode(key, ROOT_KEY, newTreeData);
          if (key === oldActiveTreeKey) {
            setActiveTreeNode({});
          }
          message.success(
            formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })
          );
          this.setState({ treeData: newTreeData, treeMark: randomWord(false, 8) });
        });
      });
    };
    Modal.confirm({
      title: formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除' }),
      onOk: handleDelete,
    });
  };

  renderLineIcon = item => {
    const { key } = item;
    if (key === ROOT_KEY) {
      return (
        <MyIcon
          type="iconxinjian1x"
          onClick={() => this.showModal()}
          title={formatMessage({ id: 'storage.encrypt.group.new', defaultMessage: '新建分组' })}
        />
      );
    }
    return (
      <span>
        <MyIcon
          type="iconbianjix"
          onClick={() => this.showModal(item)}
          title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
        />
        <MyIcon
          className="ml10"
          type="iconshanchubeifenx"
          onClick={() => this.deleteGroup(item)}
          title={formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
        />
      </span>
    );
  };

  afterEditTreeNode = item => {
    const { treeData } = this.state;
    const { setActiveTreeNode } = this.props;
    const newData = this.getMappedData(item);
    const newTreeData = [...treeData];
    if (!this.currentGroupItem.key) {
      setActiveTreeNode(newData);
      appendTreeChildren(ROOT_KEY, newData, newTreeData);
    } else {
      updateTreeNodeData(this.currentGroupItem.key, newData, newTreeData);
    }
    this.setState({ treeData: newTreeData, treeMark: randomWord(false, 8) });
  };

  onClickTreeNode = (keys, e) => {
    const {
      node: {
        props: { dataRef },
      },
    } = e;
    const { key } = dataRef;
    if (key !== ROOT_KEY) {
      const { setActiveTreeNode } = this.props;
      setActiveTreeNode(dataRef);
    }
  };

  render() {
    const {
      activeTreeNode: { key: activeTreeKey },
    } = this.props;
    const { loading, treeData, treeMark, showModal } = this.state;
    return (
      <div className={styles.tree}>
        <Spin spinning={loading} wrapperClassName="full-height-spin">
          <Tree
            showSearch
            defaultExpandAll
            highlightSearchBox
            treeData={treeData}
            treeMark={treeMark}
            onSelect={this.onClickTreeNode}
            renderLineIcon={this.renderLineIcon}
            handleMenuClick={this.handleMenuClick}
            shouldUpdateProps={['treeMark', 'selectedKeys']}
            selectedKeys={activeTreeKey ? [activeTreeKey] : []}
            onAsyncSearch={groupName => {
              this.searchParams = { groupName };
              this.getGroupList();
            }}
            placeholder={getPlaceholder(
              formatMessage({ id: 'storage.encrypt.groupName', defaultMessage: '分组名称' })
            )}
          />
          <GroupModal
            visible={showModal}
            item={this.currentGroupItem}
            onOk={this.afterEditTreeNode}
            onCancel={() => this.setState({ showModal: false })}
          />
        </Spin>
      </div>
    );
  }
}
export default GroupTree;
