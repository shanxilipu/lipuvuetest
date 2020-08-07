import React from 'react';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { Form, DatePicker, Select } from 'antd';
import { DEFAULT_DATE_FORMAT, COMMON_RULE } from '@/pages/common/const';
import { getExistFieldsByGroup } from '@/pages/storageSecurityMgr/services/encryptionStrategy';
import { defaultHandleResponse } from '@/utils/utils';
import styles from './index.less';

@Form.create()
class ExtraForm extends React.Component {
  constructor(props) {
    super(props);
    const { Ref } = props;
    if (Ref) {
      Ref(this);
    }
    this.initialDate = moment(moment().format(DEFAULT_DATE_FORMAT));
    this.state = {
      filedList: [],
      getFieldListLoading: false,
    };
  }

  componentDidMount() {
    const { groupId } = this.props;
    if (!groupId) {
      return false;
    }
    this.getFields(groupId);
  }

  componentWillReceiveProps(nextProps) {
    const { groupId: preGroupId } = this.props;
    const { groupId } = nextProps;
    if (groupId && groupId !== preGroupId) {
      this.getFields(groupId);
    }
  }

  getFields = groupId => {
    this.setState({ getFieldListLoading: true });
    getExistFieldsByGroup(groupId).then(response => {
      this.setState({ getFieldListLoading: false });
      defaultHandleResponse(response, resultObject => {
        this.setState({ filedList: resultObject || [] });
      });
    });
  };

  getValues = () => {
    const {
      form: { validateFields },
    } = this.props;
    let res = null;
    validateFields((err, values) => {
      if (!err) {
        const { initDatetime } = values;
        res = { ...values, initDatetime: moment(initDatetime).format(DEFAULT_DATE_FORMAT) };
      }
    });
    return res;
  };

  render() {
    const { filedList, getFieldListLoading } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form hideRequiredMark className={styles.extraForm}>
        <Form.Item
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          label={formatMessage({
            id: 'storage.strategy.initialTime',
            defaultMessage: '初始化时间',
          })}
        >
          {getFieldDecorator('initDatetime', {
            rules: [COMMON_RULE],
            initialValue: this.initialDate,
          })(<DatePicker style={{ width: '100%' }} format={DEFAULT_DATE_FORMAT} showTime />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 13 }}
          wrapperCol={{ span: 11 }}
          label={formatMessage({
            id: 'storage.strategy.sameKeyFieldTips',
            defaultMessage: '如需与目前字段库其它字段同密钥',
          })}
        >
          {getFieldDecorator('sameAsOtherField', {
            initialValue: undefined,
          })(
            <Select
              allowClear
              loading={getFieldListLoading}
              disabled={getFieldListLoading}
              placeholder={formatMessage({
                id: 'storage.strategy.selectField',
                defaultMessage: '选择字段',
              })}
            >
              {filedList.map(o => (
                <Select.Option key={o.fieldCode} value={o.fieldCode}>
                  {o.fieldCode}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </Form>
    );
  }
}
export default ExtraForm;
