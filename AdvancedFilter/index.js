import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatMessage } from 'umi/locale';
import MyIcon from '@/components/MyIcon';
import { Form, Select, Input, DatePicker, Row, Col, Button, Spin } from 'antd';
import moment from 'moment';
import { checkLanguageIsEnglish, extractSearchParams } from '@/utils/utils';
import styles from './index.less';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const formLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};
const formLayout1 = {
  labelCol: {
    sm: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

@Form.create()
class AdvancedFilter extends React.PureComponent {
  constructor(props) {
    super(props);
    const { defaultExpand = true } = props;
    this.state = {
      expanded: defaultExpand,
    };
  }

  handleReset = () => {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
    this.handleSearch();
  };

  handleSearch = () => {
    const {
      searchArr,
      onSearch,
      form: { getFieldsValue },
    } = this.props;
    const values = getFieldsValue();
    searchArr.forEach(o => {
      const { name, type, format = DEFAULT_DATE_FORMAT } = o;
      if (type === 'datePicker' && values[name]) {
        values[name] = moment(values[name]).format(format);
      } else if (type === 'rangePicker' && values[name]) {
        const { startName, endName } = o;
        if (startName && endName) {
          const [start, end] = values[name];
          if (start) {
            values[startName] = moment(start).format(format);
          }
          if (end) {
            values[endName] = moment(end).format(format);
          }
          delete values[name];
        }
      }
    });
    onSearch(extractSearchParams(values));
  };

  toggleExpand = () => {
    const { expanded } = this.state;
    const { afterToggle } = this.props;
    this.setState({ expanded: !expanded }, () => {
      if (afterToggle) {
        afterToggle(!expanded);
      }
    });
  };

  getSearchButtons = () => {
    const { expanded } = this.state;
    const { showReset = true, canFold = false } = this.props;
    const layout = this.getFormLayout();
    const {
      labelCol: {
        sm: { span: span1 },
      },
    } = layout;
    const {
      wrapperCol: {
        sm: { span: span2 },
      },
    } = layout;
    return (
      <Col span={span1 + span2}>
        <div className={styles.searchButtons}>
          <Button type="primary" onClick={this.handleSearch}>
            {formatMessage({ id: 'BTN_SEARCH', defaultMessage: '查询' })}
          </Button>
          {showReset && (
            <Button onClick={this.handleReset}>
              {formatMessage({ id: 'BTN_RESET', defaultMessage: '重置' })}
            </Button>
          )}
          {canFold && (
            <a onClick={this.toggleExpand}>
              <span>
                {expanded
                  ? formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })
                  : formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}
              </span>
              {expanded ? (
                <MyIcon size="small" type="iconup" />
              ) : (
                <MyIcon size="small" type="icondown" />
              )}
            </a>
          )}
        </div>
      </Col>
    );
  };

  getComponent = item => {
    const { type = 'input', dataSource = [], label, ...restProps } = item;
    switch (type) {
      case 'input':
        return <Input allowClear placeholder={label} {...restProps} />;
      case 'select':
        return (
          <Select allowClear placeholder={label} {...restProps}>
            {dataSource.map(o => (
              <Select.Option key={o.key || o.value} value={o.value}>
                {o.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'rangePicker':
        return (
          <DatePicker.RangePicker
            showTime
            format={DEFAULT_DATE_FORMAT}
            style={{ width: '100%' }}
            {...restProps}
          />
        );
      case 'datePicker':
        return (
          <DatePicker
            showTime
            format={DEFAULT_DATE_FORMAT}
            style={{ width: '100%' }}
            {...restProps}
          />
        );
      default:
        return null;
    }
  };

  getComponents = () => {
    const { expanded } = this.state;
    const {
      searchArr,
      columnNumber = 3,
      engEnvMinusColumn,
      form: { getFieldDecorator },
    } = this.props;
    if (!searchArr.length) {
      return null;
    }
    // 临时变量，每到24就置0，用于计算搜索按钮占位
    let globalColSpan = 24 / columnNumber;
    if (engEnvMinusColumn && checkLanguageIsEnglish()) {
      globalColSpan = 24 / (columnNumber + 1);
    }
    const newSearchArr = searchArr.slice();
    newSearchArr.forEach(o => {
      const { colSpan } = o;
      if (colSpan && engEnvMinusColumn && checkLanguageIsEnglish()) {
        // 有些情况下，英文环境在原本是4列的情况下减少到3列，因为英文翻译的label很长
        if (colSpan === 6) {
          o.colSpan = 8;
        }
      } else if (!colSpan) {
        o.colSpan = globalColSpan;
      }
    });
    let colSpanCount = 0;
    let searchButtonIndex = 0;
    if (!expanded) {
      for (; searchButtonIndex < newSearchArr.length; searchButtonIndex++) {
        colSpanCount += newSearchArr[searchButtonIndex].colSpan;
        if (colSpanCount >= 24) {
          break;
        }
      }
    } else {
      searchButtonIndex = newSearchArr.length;
    }
    colSpanCount = 0;
    newSearchArr.forEach(o => {
      const { colSpan } = o;
      colSpanCount += colSpan;
      if (colSpanCount >= 24) {
        colSpanCount = 0;
      }
    });
    if (expanded) {
      const restColSpan = 24 - colSpanCount || 24;
      if (restColSpan > globalColSpan) {
        const extraCols = (restColSpan - globalColSpan) / globalColSpan;
        searchButtonIndex += extraCols;
        for (let i = 0; i < extraCols; i++) {
          newSearchArr.push({ emptyCol: true, colSpan: globalColSpan });
        }
      }
    }
    const searchButton = { type: 'button', name: 'search', colSpan: globalColSpan };
    newSearchArr.splice(searchButtonIndex, 0, searchButton);
    return newSearchArr.map((o, i) => {
      const { type, label, name, colSpan, emptyCol } = o;
      let { initialValue = '' } = o;
      if (!initialValue) {
        if (type === 'select') {
          initialValue = undefined;
        }
      }
      if (emptyCol) {
        return <Col key={i} span={colSpan} />;
      }
      return (
        <Col span={colSpan} key={o.name}>
          {type === 'button' ? (
            this.getSearchButtons(o)
          ) : (
            <Form.Item label={label}>
              {getFieldDecorator(name, {
                initialValue,
              })(this.getComponent(o))}
            </Form.Item>
          )}
        </Col>
      );
    });
  };

  getFormLayout = () => {
    const { columnNumber = 3 } = this.props;
    return columnNumber <= 3 ? { ...formLayout1 } : { ...formLayout };
  };

  render() {
    const { expanded } = this.state;
    const { loading = false, className = '' } = this.props;
    return (
      <Spin
        spinning={loading}
        wrapperClassName={classNames(
          styles.advancedFilter,
          className,
          !expanded ? styles.folded : ''
        )}
      >
        <Form {...this.getFormLayout()}>
          <Row>{this.getComponents()}</Row>
        </Form>
      </Spin>
    );
  }
}
AdvancedFilter.propTypes = {
  defaultExpand: PropTypes.bool, // 是否默认展开
  engEnvMinusColumn: PropTypes.bool, // 英文环境下是否缩减一列
  searchArr: PropTypes.array.isRequired,
  onSearch: PropTypes.func, // 查询的回调
  afterToggle: PropTypes.func, // 展开/收起后的回调
  canFold: PropTypes.bool, // 是否可以展开/收起操作
  loading: PropTypes.bool,
  columnNumber: PropTypes.number, // 列数，首先按照列数布局，但是searchArr中的colSpan优先级更高
};
export default AdvancedFilter;
