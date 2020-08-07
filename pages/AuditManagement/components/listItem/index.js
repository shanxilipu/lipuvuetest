import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Row, Col, Card, Checkbox, Tooltip } from 'antd';
import styles from './index.less';
import { MEASURE_NAME } from '@/common/const';

class ListItem extends Component {
  componentDidMount() {}

  // 是否展开
  handleShowMore = e => {
    e.stopPropagation();
    const { needShowMore, showMore, task } = this.props;
    if (needShowMore) {
      showMore(task);
    } else {
      return false;
    }
  };

  // 是否选中
  handleSeletedTask = e => {
    e.stopPropagation();
    const { task, seletedTaskHandler } = this.props;
    seletedTaskHandler(task);
  };

  getParamValueByCodeFromSafeTypeParamList = safeDesensitizeTypeParamList => {
    let [position, keepPosition, mcount, keepCount, decryptCode, userName, msymbol] = [
      -1,
      -1,
      -1,
      -1,
      '',
      '',
      '',
    ];
    safeDesensitizeTypeParamList.forEach(item => {
      if (item.paramCode === 'MASK_POSITION') {
        position = item.paramValue;
      }
      if (item.paramCode === 'KEEP_POSITION') {
        keepPosition = item.paramValue;
      }
      if (item.paramCode === 'MASK_COUNT') {
        mcount = item.paramValue;
      }
      if (item.paramCode === 'KEEP_COUNT') {
        keepCount = item.paramValue;
      }
      if (item.paramCode === 'MASK_SYMBOL' || item.paramCode === 'FULL_SYMBOL') {
        msymbol = item.paramValue;
      }
      if (item.paramCode === 'DECRYPT_ALGORITHM') {
        decryptCode = item.paramValue;
      }
      if (item.paramCode === 'SMS_USER_CODE') {
        userName = item.paramValue;
      }
    });
    return {
      position,
      keepPosition,
      mcount,
      keepCount,
      decryptCode,
      userName,
      msymbol,
    };
  };

  getMeasureObj = (itemName, task) => {
    let desensitizeType = '';
    let desensitizeDescribe = '';
    if (itemName === 'measureConfig') {
      const safeDesensitizeTypeParamList = task && task.safeDesensitizeTypeParamList;
      if (safeDesensitizeTypeParamList) {
        const typeObj = this.getParamValueByCodeFromSafeTypeParamList(safeDesensitizeTypeParamList);
        if (task.desensitizeType === '1') {
          desensitizeDescribe = `${formatMessage({
            id: 'MeasureConfig.DesensitizationRule2',
            defaultMessage: '用',
          })} ${typeObj.msymbol} ${formatMessage({
            id: 'MeasureConfig.DesensitizationRule8',
            defaultMessage: '遮盖',
          })}`;
        } else if (task.desensitizeType === '5') {
          desensitizeDescribe = `${formatMessage({
            id: 'MeasureConfig.DesensitizationRule1',
            defaultMessage: '默认设置，无须手动设置',
          })}`;
        } else if (task.desensitizeType === '2') {
          desensitizeDescribe = `${formatMessage({
            id: 'MeasureConfig.DesensitizationRule2',
            defaultMessage: '用',
          })} ${typeObj.msymbol} ${formatMessage({
            id: 'MeasureConfig.DesensitizationRule3',
            defaultMessage: '从第',
          })} ${typeObj.position} ${formatMessage({
            id: 'MeasureConfig.DesensitizationRule4',
            defaultMessage: '个字符开始遮盖',
          })} ${typeObj.mcount} ${formatMessage({
            id: 'MeasureConfig.DesensitizationRule5',
            defaultMessage: '个字符',
          })}`;
        } else if (task.desensitizeType === '3') {
          desensitizeDescribe = `${formatMessage({
            id: 'MeasureConfig.DesensitizationRule6',
            defaultMessage: '数据加密算法',
          })}: ${typeObj.decryptCode === '1' ? 'MD5' : 'RSA/ASE'}`;
        } else if (task.desensitizeType === '4') {
          desensitizeDescribe = `${formatMessage({
            id: 'MeasureConfig.DesensitizationRule7',
            defaultMessage: '审批账号',
          })}: ${typeObj.userName}`;
        } else if (task.desensitizeType === '6') {
          desensitizeDescribe = `${formatMessage({
            id: 'MeasureConfig.DesensitizationRule9',
            defaultMessage: '保留',
          })} ${
            typeObj.keepPosition === '1'
              ? formatMessage({ id: 'MeasureConfig.DesensitizationRule10', defaultMessage: '前面' })
              : formatMessage({ id: 'MeasureConfig.DesensitizationRule11', defaultMessage: '后面' })
          } ${formatMessage({ id: 'MeasureConfig.DesensitizationRule12', defaultMessage: '第' })} ${
            typeObj.keepCount
          } ${formatMessage({
            id: 'MeasureConfig.DesensitizationRule5',
            defaultMessage: '个字符',
          })}`;
        }
      }
      desensitizeType = MEASURE_NAME[task.desensitizeType];
    }
    return {
      desensitizeType,
      desensitizeDescribe,
    };
  };

  getItem = () => {
    const { task, column, selected, btnCon, itemName } = this.props;
    const desensitizeType = this.getMeasureObj(itemName, task).desensitizeType || '';
    const desensitizeDescribe = this.getMeasureObj(itemName, task).desensitizeDescribe || '';
    return column.map((item, index) => {
      if (item.dataIndex === 'checkbox') {
        return (
          <Col span={item.colSpan} key={index} className={styles.itemCenter}>
            <Checkbox
              onClick={this.handleSeletedTask}
              checked={selected}
              className={styles.taskSelector}
            />
          </Col>
        );
      }
      if (item.dataIndex === 'btn') {
        return (
          <Col span={item.colSpan} key={index} className={`${styles.itemCenter} ${styles.flexEnd}`}>
            {btnCon()}
          </Col>
        );
      }
      return (
        <Col span={item.colSpan} key={index}>
          <div style={{ paddingLeft: '10px' }}>
            <div className={styles.taskHeadLabel}>{item.title}</div>
            {itemName === 'measureConfig' && item.dataIndex === 'desensitizeType' ? (
              <Tooltip placement="top" title={desensitizeType} arrowPointAtCenter>
                <span className={styles.taskNameLabel}>{desensitizeType}</span>
              </Tooltip>
            ) : itemName === 'measureConfig' && item.dataIndex === 'desensitizeDescribe' ? (
              <Tooltip placement="top" title={desensitizeDescribe} arrowPointAtCenter>
                <span className={styles.taskNameLabel}>{desensitizeDescribe}</span>
              </Tooltip>
            ) : (
              <Tooltip placement="top" title={task[item.dataIndex]} arrowPointAtCenter>
                <span className={styles.taskNameLabel}>{task[item.dataIndex]}</span>
              </Tooltip>
            )}
          </div>
        </Col>
      );
    });
  };

  render() {
    const { marginBottom = 30, needShowMore } = this.props;

    return (
      <div>
        <Card
          onClick={this.handleShowMore}
          hoverable
          bordered={false}
          style={{ marginBottom }}
          bodyStyle={{ padding: 0 }}
        >
          <Card.Meta
            className={styles.cardMeta}
            description={
              <div style={{ marginBottom: needShowMore ? 16 : 0 }}>
                <div className={styles.taskHead}>
                  <Row>{this.getItem()}</Row>
                </div>
              </div>
            }
          />
        </Card>
      </div>
    );
  }
}

export default ListItem;
