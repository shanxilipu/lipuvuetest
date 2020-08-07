// 平行转树结构
export function convertCatalog(datasource = [], systems = []) {
  const sorts = datasource.sort((a, b) => {
    const aLevel = a.catalogPath.split('.').length;
    const bLevel = b.catalogPath.split('.').length;
    if (aLevel === bLevel) {
      return b.catalogOrder - a.catalogOrder;
    }
    return bLevel - aLevel;
  });

  const result = [];
  sorts.forEach(o => {
    const children = systems.filter(b => b.appsysCatalogId === o.catalogId);
    if (o.parentCatalogId === -1) {
      result.unshift({
        key: o.catalogId,
        title: o.catalogName,
        ...o,
        children: o.children ? [...o.children, ...children] : [...children],
      });
    } else {
      const parent = sorts.filter(b => b.catalogId === o.parentCatalogId)[0];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.unshift({
        key: o.catalogId,
        title: o.catalogName,
        ...o,
        children: o.children ? [...o.children, ...children] : [...children],
      });
    }
  });
  return result;
}

export function a1() {}
