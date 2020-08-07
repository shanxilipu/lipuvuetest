import React from 'react';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import { formatMessage } from 'umi/locale';
import { Form, Col, DatePicker, Switch } from 'antd';
import { COMMON_RULE, DEFAULT_FORM_LAYOUT, DEFAULT_DATE_FORMAT } from '@/pages/common/const';

const { RangePicker } = DatePicker;

@Form.create()
class AuthForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { Ref } = props;
    if (Ref) {
      Ref(this);
    }
    this.initialEffectTime = [
      moment(moment().format(DEFAULT_DATE_FORMAT)),
      moment(
        moment()
          .add(1, 'month')
          .format(DEFAULT_DATE_FORMAT)
      ),
    ];
  }

  getValues = () => {
    let res = null;
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        res = { ...values };
        const { effectTime } = values;
        const [start, end] = effectTime;
        res.actDate = moment(start).format(DEFAULT_DATE_FORMAT);
        res.expDate = moment(end).format(DEFAULT_DATE_FORMAT);
        delete res.effectTime;
        res.state = res.state ? 'A' : 'X';
      }
    });
    return res;
  };

  render() {
    const {
      data = {},
      inline,
      form: { getFieldDecorator },
    } = this.props;
    const effectTimeInitValue = data.actDate
      ? [moment(data.actDate), moment(data.expDate)]
      : this.initialEffectTime;
    const enableLayout = inline ? { labelCol: { span: 12 }, wrapperCol: { span: 12 } } : {};
    return (
      <Form {...DEFAULT_FORM_LAYOUT} hideRequiredMark={!!inline}>
        <Col span={inline ? 18 : 24}>
          <Form.Item
            label={formatMessage({ id: 'keyAuth.effectTime', defaultMessage: '有效时间' })}
          >
            {getFieldDecorator('effectTime', {
              rules: [COMMON_RULE],
              initialValue: effectTimeInitValue,
            })(
              <RangePicker
                showTime
                allowClear={false}
                format={DEFAULT_DATE_FORMAT}
                style={{ width: '100%' }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={inline ? 6 : 24}>
          <Form.Item
            {...enableLayout}
            label={formatMessage({ id: 'storage.encrypt.isEnable', defaultMessage: '是否启用' })}
          >
            {getFieldDecorator('state', {
              rules: [COMMON_RULE],
              valuePropName: 'checked',
              initialValue: isEmpty(data) ? true : data.state === 'A',
            })(<Switch />)}
          </Form.Item>
        </Col>
      </Form>
    );
  }
}
export default AuthForm;
