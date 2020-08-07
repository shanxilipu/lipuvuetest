import React, { Component } from 'react';
import { Form, Input, Select, Modal } from 'antd';
import { DATASOURCE_TAPE } from './const';
import { addWhiteList } from '@/services/functionalDesign/dataWhiteListManagement';
import { defaultHandleResponse } from '@/utils/utils';

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class WhiteFrom extends Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      myKey: '',
    };
  }

  //点击取消执行
  hideModal = (flag, load) => {
    const { showModalFlag } = this.props;
    showModalFlag(flag, load);
    this.setState({  myKey: Math.random(), })
   
  };

  //点击确认后刷新值
  getReportData = () => {
    const { getQuery, queryValue, pageIndex, pageSize } = this.props;
    getQuery(queryValue, pageIndex, pageSize);
  };

  //点击确认
  handleOk = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        addWhiteList(values).then(response => {
          defaultHandleResponse(response, ()=>{
            this.getReportData();
          });
        });
      }
      this.hideModal(false, true);
    });
  };

  render() {
    const { form, showModal } = this.props;
    const { getFieldDecorator } = form;
    const { myKey } =this.state
    return (
      <Modal
        key={myKey}
        title="新增白名单"
        visible={showModal}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
      >
        <Form>
          <Form.Item label="采集任务ID" colon={false} {...formItemLayout}>
            {getFieldDecorator('datcolTaskId', {
              rules:[
                { 
                  pattern: /^[0-9]*$/,
                  message: '请输入数字!',
                }
              ]
            })(<Input placeholder="采集任务ID" />)}
          </Form.Item>
          <Form.Item
            label='采集任务名称'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('taskName', {
              rules: [
                {
                  required: true,
                  message: '请输入采集任务名称!',
                },
              ],
            })(
              <Input
                placeholder='采集任务名称'
              />
            )}
          </Form.Item>
          <Form.Item
            label='采集任务IP'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('taskIp', {
              rules: [
                {
                  required: true,
                  message: '请输入采集任务IP!',
                  pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                },
              ],
            })(<Input placeholder='采集任务IP' />)}
          </Form.Item>
          <Form.Item
            label='数据源类型'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('datasourceType', {
              rules: [
                {
                  required: true,
                  message: '请输选择数据源类型!',
                },
              ],
            })(
              <Select>
                {DATASOURCE_TAPE.map((v, k) => (
                  <Option value={v.label} key={k}>
                    {v.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const AddWhiteForm = Form.create()(WhiteFrom);
export default AddWhiteForm;
