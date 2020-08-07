import React, { Component } from 'react';
import { Form, Input, Select, Modal } from 'antd';
import { defaultHandleResponse } from '@/utils/utils';
import { submitReportTask } from '@/services/functionalDesign/dataReportTaskManagement';

const { Option } = Select;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    sm: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class SubRep extends Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      myKey: '',
    };
  }

  hideModal = (flag, load) => {
    const { showResModalFlag } = this.props;
    showResModalFlag(flag, load);
    this.setState({
      myKey: Math.random(),
    });
  };

  getReportData = () => {
    const { getQuery, queryValue, pageIndex, pageSize } = this.props;
    getQuery(queryValue, pageIndex, pageSize);
  };

  handleOk = () => {
    const { form, reportValue } = this.props;
    form.validateFields((err, values) => {
      values.datcolTaskIds = reportValue;
      if (!err) {
        submitReportTask(values).then(response => {
          defaultHandleResponse(response, ()=>{
            this.getReportData();
          });
        });
        this.hideModal(false, true);
      }
    });
  };

  render() {
    const { form } = this.props;
    const { myKey } = this.state;
    const { getFieldDecorator } = form;
    const { showResModal } = this.props;
    return (
      <Modal
        key={myKey}
        title="提交报备"
        visible={showResModal}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
      >
        <Form>
          <Form.Item colon={false} {...formItemLayout} label="提交操作">
            {getFieldDecorator('operateType', {
              rules: [{ required: true, message: '请选择提交操作!' }],
            })(
              <Select>
                <Option value="0">提交报备</Option>
                <Option value="1">拒绝报备</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item colon={false} {...formItemLayout} label="提交意见">
            {getFieldDecorator('reportReason', {
              rules: [{ required: true, message: '请输入提交意见!' }],
            })(<TextArea rows={5} placeholder="请输入" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const SubmitReport = Form.create()(SubRep);
export default SubmitReport;
