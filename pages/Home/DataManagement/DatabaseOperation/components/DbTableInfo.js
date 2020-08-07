import React from 'react';
import { Form, Col, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';

class DbTableInfo extends React.Component {
  getDateString = date => {
    if (!date) {
      return '';
    }
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  };

  render() {
    const {
      editable,
      tableId,
      getFieldDecorator,
      colLayout,
      COMMONRule,
      getInitValue,
    } = this.props;
    const isEditing = !!tableId;
    return (
      <div>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'TABLE_NAME' })}>
            {getFieldDecorator('name', {
              initialValue: getInitValue('name'),
              rules: [COMMONRule],
            })(
              <Input
                placeholder={formatMessage({ id: 'TABLE_NAME' })}
                disabled={!editable}
                autoComplete="off"
              />
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'TABLE_CODE' })}>
            {getFieldDecorator('code', {
              initialValue: getInitValue('code'),
              rules: [COMMONRule],
            })(
              <Input
                placeholder={formatMessage({ id: 'TABLE_CODE' })}
                disabled={!editable || isEditing}
                autoComplete="off"
              />
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'CREATE_DATE' })}>
            {getFieldDecorator('createDate', {
              initialValue: this.getDateString(getInitValue('createDate')),
            })(<Input placeholder={formatMessage({ id: 'CREATE_DATE' })} disabled={true} />)}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'CREATOR' })}>
            {getFieldDecorator('createStaff', {
              initialValue: getInitValue('createStaff'),
            })(<Input placeholder={formatMessage({ id: 'CREATOR' })} disabled={true} />)}
          </Form.Item>
        </Col>
        <Col xs={24} md={24}>
          <Form.Item
            label={formatMessage({ id: 'COMMON_DESCRIPTION' })}
            labelCol={{ xs: { span: 24 }, sm: { span: 4 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 20 } }}
          >
            {getFieldDecorator('description', {
              initialValue: getInitValue('description'),
            })(
              <Input
                placeholder={formatMessage({ id: 'COMMON_DESCRIPTION' })}
                disabled={!editable}
              />
            )}
          </Form.Item>
        </Col>
      </div>
    );
  }
}
export default DbTableInfo;
