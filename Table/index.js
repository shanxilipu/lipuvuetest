import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import MyTable from './MyTable';

class Table extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { shouldUpdateProps = [] } = nextProps;
    // 如果配置了 shouldUpdateProps
    if (shouldUpdateProps.length) {
      let shouldUpdate = false;
      shouldUpdateProps.forEach(key => {
        // eslint-disable-next-line react/destructuring-assignment
        const nextItem = nextProps[key];
        // eslint-disable-next-line react/destructuring-assignment
        const thisItem = this.props[key];
        if (!isEqual(nextItem, thisItem)) {
          // 有一个不等于，那么就需要更新了
          shouldUpdate = true;
        }
      });

      return shouldUpdate;
    }

    return true;
  }

  render() {
    return <MyTable {...this.props} />;
  }
}
Table.propTypes = {
  autoPageSize: PropTypes.bool,
  checkable: PropTypes.bool,
  className: PropTypes.string,
  columns: PropTypes.array,
  dataSource: PropTypes.array,
  expandedRowRender: PropTypes.func,
  hideDefaultHeaderCheckbox: PropTypes.bool,
  loading: PropTypes.bool,
  multiBtnList: PropTypes.array,
  noPadding: PropTypes.bool,
  onChange: PropTypes.func,
  onRow: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectRow: PropTypes.func,
  pagination: PropTypes.object,
  paginationProps: PropTypes.object,
  rowKey: PropTypes.string.isRequired,
  rowSelectable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  scrollYMark: PropTypes.any,
  selectedRowKeys: PropTypes.array,
  showFoot: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'middle', 'default']),
  tableBoxClassName: PropTypes.string,
};
export default Table;
