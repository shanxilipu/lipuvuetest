import React, { PureComponent } from 'react';
import styles from './index.less';

class PageHeader extends PureComponent {
  render() {
    const { title, children } = this.props;
    return (
      <div className={styles.titleCon}>
        <span className={styles.titleFont}>{title}</span>
        <div className={styles.btnCon}>{children}</div>
      </div>
    );
  }
}
export default PageHeader;
