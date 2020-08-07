import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { List, Row, Col, Input, Button, Form, Select, Pagination, message } from 'antd';
import { connect } from 'dva';
import styles from '../index.less';

const { TextArea } = Input;
const { Option } = Select;

@Form.create()
@connect(({ tempConfigRule }) => ({
  rows: tempConfigRule.rows,
  total: tempConfigRule.total,
  pageSize: tempConfigRule.pageSize,
  isLoading: tempConfigRule.isLoading,
  // isLoading: loading.effects['tempConfigRule/setCodeTemplateList']
}))
class TempConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdate: 0,
      id: 0,
    };
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tempConfigRule/setCodeTemplateList',
      payload: {
        pageIndex: 1,
        pageSize: 10,
      },
    });
  };

  updateContent = id => {
    const { isUpdate: prevIsUpdate } = this.state;
    if (prevIsUpdate === 0) {
      this.setState({
        isUpdate: 1,
        id,
      });
    } else {
      message.warning('请先保存已修改信息');
    }
  };

  saveContent = item => {
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll(err => {
      if (!err) {
        dispatch({
          type: 'tempConfigRule/updateCodeTemplate',
          payload: {
            id: item.id,
            validTime: form.getFieldValue(`${item.id}validTime`),
            smsTemplate: form.getFieldValue(`${item.id}smsTemplate`),
          },
        });
      }
    });
    this.setState({
      isUpdate: 0,
    });
  };

  // 修改分页
  handleTableChange = (pageIndex, pageSize) => {
    const { pageSize: prevPageSize, dispatch } = this.props;
    dispatch({
      type: 'tempConfigRule/setCodeTemplateList',
      payload: {
        pageIndex: prevPageSize !== pageSize ? 1 : pageIndex,
        pageSize,
      },
    });
  };

  render() {
    const { isUpdate, id } = this.state;
    const { rows, form, total, pageIndex, pageSize, isLoading } = this.props;
    const { getFieldDecorator } = form;
    const paginationProps = {
      onShowSizeChange: this.handleTableChange,
      onChange: this.handleTableChange,
      showQuickJumper: true,
      current: pageIndex,
      pageSize,
      total,
    };

    return (
      <List
        header={
          <Row className={styles.listHeader}>
            <Col span={2}>
              {formatMessage({ id: 'CodeManagement.SerialNumber', defaultMessage: '序号' })}
            </Col>
            <Col span={3}>
              {formatMessage({
                id: 'CodeManagement.AuthenticationType',
                defaultMessage: '验证类型',
              })}
            </Col>
            <Col span={3}>
              {formatMessage({ id: 'CodeManagement.EffectiveTime', defaultMessage: '有效时间' })}
            </Col>
            <Col span={12} style={{ marginRight: 10 }}>
              {formatMessage({ id: 'CodeManagement.SMSTemplate', defaultMessage: '短信模板' })}
            </Col>
            <Col span={3}>{formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}</Col>
          </Row>
        }
        dataSource={rows}
        loading={isLoading}
        renderItem={item => (
          <React.Fragment key={item.id}>
            <List.Item>
              <Row className={styles.listItem}>
                <Col span={2}>{item.id}</Col>
                <Col span={3}>
                  {item.validType === '1' && (
                    <span>
                      {formatMessage({
                        id: 'CodeManagement.SystemLoginVerification',
                        defaultMessage: '系统登录验证',
                      })}
                    </span>
                  )}
                  {item.validType === '2' && (
                    <span>
                      {formatMessage({
                        id: 'CodeManagement.PasswordModificationVerification',
                        defaultMessage: '密码修改验证',
                      })}
                    </span>
                  )}
                  {item.validType === '3' && (
                    <span>
                      {formatMessage({
                        id: 'CodeManagement.TreasuryDesensitizationVerification',
                        defaultMessage: '金库脱敏验证',
                      })}
                    </span>
                  )}
                </Col>
                <Form>
                  {(isUpdate === 0 || id != item.id) && (
                    <div>
                      <Col span={3}>
                        <Form.Item>
                          <Row>
                            <Col span={15}>
                              {getFieldDecorator(`${item.id}validTime`, {
                                initialValue: item.validTime,
                              })(
                                <Select disabled>
                                  <Option value="5">5</Option>
                                  <Option value="10">10</Option>
                                  <Option value="15">15</Option>
                                  <Option value="20">20</Option>
                                  <Option value="25">25</Option>
                                  <Option value="30">30</Option>
                                </Select>
                                // <InputNumber min={5} max={30} style={{ width: 50 }} disabled />
                              )}
                            </Col>
                            <Col span={5} style={{ fontSize: 12 }}>
                              {formatMessage({
                                id: 'CodeManagement.Minute',
                                defaultMessage: '分钟',
                              })}
                            </Col>
                          </Row>
                        </Form.Item>
                      </Col>
                      <Col span={12} style={{ marginRight: 10 }}>
                        <Form.Item>
                          {getFieldDecorator(`${item.id}smsTemplate`, {
                            initialValue: item.smsTemplate,
                          })(<TextArea rows={3} disabled />)}
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Button type="primary" onClick={() => this.updateContent(item.id)}>
                          {formatMessage({ id: 'COMMON_Modify', defaultMessage: '修改' })}
                        </Button>
                      </Col>
                    </div>
                  )}
                  {isUpdate === 1 && id === item.id && (
                    <div>
                      <Col span={3}>
                        <Form.Item>
                          <Row>
                            <Col span={15}>
                              {getFieldDecorator(`${item.id}validTime`, {
                                initialValue: item.validTime,
                              })(
                                <Select>
                                  <Option value="5">5</Option>
                                  <Option value="10">10</Option>
                                  <Option value="15">15</Option>
                                  <Option value="20">20</Option>
                                  <Option value="25">25</Option>
                                  <Option value="30">30</Option>
                                </Select>
                              )}
                            </Col>
                            <Col span={5}>
                              {formatMessage({
                                id: 'CodeManagement.Minute',
                                defaultMessage: '分钟',
                              })}
                            </Col>
                          </Row>
                        </Form.Item>
                      </Col>
                      <Col span={12} style={{ marginRight: 10 }}>
                        <Form.Item>
                          {getFieldDecorator(`${item.id}smsTemplate`, {
                            initialValue: item.smsTemplate,
                          })(<TextArea rows={3} />)}
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Button type="primary" onClick={() => this.saveContent(item)}>
                          {formatMessage({ id: 'COMMON_SAVE', defaultMessage: '保存' })}
                        </Button>
                      </Col>
                    </div>
                  )}
                </Form>
              </Row>
            </List.Item>
          </React.Fragment>
        )}
      >
        <List.Item className={styles.messageCon}>
          <span>
            {`${formatMessage({
              id: 'CodeManagement.SMSTemplateTip1',
              defaultMessage: '短信模板提供8个变量',
            })}：
              \${${formatMessage({
                id: 'CodeManagement.VerificationCode',
                defaultMessage: '验证码',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.EffectiveTime',
                defaultMessage: '有效时间',
              })}}、
              \${${formatMessage({ id: 'auditManagement.UserCode', defaultMessage: '用户编码' })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip2',
                defaultMessage: '用户手机号码',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip3',
                defaultMessage: '数据库名',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip4',
                defaultMessage: '表/视图名',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip5',
                defaultMessage: '字段名',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip6',
                defaultMessage: '数据库操作',
              })}}。${formatMessage({
              id: 'CodeManagement.SMSTemplateTip7',
              defaultMessage: '其中',
            })}
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip3',
                defaultMessage: '数据库名',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip4',
                defaultMessage: '表/视图名',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip5',
                defaultMessage: '字段名',
              })}}、
              \${${formatMessage({
                id: 'CodeManagement.SMSTemplateTip6',
                defaultMessage: '数据库操作',
              })}}${formatMessage({
              id: 'CodeManagement.SMSTemplateTip8',
              defaultMessage: '为必填',
            })}`}
          </span>
        </List.Item>
        <Pagination {...paginationProps} style={{ float: 'right', margin: '16px 0' }} />
      </List>
    );
  }
}

export default TempConfig;
