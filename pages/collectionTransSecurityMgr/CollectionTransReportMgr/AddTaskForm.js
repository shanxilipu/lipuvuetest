import React, { Component } from 'react';
import { Form, Input, Checkbox, Select, Modal } from 'antd';
import { DATASOURCE_TAPE, TRANS_PROTOCOL, TRANSFER_FORM } from './const';
import { defaultHandleResponse } from '@/utils/utils';
import {
  addReportTask,
  modifyReportTask,
} from '@/services/functionalDesign/dataReportTaskManagement';

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
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 7,
      offset: 16,
    },
  },
};
class TaskFrom extends Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      checked: false,
      myKey: '',
    };
  }

  //关闭Modal框
  hideModal = (flag, load) => {
    const { showModalFlag } = this.props;
    showModalFlag(flag, load);
    this.setState({
      myKey: Math.random(),
      checked: false,
    });
  };

  //更新Table
  getReportData = () => {
    const { getQuery, queryValue, pageIndex, pageSize } = this.props;
    getQuery(queryValue, pageIndex, pageSize);
  };

  //点击确定时执行
  handleOk = () => {
    const { form, editValue, titleSwitch } = this.props;
    //判断是新增还是编辑
    if (titleSwitch) {
      form.validateFields((err, values) => {
        if (!err) {
          addReportTask(values).then(response => {
            defaultHandleResponse(response);
          });
          this.hideModal(false,true);
        }
      });
    } else {
      form.validateFields((err, values) => {
        values.datcolTaskId = editValue.datcolTaskId;
        if (!err) {
          modifyReportTask(values).then(response => {
            defaultHandleResponse(response,()=>{
              this.getReportData();
            });
          });
          this.hideModal(false,true);
        }
      });
    }
  };

  //确定提交意是否为必选
  getCheckBox = () => {
    const { checked } = this.state;
    this.setState({
      checked: !checked,
    });
  };

  render() {
    const { showModal, titleSwitch, editValue, form } = this.props;
    const { myKey, checked } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Modal
        key={myKey}
        title={titleSwitch ? '新增任务' : '编辑任务'}
        visible={showModal}
        onOk={this.handleOk}
        onCancel={() => {
          this.hideModal(false);
        }}
      >
        <Form>
          <Form.Item
            label='采集任务名称'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('taskName', {
              initialValue: titleSwitch ? '' : editValue.taskName,
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
            label='数据源名称'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('datasourceName', {
              initialValue: titleSwitch ? '' : editValue.datasourceName,
              rules: [
                {
                  required: true,
                  message: '请输入数据源名称!',
                },
              ],
            })(
              <Input
                placeholder='数据源名称'
              />
            )}
          </Form.Item>
          <Form.Item
            label='采集任务IP'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('taskIp', {
              initialValue: titleSwitch ? '' : editValue.taskIp,
              rules: [
                {
                  required: true,
                  message: '请输入采集任务IP!',
                  pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                },
              ],
            })(
              <Input
                placeholder='采集任务IP'
              />
            )}
          </Form.Item>
          <Form.Item
            label='数据源类型'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('datasourceType', {
              initialValue: titleSwitch ? 'mysql' : editValue.datasourceType,
              rules: [
                {
                  required: true,
                  message: '请选择数据源类型!',
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
          <Form.Item
            label='数据源IP'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('datasourceIp', {
              initialValue: titleSwitch ? '' : editValue.datasourceIp,
              rules: [
                {
                  required: true,
                  message: '请输入数据源IP!',
                  pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                },
              ],
            })(<Input placeholder='数据源IP' />)}
          </Form.Item>
          <Form.Item
            label='传输形式'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('transType', {
              initialValue: titleSwitch ? 'interface' : editValue.transType,
              rules: [
                {
                  required: true,
                  message: '请选择传输形式!',
                },
              ],
            })(
              <Select>
                {TRANSFER_FORM.map((v, k) => (
                  <Option value={v.label} key={k}>
                    {v.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label='通信协议'
            colon={false}
            {...formItemLayout}
          >
            {getFieldDecorator('transProtocol', {
              initialValue: titleSwitch ? 'jdbc' : editValue.transProtocol,
              rules: [
                {
                  required: true,
                  message: '请输选择通信协议!',
                },
              ],
            })(
              <Select>
                {TRANS_PROTOCOL.map((v, k) => (
                  <Option value={v.label} key={k}>
                    {v.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item colon={false} {...formItemLayout} label="采集端口">
            {getFieldDecorator('colPort', {
              initialValue: titleSwitch ? '3306' : editValue.colPort,
              rules: [
                {
                  required: true,
                  message: '请输入采集端口!',
                  pattern: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                },
              ],
            })(<Input placeholder="1～65535" />)}
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            {getFieldDecorator('submitReport', {
              valuePropName: 'checked',
            })(<Checkbox onChange={this.getCheckBox}> 保存后提交报备 </Checkbox>)}
          </Form.Item>
          <Form.Item colon={false} {...formItemLayout} label="提交意见">
            {getFieldDecorator('reportReason', {
              rules: [
                {
                  required: checked,
                  message: '请输入提交意见!',
                },
              ],
            })(<TextArea rows={5} placeholder="请输入" />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const AddTaskFrom = Form.create()(TaskFrom);
export default AddTaskFrom;
