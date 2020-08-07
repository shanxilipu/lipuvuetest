import request from '@/utils/request';

// 数据源类型
export async function getDatasourceTypes(payload) {
  return request('smartsafe/DatasourceController/getDatasourceTypes', {
    method: 'GET',
    body: {
      ...payload,
    },
  });
}

// 数据源详情
export async function getDatasourceDetail(payload) {
  return request('smartsafe/DatasourceController/getDatasourceDetail', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 获取层域信息
export function getAllCatalogues() {
  return request('modelweb/zdmetadata/DataModelDesignController/getAllZdmCatalogue', {
    method: 'POST',
    body: {},
  });
}

// 获取数据周期
export function getDataCycle() {
  return request('modelweb/zdmetadata/DataModelDesignController/getDataCycleList', {
    method: 'POST',
    body: {},
  });
}

// 获取表信息
export function getTableInfo(payload) {
  let url = 'modelweb/zdmetadata/';
  let data = {};
  const { schemaType } = payload;
  if (schemaType === 'hive') {
    url += 'hiveMetaTablesController/getZmgrHiveMetaTable';
    data = { metaTableId: payload.tableId };
  } else {
    url += 'DbServiceController/queryDbObjectDetail';
    data = { id: payload.tableId };
  }
  return request(url, {
    method: 'POST',
    body: {
      ...data,
    },
  });
}
// 获取DB字段信息
export function getDbFields(payload) {
  return request('modelweb/zdmetadata/DbServiceController/queryDbObjectFields', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取DB索引信息
export function getDbIndexs(payload) {
  return request('modelweb/zdmetadata/DbServiceController/queryDbObjectIndexs', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取DB索引信息
export function getDbConstraints(payload) {
  return request('modelweb/zdmetadata/DbServiceController/queryDbObjectConstraints', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取db数据库表数据
export function getDbDiction(payload) {
  return request('modelweb/zdmetadata/DbServiceController/queryDbDictionList', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 根据db表获取字段列表
export function getDbFieldsByTable(payload) {
  return request('modelweb/zdmetadata/DbServiceController/queryDbObjectFields', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取下一个字段id
export function getNextDbFieldId() {
  return request('modelweb/zdmetadata/DbServiceController/getNextDbFieldId', {
    method: 'POST',
    body: {},
  });
}
// 保存db表信息
export function saveDbObjectInfo(payload, isNew) {
  const url = `modelweb/zdmetadata/${
    isNew
      ? 'DbSafeController/saveOrUpdateDbObjectWithAttach'
      : 'DbServiceController/saveOrUpdateDbObjectInfoOnce'
  }`;
  return request(url, {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 保存hive表信息
export function saveHiveObjectInfo(payload, isNew) {
  const url = `modelweb/zdmetadata/${
    isNew
      ? 'DbSafeController/saveHiveMetaTablesWithAttach'
      : 'hiveMetaTablesController/updateZmgrHiveMetaTables'
  }`;
  return request(url, {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 删除表
export function deleteTable(payload, dbType) {
  const url = `modelweb/zdmetadata/DbSafeController/${
    dbType === 'hive' ? 'dropHiveTable' : 'deleteObjectWithAttach'
  }`;
  return request(url, {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 重命名表
export function renameTable(payload, dbType) {
  const url = `modelweb/zdmetadata/DbSafeController/${
    dbType === 'hive' ? 'renameHiveTableWithAttach' : 'renameTableCodeWithAttach'
  }`;
  return request(url, {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 根据businessId查询实体名称
export function getBusinessCodeById(payload) {
  return request('modelweb/zdmetadata/DataModelDesignController/queryBusCodeById', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取实体列表
export function getAllEntities(payload) {
  return request('modelweb/zdmetadata/DataModelDesignController/queryBusCodeGrid', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取hive表历史信息
export function getTableOperLogs(payload) {
  return request('modelweb/zdmetadata/operLogController/queryOperLog', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取hive外部表信息
export function getHiveExtObj(payload) {
  return request(
    'modelweb/zdmetadata/ClusterComponentController/quryHiveExtObjComponentIdBySchemaId',
    {
      method: 'POST',
      body: {
        ...payload,
      },
    }
  );
}
// 获取字段编码、字段名称的自动补全(autoComplete)
export function getColumnAutoComplete(payload) {
  return request('modelweb/zdmetadata/dataColumnController/queryDataColumn', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取补全的字段类型
export function getColumnDataType(payload) {
  return request('modelweb/zdmetadata/dataColumnController/getDataType', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取表用户信息
export function getTableUserInformation(payload) {
  return request('smartsafe/DatasourceController/getTableUserMessage', {
    method: 'GET',
    body: {
      ...payload,
    },
  });
}
// 刷新
export function refreshTreeNode(payload, url) {
  url = `smartsafe/DatasourceController/${url}`;
  return request(url, {
    method: 'GET',
    body: {
      ...payload,
    },
  });
}
// 执行sql
export function checkAndExecuteSql(payload) {
  return request('smartsafe/DatasourceController/checkAndExecuteSql', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 金库脱敏验证码校验
export function checkVaultMsg(payload) {
  return request('smartsafe/DatasourceController/checkVaultMsg', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取视图、函数、存储过程的sql
export function getSqlContent(payload) {
  return request('smartsafe/DatasourceController/qrySqlContentByCode', {
    method: 'GET',
    body: {
      ...payload,
    },
  });
}
// 历史日志分页查询
export function getDatabaseLogs(payload) {
  return request('smartsafe/SafeLogDatabasePortalController/queryLogDatabasePortalList', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 查看执行消息
export function getExecutionMessages(payload) {
  return request('smartsafe/SafeLogDatabasePortalController/queryLogDatabasePortal', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取静态资源
export function getConfigList(payload) {
  return request('smartsafe/DcSystemConfigListController/getConfigList', {
    method: 'GET',
    body: {
      ...payload,
    },
  });
}
// 删除函数或存储过程
export function deleteFunOrPro(payload, datasourceType) {
  const url = `modelweb/zdmetadata/DbSafeController/${
    datasourceType === 'hive' ? 'deleteFunOrProWithHive' : 'deleteFunOrProWithDb'
  }`;
  return request(url, {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}
// 获取水印内容
export function getWaterMark() {
  return request('smartsafe/WatermarkFieldController/getActivedWaterContent', {
    method: 'GET',
    body: {},
  });
}

// 获取数据源
export function getDatabases(payload) {
  return request('smartsafe/DatasourceController/listDatabase', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取分区名
export function listHivePartitionColumn(payload) {
  return request('smartsafe/DatasourceController/listHivePartitionColumn', {
    method: 'GET',
    body: { ...payload },
  });
}

// 导入文件
export function hiveUploadFile(payload) {
  return request('smartsafe/DatasourceController/uploadFile', {
    method: 'POST',
    body: payload,
  });
}

// 获取数据源下的表
export function getTablesOrViews(payload) {
  return request('smartsafe/DatasourceController/listComponent', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取数据源下的函数或存储过程
export function getFunctionsOrProcedures(payload) {
  return request('smartsafe/DatasourceController/listFunction', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取表或视图下的字段
export function getFields(payload) {
  return request('smartsafe/DatasourceController/listFields', {
    method: 'GET',
    body: { ...payload },
  });
}
