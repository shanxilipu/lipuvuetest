import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Modal, Form, Input, Spin, message } from 'antd';
import {
  insertSubSafeAppsysCatalog,
  insertUpperSafeAppsysCatalog,
  insertLowerSafeAppsysCatalog,
  updateSafeAppsysCatalog,
} from '@/services/authorizeManagement/applySysUserManagement';

const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

@Form.create()
class AddCatalogue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      itemCatlog: {},
      parentCatlog: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    const { itemCatlog, form } = this.props;
    if (JSON.stringify(nextProps.itemCatlog) !== JSON.stringify(itemCatlog)) {
      this.setState({
        itemCatlog: nextProps.itemCatlog,
      });
      const inieObj = {};
      if (
        nextProps.itemCatlog.type === 'aboveAddCatlog' ||
        nextProps.itemCatlog.type === 'belowAddCatlog' ||
        nextProps.itemCatlog.type === 'edit'
      ) {
        let parentCatlog = {};
        if (itemCatlog.parentCatalogId === -1) {
          parentCatlog = {
            catalogId: -1,
            catalogName: `${formatMessage({ id: 'applySysUserManagement.RootDirectory' })}`,
          };
        } else {
          parentCatlog = this.findCatlog(nextProps.treeData, nextProps.itemCatlog.parentCatalogId);
        }
        this.setState({
          parentCatlog,
        });
        inieObj.parentCatalogName = parentCatlog.catalogName;
      } else {
        inieObj.parentCatalogName = nextProps.itemCatlog.catalogName;
      }
      if (nextProps.itemCatlog.type === 'edit') {
        inieObj.catalogName = nextProps.itemCatlog.catalogName;
        inieObj.catalogDesc = nextProps.itemCatlog.catalogDesc;
        form.setFieldsValue(inieObj);
      } else {
        inieObj.catalogName = '';
        inieObj.catalogDesc = '';
        form.setFieldsValue(inieObj);
      }
    }
  }

  hideModal = refresh => {
    const { showModelFlag } = this.props;
    showModelFlag(false, refresh);
  };

  handleOk = () => {
    const { itemCatlog, parentCatlog } = this.state;

    const { form } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        const params = {};
        params.catalogName = values.catalogName;
        params.catalogDesc = values.catalogDesc;
        let fun = '';
        if (itemCatlog.type === 'addSubdirectory') {
          fun = insertSubSafeAppsysCatalog;
          params.parentCatalogId = itemCatlog.catalogId;
        } else if (itemCatlog.type === 'aboveAddCatlog') {
          fun = insertUpperSafeAppsysCatalog;
          params.currentCatalogId = itemCatlog.catalogId;
          params.parentCatalogId = parentCatlog.catalogId;
        } else if (itemCatlog.type === 'belowAddCatlog') {
          fun = insertLowerSafeAppsysCatalog;
          params.currentCatalogId = itemCatlog.catalogId;
          params.parentCatalogId = parentCatlog.catalogId;
        } else if (itemCatlog.type === 'edit') {
          fun = updateSafeAppsysCatalog;
          params.catalogId = itemCatlog.catalogId;
        }
        this.setState({
          loading: true,
        });
        fun(params).then(result => {
          this.setState({
            loading: false,
          });
          if (!result) return;
          const {
            resultCode,
            resultMsg = `${formatMessage({ id: 'applySysUserManagement.OperationFailed' })}`,
          } = result;
          if (resultCode !== '0') {
            message.error(resultMsg);
          } else {
            if (
              itemCatlog.type === 'addSubdirectory' ||
              itemCatlog.type === 'aboveAddCatlog' ||
              itemCatlog.type === 'belowAddCatlog'
            ) {
              message.success(
                `${formatMessage({ id: 'applySysUserManagement.AddDirectorySuccessfully' })}`
              );
            } else {
              message.success(
                `${formatMessage({ id: 'applySysUserManagement.EditDirectorySuccessfully' })}`
              );
            }

            this.hideModal(true);
          }
        });
      }
    });
  };

  // 通过id获取目录
  findCatlog = (arr, catalogId) => {
    let actObj = {};
    for (let i = 0; i < arr.length; i++) {
      if (`${arr[i].catalogId}` === `${catalogId}`) {
        actObj = { ...arr[i] };
        break;
      } else if (arr[i].children && arr[i].children.length > 0) {
        const obj = this.findCatlog(arr[i].children, catalogId);
        if (obj.catalogId) {
          actObj = { ...obj };
          break;
        }
      }
    }
    return actObj;
  };

  // 同级目录是否有相同名字的目录
  isSameCatName = (arr, name, id) => {
    let flag = false;
    if (!!arr && arr.length > 0) {
      arr.forEach(item => {
        if (id) {
          if (item.name === name && `${item.id}` !== `${id}`) {
            flag = item;
          }
        } else if (item.name === name) {
          flag = item;
        }
      });
    }
    return flag;
  };

  render() {
    const { loading } = this.state;
    const {
      form: { getFieldDecorator },
      showModel,
    } = this.props;
    return (
      <Modal
        title={`${formatMessage({ id: 'applySysUserManagement.DirectoryInfoEntry' })}`}
        visible={showModel}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
        width="500px"
      >
        <Spin spinning={loading}>
          <Form>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.ParentDirectory' })}`}
            >
              {getFieldDecorator('parentCatalogName', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.ParentDirectoryTip',
                    })}`,
                  },
                  {
                    max: 50,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.ParentDirectoryRule',
                    })}`,
                  },
                ],
              })(
                <Input
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
                  disabled
                />
              )}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.DirectoryName' })}`}
            >
              {getFieldDecorator('catalogName', {
                rules: [
                  {
                    required: true,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.ParentDirectoryTip',
                    })}`,
                  },
                  {
                    max: 50,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.ParentDirectoryRule',
                    })}`,
                  },
                ],
              })(<Input placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`} />)}
            </Form.Item>
            <Form.Item
              colon={false}
              {...formItemLayout}
              label={`${formatMessage({ id: 'applySysUserManagement.DirectoryDescription' })}`}
            >
              {getFieldDecorator('catalogDesc', {
                rules: [
                  {
                    max: 200,
                    message: `${formatMessage({
                      id: 'applySysUserManagement.DirectoryDescriptionRule',
                    })}`,
                  },
                ],
              })(
                <TextArea
                  rows={5}
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
                  onChange={this.onFileChange}
                />
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default AddCatalogue;
