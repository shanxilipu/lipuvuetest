import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import isEmpty from 'lodash/isEmpty';
import MyIcon from '@/components/MyIcon';
import TreeCatalog from '../AppSystemCatague';
import SysManage from '../AppSystems';
import { getDefaultAppSystemCode } from '@/services/authorizeManagement/applySysUserManagement';
import { defaultHandleResponse } from '@/utils/utils';
import styles from './index.less';

class ApplySysUserManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSys: {},
      selectedCatalogue: {},
      defaultAppsysCode: '',
    };
  }

  componentWillMount() {
    this.getDefaultAppSystemCode();
  }

  getDefaultAppSystemCode = () => {
    getDefaultAppSystemCode().then(response => {
      defaultHandleResponse(response, resultObject => {
        this.setState({ defaultAppsysCode: resultObject || '' });
      });
    });
  };

  setSysChild = setSysChild => {
    this.$setSysChild = setSysChild;
  };

  render() {
    const { selectedCatalogue } = this.state;
    const { getComponent, systemEditable = true } = this.props;
    return (
      <div className={styles.mainCon}>
        <TreeCatalog
          {...this.state}
          $setSysChild={this.$setSysChild}
          setSelectedItem={item => this.setState({ selectedCatalogue: { ...item } })}
        />
        <div className={styles.rightCon}>
          {isEmpty(selectedCatalogue) ? (
            <div className={styles.noSelFile}>
              <MyIcon type="icon-zanwushuju" style={{ fontSize: '80px' }} />
              <span>{formatMessage({ id: 'applySysUserManagement.emptyTip' })}</span>
            </div>
          ) : (
            <Fragment>
              <div className={styles.selectCatalogue}>
                <span className={styles.selTreeItem}>
                  {`${formatMessage({ id: 'applySysUserManagement.SelectDirectory' })}: `}
                </span>
                <span>{selectedCatalogue.catalogName}</span>
              </div>
              <SysManage
                {...this.state}
                setSysChild={this.setSysChild}
                editable={systemEditable}
                setSelectedSystem={item => this.setState({ selectedSys: { ...item } })}
              />
              {getComponent({ ...this.state })}
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default ApplySysUserManagement;
