import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Form, Select, Input, DatePicker, Row, Col } from 'antd';
import moment from 'moment';

import styles from './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    sm: { span: 0 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class FormItem extends Component {
  disabledDate = current => {
    return current && current > moment().endOf('day');
  };

  getSel = arr => {
    if (!arr || arr.length <= 0) {
      return '';
    }
    return arr.map(item => {
      return (
        <Option key={`${item.id}`} value={`${item.id}`}>
          {item.name}
        </Option>
      );
    });
  };

  getSelet = item => {
    const {
      form: { getFieldDecorator },
      disabled = false,
    } = this.props;
    const { defaultProps = {}, rules = [] } = item;
    let initialValue;
    if (Array.isArray(item.defaultValue)) {
      initialValue = item.defaultValue;
    } else if (item.defaultValue || `${item.defaultValue}` === '0') {
      initialValue = `${item.defaultValue}`;
    }
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {
                rules: [...rules],
                initialValue,
              })(
                <Select
                  disabled={disabled}
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseChoose' })}`}
                  onChange={val => {
                    if (item.onchange) {
                      item.onchange(val);
                    }
                  }}
                  allowClear={true}
                  {...defaultProps}
                >
                  {this.getSel(item.selArr)}
                </Select>
              )}
            </Form.Item>
          </div>
        </div>
      </Col>
    );
  };

  getInput = item => {
    const {
      form: { getFieldDecorator },
      disabled = false,
    } = this.props;
    const setDefaultValue = item.defaultValue || '';
    const { rules = [] } = item;
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {
                rules: [...rules],
                initialValue: setDefaultValue,
              })(
                <Input
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          </div>
        </div>
      </Col>
    );
  };

  getRangePicker = item => {
    let setDefaultValue = [null, null];
    if (item.defaultValue) {
      setDefaultValue = item.defaultValue;
    }
    const {
      form: { getFieldDecorator },
      disabled = false,
    } = this.props;
    const { rules = [] } = item;
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {
                rules: [...rules],
                initialValue: setDefaultValue,
              })(
                <RangePicker
                  disabled={disabled}
                  showTime={true}
                  format={DATE_TIME_FORMAT}
                  placeholder={[
                    `${formatMessage({ id: 'auditManagement.StartTime' })}`,
                    `${formatMessage({ id: 'auditManagement.EndTime' })}`,
                  ]}
                  disabledDate={this.disabledDate}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          </div>
        </div>
      </Col>
    );
  };

  getDatePickerr = item => {
    const { showTime = true, format = 'YYYY-MM-DD HH:mm:ss', rules = [] } = item;
    const {
      form: { getFieldDecorator },
      disabled = false,
    } = this.props;
    let setDefaultValue = null;
    if (item.defaultValue) {
      setDefaultValue = item.defaultValue;
    }
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {
                rules: [...rules],
                initialValue: setDefaultValue,
              })(
                <DatePicker
                  disabled={disabled}
                  style={{ width: '100%' }}
                  showTime={showTime}
                  format={format}
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseChoose' })}`}
                />
              )}
            </Form.Item>
          </div>
        </div>
      </Col>
    );
  };

  getTextArea = item => {
    const {
      form: { getFieldDecorator },
      disabled = false,
    } = this.props;
    const { rules = [] } = item;
    const setDefaultValue = item.defaultValue || '';
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`} style={{ paddingTop: '5px' }}>
            {`${item.label}`}
          </span>
          <span className={styles.colLeftPadding} style={{ paddingTop: '2px' }}>
            :
          </span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {
                rules: [...rules],
                initialValue: setDefaultValue,
              })(
                <Input.TextArea
                  placeholder={`${formatMessage({ id: 'auditManagement.pleaseEnter' })}`}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          </div>
        </div>
      </Col>
    );
  };

  getSearch = () => {
    const { searchArr } = this.props;
    if (!searchArr || searchArr.length <= 0) {
      return '';
    }
    const newSearchArr = [...searchArr];

    const arr = newSearchArr.map(item => {
      if (item.type === 'input') {
        return this.getInput(item);
      }
      if (item.type === 'select') {
        return this.getSelet(item);
      }
      if (item.type === 'rangePicker') {
        return this.getRangePicker(item);
      }
      if (item.type === 'datePicker') {
        return this.getDatePickerr(item);
      }
      if (item.type === 'textArea') {
        return this.getTextArea(item);
      }
      return null;
    });
    return <Row style={{ minHeight: '40px' }}>{arr}</Row>;
  };

  render() {
    return <Fragment>{this.getSearch()}</Fragment>;
  }
}

export default FormItem;
