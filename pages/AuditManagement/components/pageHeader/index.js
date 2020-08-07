import React, { Component } from 'react';
import styles from './index.less';

// eslint-disable-next-line react/prefer-stateless-function
class PageHeader extends Component {
  render() {
    const { titleText, getButtonNode, style = {} } = this.props;
    return (
      <div className={styles.titleCon} style={style}>
        <span className={styles.titleFont}>{titleText}</span>
        <div className={styles.btnCon}>{getButtonNode ? getButtonNode() : ''}</div>
      </div>
    );
  }
}

export default PageHeader;
