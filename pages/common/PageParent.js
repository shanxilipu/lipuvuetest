import React from 'react';

const PageParent = (props = {}) => {
  const { children } = props;
  return <div className="fullHeight">{children}</div>;
};
export default PageParent;
