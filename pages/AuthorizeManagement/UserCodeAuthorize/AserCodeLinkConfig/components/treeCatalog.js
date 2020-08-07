import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Input, Tree, message, Icon, Tooltip } from 'antd';
import { connect } from 'dva';
import styles from '../index.less';
import {
  getUserByComAcctId,
  copyUserAllowConfig,
} from '@/services/authorizeManagement/userCodeLinkConfig';

const { Search } = Input;
const { TreeNode } = Tree;

@connect(({ UserCodeLinkModel, user: { currentUser: { userCode } } }) => ({
  userCode,
  selectedItem: UserCodeLinkModel.selectedItem,
  fromUserId: UserCodeLinkModel.fromUserId,
  toUserId: UserCodeLinkModel.toUserId,
}))
class TreeCatalog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeArr: [],
      selectedKey: '',
    };
  }

  componentWillMount() {
    this.getCatalogue();
  }

  getCatalogue = queryCode => {
    const param = {};
    if (queryCode) {
      param.queryCode = queryCode;
      queryCode = encodeURI(queryCode);
    }
    getUserByComAcctId(queryCode).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject = [] } = result;
        const treeArr = [];
        // 获取顶级父元素集合
        if (resultObject.data === null) {
          this.setState({
            treeArr: [],
          });
          return;
        }
        const roots = resultObject.data.filter(elemt => elemt.parentId === -1);
        treeArr.push(...roots);
        this.setState({
          treeArr,
        });
        if (roots && roots.length > 0) {
          const { dispatch } = this.props;
          const actItem = roots[0];
          this.setState({
            selectedKey: `${actItem.userId}`,
          });
          dispatch({
            type: 'UserCodeLinkModel/save',
            payload: {
              selectedItem: actItem,
            },
          });
        }
      }
    });
  };

  renderTree = jsonTree =>
    jsonTree.map(item => {
      const { selectedKey } = this.state;
      if (item.children) {
        return (
          <TreeNode
            title={
              Number(selectedKey) === item.userId ? (
                <div className={styles.treeItemCon}>
                  <span className={styles.itemTitle} title={item.userName}>
                    {item.userName}
                  </span>
                  <div style={{ marginLeft: '4px' }}>
                    <Tooltip
                      placement="top"
                      title={formatMessage({
                        id: 'AserCodeLinkConfig.CopyConfigInfo',
                        defaultMessage: '复制配置信息',
                      })}
                    >
                      <Icon
                        type="copy"
                        style={{ marginRight: 5 }}
                        onClick={() => this.copyConfigMsg(item.userId)}
                      />
                    </Tooltip>
                    <Tooltip
                      placement="top"
                      title={formatMessage({
                        id: 'AserCodeLinkConfig.PasteConfigInfo',
                        defaultMessage: '粘贴配置信息',
                      })}
                    >
                      <Icon type="file-text" onClick={() => this.stickConfigMsg(item.userId)} />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                Number(selectedKey) != item.userId && (
                  <div className={styles.treeItemCon}>
                    <span className={styles.itemTitle} title={item.userName}>
                      {item.userName}
                    </span>
                  </div>
                )
              )
            }
            key={`${item.userId}`}
            dataRef={item}
          >
            {/* 对children中的每个元素进行递归 */}
            {this.renderTree(item.children)}
          </TreeNode>
        );
      }
      return item;
    });

  onSelect = (selectedKeys, info) => {
    const { dispatch } = this.props;
    this.setState({
      selectedKey: selectedKeys[0],
    });
    dispatch({
      type: 'UserCodeLinkModel/save',
      payload: {
        selectedItem: info.node.props.dataRef,
      },
    });
  };

  copyConfigMsg = fromUserId => {
    const params = {};
    const { dispatch, toUserId } = this.props;
    if (fromUserId) {
      params.fromUserId = fromUserId;
      dispatch({
        type: 'UserCodeLinkModel/save',
        payload: {
          fromUserId,
        },
      });
      params.toUserId = toUserId;
    }
    message.success(
      `${formatMessage({
        id: 'AserCodeLinkConfig.CopyConfigInforSucceeded',
        defaultMessage: '复制配置信息成功!',
      })}`
    );
  };

  stickConfigMsg = toUserId => {
    const params = {};
    const { dispatch, fromUserId, selectedItem } = this.props;
    if (toUserId) {
      params.fromUserId = fromUserId;
      params.toUserId = toUserId;
      params.comAcctId = selectedItem.comAcctId;
      dispatch({
        type: 'UserCodeLinkModel/save',
        payload: {
          toUserId,
        },
      });
    }
    copyUserAllowConfig(params).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(
          `${formatMessage({
            id: 'AserCodeLinkConfig.PasteConfigInforSucceeded',
            defaultMessage: '粘贴配置信息成功!',
          })}`
        );
      }
    });
  };

  render() {
    const { treeArr, selectedKey } = this.state;
    return (
      <div className={styles.leftCon}>
        <p className={styles.treeTitle}>
          <span style={{ color: 'red' }}>*</span>
          {formatMessage({
            id: 'AserCodeLinkConfig.selectOperatorAccountTipTwo',
            defaultMessage: '请选择操作员账号',
          })}
        </p>
        <div style={{ padding: '0 4px', background: '#fff' }}>
          <div className={styles.searchCon}>
            <Search
              placeholder={formatMessage({
                id: 'AserCodeLinkConfig.PleaseEnterContent',
                defaultMessage: '请输入内容',
              })}
              onSearch={value => {
                this.getCatalogue(value);
              }}
            />
          </div>
        </div>
        <div className={styles.treeOutCon}>
          <div className={styles.treeCon}>
            <Tree onSelect={this.onSelect} selectedKeys={[selectedKey]}>
              {this.renderTree(treeArr)}
            </Tree>
          </div>
        </div>
      </div>
    );
  }
}

export default TreeCatalog;
