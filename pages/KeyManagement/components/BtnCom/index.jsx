import React, { Component } from 'react';
import { Button } from 'antd';
import styles from './index.less';

class BtnCom extends Component {
  componentDidMount() {}

  render() {
    const { btnArr, loading } = this.props;

    return (
      <div className={styles.BtnCom}>
        {btnArr.map(item => {
          return (
            <Button
              type={item.type}
              key={item.key}
              onClick={item.onClick}
              className={styles.BtnItem}
              loading={item.key === 'save' && loading}
            >
              {item.name}
            </Button>
          );
        })}
      </div>
    );
  }
}

export default BtnCom;
