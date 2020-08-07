import React from 'react';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { debounce } from 'lodash-decorators';
import { Table as AntdTable, Tooltip } from 'antd';
import Pagination from '../Pagination';
import styles from './index.less';

const EMPTY_SIGN = '-';
const DEFAULT_TABLE_SIZE = 'small';

class MyTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      scrollY: props.initialScrollY || 245,
      computedPagination: {}, // 自动计算的分页选项
    };
  }

  componentWillReceiveProps(nextProps) {
    const { scrollYMark, selectedRowKeys } = nextProps;
    const { state, props } = this;
    if (selectedRowKeys && !isEqual(selectedRowKeys, state.selectedRowKeys)) {
      this.setState({ selectedRowKeys });
    }
    // 支持传scrollYMark变量，scrollYMark改变时，重新计算scrollY
    if (scrollYMark && scrollYMark !== props.scrollYMark) {
      this.resize();
    }
  }

  componentDidMount() {
    const { setScrollY = true } = this.props;
    if (setScrollY) {
      this.setInitialPageSize();
      window.addEventListener('resize', this.resize.bind(this));
    }
  }

  componentWillUnmount() {
    const { setScrollY = true } = this.props;
    if (setScrollY) {
      window.removeEventListener('resize', this.resize);
    }
  }

  @debounce(300)
  resize = () => {
    const scrollY = this.getScrollY();
    this.setState({ scrollY });
  };

  setInitialPageSize = () => {
    const scrollY = this.getScrollY();
    const computedPagination = this.computePagination(scrollY);
    this.setState({
      scrollY,
      computedPagination,
    });
  };

  getScrollY = () => {
    if (!this.tableRef || !this.tableRef.clientHeight) return false;
    const { showHeader = true } = this.props;
    const tableRefStyle = window.getComputedStyle(this.tableRef);
    let outHeight = tableRefStyle.height;
    const { paddingTop } = tableRefStyle;
    const getPixelFromStyle = o => Math.floor(Number(o.replace(/\s+|px/gi, '')));
    outHeight = getPixelFromStyle(outHeight) - (paddingTop ? getPixelFromStyle(paddingTop) : 0);
    let theadHeight = 0;
    if (showHeader) {
      theadHeight = this.tableRef.getElementsByTagName('thead')[0]
        ? this.tableRef.getElementsByTagName('thead')[0].offsetHeight
        : 0; // 表头高度
    }
    return outHeight - theadHeight - (showHeader ? 6 : 0); // 暂时多出来6，是因为antd表头会有6px的margin，使得tbody的高度总是非理想高度
  };

  // 自适应自动计算pagesize
  computePagination = scrollY => {
    const { autoPageSize = true, pagination = {} } = this.props;
    if (autoPageSize) {
      const trHeight = this.getTrHeight();

      const lineNumber = Math.floor(scrollY / trHeight);
      const minSize = 1;
      const pageSize = lineNumber < minSize ? minSize : lineNumber;

      let pageIndex = this.currentPage || 1;
      const { total } = pagination;
      if (total) {
        // 计算页数，最后一页
        const allPageNum = Math.floor((total - 1) / pageSize) + 1;
        if (allPageNum < pageIndex) {
          // 最后一页变化了，pageIndex要跟着变化
          pageIndex = allPageNum;
        }
      }

      this.handleTableChange(pageIndex, pageSize, 'resize');
      return {
        pageSize: lineNumber,
      };
    }

    return {};
  };

  getTrHeight = () => {
    const { size = DEFAULT_TABLE_SIZE, largerSmallSize = true } = this.props;
    let defaultHeight = 44;
    if (size === 'default') {
      defaultHeight = 54;
    } else if (size === 'middle') {
      defaultHeight = 44;
    } else if (size === 'small') {
      // 过渡期存在的一个prop，目的：以前用antd的Table时，size=small的话，单元格高度为36px，用该组件会根据ui要求改为40px
      // 那么如果一个页面里面有两个Table，一个是旧的，一个是新的，同样是size=small的话，单元格高度却不一样，所以这里支持维持antd原先的高度
      // 等到所有page的Table都已经更换为该组件时，largerSmallSize就可以删除了
      defaultHeight = largerSmallSize ? 40 : 36;
    }
    const tbody = this.tableRef.getElementsByTagName('tbody');
    if (tbody && tbody.length) {
      const { childNodes, children } = tbody[0];
      const list = children || childNodes || [];
      if (list.length) {
        const tr = list[0];
        const { offsetHeight } = tr;
        return offsetHeight;
      }
    }
    return defaultHeight;
  };

  // 改变分页，onChange和onShowSizeChange统一触发这个方法
  handleTableChange = (page, pageSize, fromResize) => {
    const { onChange, autoPageSize = true, pagination = {} } = this.props;
    this.currentPage = page;
    if (autoPageSize && !fromResize) {
      const { computedPagination = {} } = this.state;
      const { pageSize: computedPageSize } = computedPagination;
      if (computedPageSize) {
        this.setState({
          computedPagination: {
            ...computedPagination,
            pageSize,
          },
        });
      }
    }
    if (onChange) {
      onChange(page, pageSize);
    } else if (pagination.onChange) {
      pagination.onChange(page, pageSize);
    }
  };

  getColumns = () => {
    const { columns = [] } = this.props;
    return columns.map(column => {
      const _column = { ...column };
      const { render, isActionColumn } = _column;
      let renderFn = (cellData, record) => {
        if (render) {
          return render(cellData, record);
        }
        return cellData || EMPTY_SIGN;
      };
      if (_column.ellipsis) {
        renderFn = (cellData, record) => {
          let text = cellData;
          if (render) {
            text = render(cellData, record);
          }
          if (!text) return EMPTY_SIGN;
          if (typeof text === 'string' || typeof text === 'number') {
            return (
              <Tooltip title={text} placement="topLeft">
                <div className="ellipsis">{text}</div>
              </Tooltip>
            );
          }
          return text;
        };
      }
      if (isActionColumn) {
        // isActionColumn表示该列是操作列，点击该列的内容时，阻止冒泡。需要配合rowSelectable一起使用
        // 即单击某行时，会自动勾选该行，但是isActionColumn列的内容则不会触发勾选行事件，因为这里阻止冒泡了
        _column.render = (cellData, record) => (
          <div style={{ display: 'inline-block' }} onClick={event => event.stopPropagation()}>
            {renderFn(cellData, record)}
          </div>
        );
      } else {
        _column.render = renderFn;
      }
      return _column;
    });
  };

  // 选中行的样式
  activeRowByDom = key => {
    let allRows = this.tableRef.querySelectorAll('tr') || [];
    allRows = Array.from(allRows);
    allRows.forEach(row => {
      const { classList, attributes } = row;
      const dataRowKey = attributes['data-row-key'];
      if (dataRowKey) {
        const { value } = dataRowKey;
        if (`${key}` === `${value}`) {
          classList.add('active-row');
        } else {
          classList.remove('active-row');
        }
      }
    });
  };

  onRow = record => {
    const { onRow, rowKey, dataSource, rowSelectable } = this.props;
    const onRowProps = onRow ? onRow(record) : {};
    if (this.canTableCheck()) {
      // rowSelectable 表示是否支持单击行时，也自动勾选该行。支持boolean和function两种类型
      let canSelectRow = rowSelectable;
      if (typeof rowSelectable === 'function') {
        canSelectRow = rowSelectable(record);
      }
      if (canSelectRow) {
        const { selectedRowKeys } = this.state;
        let newSelectedRowKeys = [];
        // 如果已经勾选就取消，反之勾选
        if (selectedRowKeys.includes(record[rowKey])) {
          newSelectedRowKeys = selectedRowKeys.filter(o => o !== record[rowKey]);
        } else {
          newSelectedRowKeys = [...selectedRowKeys, record[rowKey]];
        }
        return {
          ...onRowProps,
          onClick: () =>
            this.handleSelectRow(
              newSelectedRowKeys,
              dataSource.filter(o => newSelectedRowKeys.includes(o[rowKey]))
            ),
        };
      }
    }
    return {
      ...onRowProps,
      onClick: event => {
        const key = record[rowKey];
        this.activeRowByDom(key);
        if (onRowProps.onClick) {
          onRowProps.onClick(event, record);
        }
      },
    };
  };

  handleSelectRow = (selectedRowKeys, selectedRows) => {
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRowKeys, selectedRows);
    }
    this.setState({ selectedRowKeys });
  };

  /**
   * 全选事件最终调用此函数————两种方式，一种是antd原始的全选checkbox，一种是项目Pagination组件的全选checkbox
   * @param selected 是否勾选
   * @param selectedRows
   */
  handleSelectAll = (selected, selectedRows) => {
    const { rowKey, onSelectAll, rowSelectable = true } = this.props;
    let selectedRowKeys = [];
    let rows = [];
    if (selected) {
      rows = selectedRows.filter(o => {
        if (typeof rowSelectable === 'function') {
          return rowSelectable(o);
        }
        return rowSelectable;
      });
      selectedRowKeys = rows.map(o => o[rowKey]);
    }
    if (onSelectAll) {
      onSelectAll(selected, rows, selectedRowKeys);
    }
    this.setState({ selectedRowKeys });
  };

  handleSelectAllCheckboxChange = e => {
    const {
      target: { checked },
    } = e;
    const { dataSource = [] } = this.props;
    this.handleSelectAll(checked, checked ? dataSource : []);
  };

  canTableCheck = () => {
    const { checkable, rowSelection } = this.props;
    return checkable || !!rowSelection;
  };

  render() {
    const {
      className = '',
      onChange,
      pagination,
      showFoot = true,
      paginationProps = {},
      rowSelection = {},
      dataSource = [],
      setScrollY = true,
      noPadding,
      expandedRowRender,
      tableBoxClassName = '',
      multiBtnList = [],
      size = DEFAULT_TABLE_SIZE,
      hideDefaultHeaderCheckbox = true,
      rowSelectable = true,
      largerSmallSize = true,
      ...restProps
    } = this.props;
    const { scrollY, selectedRowKeys, computedPagination } = this.state;
    const _rowSelection = {
      ...rowSelection,
      selectedRowKeys,
      onChange: this.handleSelectRow,
      onSelectAll: this.handleSelectAll,
    };
    const scroll = {
      x: '100%',
      scrollToFirstRowOnChange: true,
    };
    if (setScrollY) {
      scroll.y = scrollY;
    }
    const _pagination = {
      ...pagination,
      onChange: this.handleTableChange.bind(this),
      ...computedPagination,
    };
    const canCheck = this.canTableCheck();
    const canExpand = !!expandedRowRender;
    const expandOptions = canExpand ? { expandedRowRender } : {};
    return (
      <div className={classNames(styles.table, className)}>
        <div
          className={classNames(
            tableBoxClassName,
            styles.box,
            showFoot ? styles.showFooter : styles.noFooter,
            {
              [styles.hideDefaultHeaderCheckbox]: hideDefaultHeaderCheckbox,
              [styles.smallSizeTable]: size === 'small' && largerSmallSize,
              [styles.noPadding]: noPadding,
              [styles.checkableAndExpandable]: canExpand && canCheck,
              [styles.expandable]: canExpand,
              [styles.checkable]: canCheck,
            }
          )}
          ref={v => {
            this.tableRef = v;
          }}
        >
          <AntdTable
            size={size}
            {...restProps}
            scroll={scroll}
            {...expandOptions}
            onRow={this.onRow}
            pagination={false}
            dataSource={dataSource}
            columns={this.getColumns()}
            rowSelection={canCheck ? _rowSelection : null}
            rowClassName={record => {
              let showCheckBoxRadio = rowSelectable;
              if (typeof rowSelectable === 'function') {
                showCheckBoxRadio = rowSelectable(record);
              }
              if (!showCheckBoxRadio) {
                return styles.hideSelectionRow;
              }
              return '';
            }}
          />
        </div>
        {showFoot && (
          <Pagination
            showBorderTop
            multiBtnList={multiBtnList}
            pagination={_pagination}
            pageAllCount={dataSource.length}
            className={canCheck ? styles.myTablePagination : ''}
            {...paginationProps}
            selectKeysList={selectedRowKeys}
            selectAllChange={this.handleSelectAllCheckboxChange}
          />
        )}
      </div>
    );
  }
}
export default MyTable;
