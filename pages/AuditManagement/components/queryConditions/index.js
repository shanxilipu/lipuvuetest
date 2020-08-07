import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Form, Select, Input, DatePicker, Row, Col, Button, Spin, Icon } from 'antd';
import moment from 'moment';
import { checkLanguageIsEnglish } from '@/utils/utils';
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

@Form.create()
class PageHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
    if (props.Ref) {
      props.Ref(this);
    }
  }

  componentDidMount() {
    const { setChildCon } = this.props;
    if (setChildCon) {
      setChildCon(this);
    }
  }

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
    } = this.props;
    const { defaultProps = {} } = item;
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
                initialValue,
              })(
                <Select
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
    } = this.props;
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {})(
                <Input
                  placeholder={
                    item.placeholder
                      ? item.placeholder
                      : formatMessage({ id: 'auditManagement.pleaseEnter' })
                  }
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
    } = this.props;
    const { allowClear = true } = item;
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {
                initialValue: setDefaultValue,
              })(
                <RangePicker
                  showTime={true}
                  format={DATE_TIME_FORMAT}
                  allowClear={allowClear}
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
    const { showTime = true, format = 'YYYY-MM-DD HH:mm:ss' } = item;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Col span={item.colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${item.label}`}>{`${item.label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {getFieldDecorator(`${item.name}`, {})(
                <DatePicker
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

  getCustomar = item => {
    const { label, colSpan, customarFun } = item;
    return (
      <Col span={colSpan} key={`${item.name}`}>
        <div className={styles.colCon}>
          <span className={styles.colLeft} title={`${label}`}>{`${label}`}</span>
          <span className={styles.colLeftPadding}>:</span>
          <div className={styles.colRight}>
            <Form.Item {...formItemLayout} label="">
              {customarFun()}
            </Form.Item>
          </div>
        </div>
      </Col>
    );
  };

  toggle = item => {
    const { expand } = this.state;
    this.setState({ expand: !expand }, () => {
      if (item.handleResize) {
        item.handleResize();
      }
    });
  };

  getSearchBtn = item => {
    const { expand } = this.state;
    return (
      <Col
        span={item.colSpan}
        key="btn"
        className={styles.searchBtn}
        style={item.left ? { justifyContent: 'start', paddingLeft: '30px' } : {}}
      >
        <div>
          <Button
            type="primary"
            className={styles.mr10}
            onClick={this.searchBtnClick.bind(this, item.searchBtnClick)}
          >
            {`${formatMessage({ id: 'auditManagement.Inquire' })}`}
          </Button>
          <Button
            onClick={() => {
              this.handleReset();
              if (item.resetBtnClick) {
                item.resetBtnClick();
              }
            }}
          >
            {`${formatMessage({ id: 'auditManagement.Reset' })}`}
          </Button>
          {item.isExpand ? (
            <a
              style={{ marginLeft: 8, fontSize: 12 }}
              onClick={() => {
                this.toggle(item);
              }}
            >
              {expand
                ? `${formatMessage({ id: 'auditManagement.Expand' })}`
                : `${formatMessage({ id: 'auditManagement.Collapse' })}`}{' '}
              <Icon type={expand ? 'down' : 'up'} />
            </a>
          ) : (
            ''
          )}
        </div>
      </Col>
    );
  };

  searchBtnClick = clickEvent => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      clickEvent(values);
    });
  };

  resetBtnClick = () => {
    const { form } = this.props;
    form.resetFields();
  };

  getSearch = () => {
    const { expand } = this.state;
    const { searchArr, getButtonNode, customExpand, engEnvMinusColumn } = this.props;
    if (!searchArr || searchArr.length <= 0) {
      return '';
    }
    let colSpanCount = 0;
    let newSearchArr = searchArr.map(o => {
      if (engEnvMinusColumn && checkLanguageIsEnglish()) {
        let { colSpan = 6 } = o;
        if (colSpan === 6) {
          colSpan = 8;
        }
        if (colSpanCount >= 24) {
          colSpanCount = 0;
        }
        if (o.type === 'button') {
          colSpan = colSpanCount < 24 ? 24 - colSpanCount : 24;
        }
        colSpanCount += colSpan;
        return { ...o, colSpan };
      }
      return { ...o };
    });
    const lengthNode = newSearchArr[newSearchArr.length - 1];
    if (expand && !customExpand) {
      const rowNum = 24 / newSearchArr[0].colSpan;
      newSearchArr.length = rowNum - 1;
      newSearchArr.push({
        ...lengthNode,
        colSpan: 6,
      });
    }
    if (customExpand && expand) {
      newSearchArr = newSearchArr.slice(0, newSearchArr.length - 1).filter(item => {
        return !item.noExand;
      });
      const rowNum = 24 / newSearchArr[0].colSpan;
      const colSpan = (rowNum - (newSearchArr.length % rowNum)) * newSearchArr[0].colSpan;
      newSearchArr.push({
        ...lengthNode,
        colSpan,
      });
    }
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
      if (item.type === 'customar') {
        return this.getCustomar(item);
      }
      if (item.type === 'button') {
        return this.getSearchBtn(item);
      }
      return null;
    });
    if (getButtonNode) {
      arr.push(getButtonNode());
    }
    return (
      <Form className={checkLanguageIsEnglish() ? styles.enForm : ''}>
        <Row style={{ minHeight: '40px' }}>{arr}</Row>
      </Form>
    );
  };

  handleReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  render() {
    const { loading = false, style = {} } = this.props;
    return (
      <div className={styles.queryConditionsCon} style={style}>
        <Spin spinning={loading}>{this.getSearch()}</Spin>
      </div>
    );
  }
}

export default PageHeader;
