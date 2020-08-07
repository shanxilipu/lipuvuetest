import React, { Component } from 'react';
import styles from './index.less';
import { Form, Input, Alert, Modal, message, Button, Spin } from 'antd';
import { defaultHandleResponse } from '@/utils/utils';
import {
  addAgentNode,
  modifyAgentNode,
  checkAgentOnline,
} from '@/services/functionalDesign/agentListController';

const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class AgentFrom extends Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      buttonState: true,
      appearAlert: true,
      loading: false,
      interrupt: false,
      myKey: '',
    };
  }

  hideModal = () => {
    const { showModalFlag } = this.props;
    showModalFlag(false);
    this.setState({
      buttonState: true,
      appearAlert: true,
      loading: false,
      interrupt: false,
      myKey: Math.random(),
    });
  };

  getReportData = () => {
    const { getQuery, queryValue, pageIndex, pageSize } = this.props;
    getQuery(queryValue, pageIndex, pageSize);
  };

  //测试
  testButton = () => {
    const { interrupt } = this.state;
    const { form } = this.props;
    this.setState({
      interrupt: true,
    });
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        checkAgentOnline(values).then(response => {
          defaultHandleResponse(response, () => {
            if (response.resultObject) {
              message.success('测试成功');
              this.setState({
                buttonState: false,
                loading: false,
              });
            } else if (interrupt) {
              this.setState({
                appearAlert: false,
                loading: false,
              });
            } else {
              this.setState({
                appearAlert: false,
                loading: false,
              });
            }
          });
        });
      }
    });
  };

  //保存
  handleOk = () => {
    const { form, editValue, titleSwitch } = this.props;
    if (titleSwitch) {
      form.validateFields((err, values) => {
        if (!err) {
          addAgentNode(values).then(response => {
            defaultHandleResponse(response);
          });
          this.hideModal(false);
        }
      });
    } else {
      form.validateFields((err, values) => {
        values.agentId = editValue.agentId;
        if (!err) {
          modifyAgentNode(values).then(response => {
            defaultHandleResponse(response, () => {
              this.getReportData();
            });
          });
          this.hideModal(false);
        }
      });
    }
  };

  render() {
    const { showModal, titleSwitch, editValue, form } = this.props;
    const { getFieldDecorator } = form;
    const { myKey, buttonState, appearAlert, loading } = this.state;
    return (
      <Modal
        key={myKey}
        width="700px"
        title={titleSwitch ? '新建Agent' : '编辑Agent'}
        visible={showModal}
        onCancel={() => {
          this.hideModal(false);
        }}
        footer={[
          <Button
            key="Cancel"
            onClick={() => {
              this.hideModal(false);
            }}
          >
            取消
          </Button>,
          <Button
            key="Test"
            onClick={this.testButton}
          >
            测试
          </Button>,
          <Button
            key="Save"
            onClick={this.handleOk}
            disabled={buttonState}
          >
            保存
          </Button>,
        ]}
      >
        {/* 链接错误警告框 */}
        <div
          onClick={() => this.setState({ appearAlert: true })}
          className={styles.coverAlert}
        />
        
        <Alert
          className={
            appearAlert
              ? styles.noAlertLocation
              : styles.alertLocation}
          message="链接错误"
          type="error"
          showIcon
          closable
        />
        {/* Form表单及测试查询时等待 */}
        <Spin spinning={loading}>
          <Form>
            <Form.Item label="Agent名称" colon={false} {...formItemLayout}>
              {getFieldDecorator('agentName', {
                initialValue: titleSwitch ? '' : editValue.agentName,
                rules: [
                  {
                    required: true,
                    message: '请输入Agent名称!',
                  },
                ],
              })(<Input placeholder="Agent名称" />)}
            </Form.Item>
            <Form.Item label="IP" colon={false} {...formItemLayout}>
              {getFieldDecorator('agentIp', {
                initialValue: titleSwitch ? '' : editValue.agentIp,
                rules: [
                  {
                    required: true,
                    message: '请输入IP!',
                    pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                  },
                ],
              })(<Input placeholder="IP" />)}
            </Form.Item>
            <Form.Item label="Port" colon={false} {...formItemLayout}>
              {getFieldDecorator('agentPort', {
                initialValue: titleSwitch ? '' : editValue.agentPort,
                rules: [
                  {
                    required: true,
                    message: '请输入Port!',
                    pattern: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                  },
                ],
              })(<Input placeholder="Port" />)}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

const AddAgent = Form.create()(AgentFrom);
export default AddAgent;
