import React from 'react';
import { Icon, Spin } from 'antd';
import styles from './index.less';

class WaterMarkModal extends React.PureComponent {
  constructor(props) {
    super(props);
    const { logId, width = 520, height = 470 } = props;
    this.src = `smartsafe/streamController/watermarkpicForLog?logId=${logId}&width=${width -
      80}&height=${height - 40}&signature-sessionId=${window.name}`;
    this.state = {
      loading: true,
    };
  }

  render() {
    const { onClose, width = 520, height = 470 } = this.props;
    const { loading } = this.state;
    return (
      <div className={styles.waterMarkModal}>
        <div className={styles.waterMarkContent} style={{ width, height }}>
          <Icon type="close-circle" className={styles.waterMarkCloseButton} onClick={onClose} />
          <Spin spinning={loading}>
            <img
              className={styles.waterMarkImg}
              alt=""
              src={this.src}
              onLoad={() => this.setState({ loading: false })}
            />
          </Spin>
        </div>
      </div>
    );
  }
}

export default WaterMarkModal;
