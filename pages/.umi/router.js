import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@tmp/history';
import RendererWrapper0 from '/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/.umi/LocaleWrapper.jsx'
import _dvaDynamic from 'dva/dynamic'

const Router = require('dva/router').routerRedux.ConnectedRouter;

const routes = [
  {
    "path": "/",
    "alias": "/home/dataManagement/databaseOperation",
    "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "layouts__BasicLayout__basicLayout" */'../../layouts/BasicLayout/basicLayout'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../../layouts/BasicLayout/basicLayout').default,
    "routes": [
      {
        "path": "/",
        "redirect": "/home/dataManagement/databaseOperation",
        "exact": true
      },
      {
        "path": "/home",
        "name": "统一门户",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__Home" */'../Home'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../Home').default,
        "routes": [
          {
            "path": "/home/dataManagement",
            "name": "数据管理",
            "routes": [
              {
                "path": "/home/dataManagement/databaseOperation",
                "name": "数据库操作",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__Home__DataManagement__DatabaseOperation__models__dbOperation.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/Home/DataManagement/DatabaseOperation/models/dbOperation.js').then(m => { return { namespace: 'dbOperation',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__Home" */'../Home/DataManagement/DatabaseOperation'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../Home/DataManagement/DatabaseOperation').default,
                "exact": true
              },
              {
                "path": "/home/dataManagement/dataDownload",
                "name": "数据下载",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__Home" */'../Home/DataManagement/DataDownload'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../Home/DataManagement/DataDownload').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "path": "/home/hostMaintain",
            "name": "主机维护",
            "routes": [
              {
                "path": "/home/hostMaintain/remoteAccess",
                "name": "远程访问",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__Home__HostMaintain__models__remoteAccess.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/Home/HostMaintain/models/remoteAccess.js').then(m => { return { namespace: 'remoteAccess',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__Home" */'../Home/HostMaintain/RemoteAccess'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../Home/HostMaintain/RemoteAccess').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/auditManagement",
        "name": "审计管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement').default,
        "routes": [
          {
            "path": "/auditManagement/auditInquire",
            "name": "审计查询",
            "routes": [
              {
                "path": "/auditManagement/auditInquire/sensitiveLogInquire",
                "name": "敏感日志查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/SensitiveLogInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/SensitiveLogInquire').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditInquire/hostLogInquire",
                "name": "主机日志查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/HostLogInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/HostLogInquire').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditInquire/riskEventInquire",
                "name": "风险事件查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/RiskEventInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/RiskEventInquire').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditInquire/alarmSMSInquire",
                "name": "告警短信查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/AlarmSMSInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/AlarmSMSInquire').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditInquire/waterMarkInquire",
                "name": "水印信息查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/WaterMarkInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/WaterMarkInquire').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditInquire/collectionLogInquire",
                "name": "采集日志查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/CollectionLogInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/CollectionLogInquire').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditInquire/collectionAlarmInquire",
                "name": "采集告警查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditInquire/CollectionAlarmInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditInquire/CollectionAlarmInquire').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "path": "/auditManagement/auditConfig",
            "name": "审计配置",
            "routes": [
              {
                "path": "/auditManagement/auditConfig/riskIdentificationConfig",
                "name": "风险识别配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditConfig/RiskIdentificationConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditConfig/RiskIdentificationConfig').default,
                "exact": true
              },
              {
                "path": "/auditManagement/auditConfig/collectionAlarmConfig",
                "name": "采集告警配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuditManagement__models__alarmSMSInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/alarmSMSInquire.js').then(m => { return { namespace: 'alarmSMSInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__hostLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/hostLogInquire.js').then(m => { return { namespace: 'hostLogInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__riskEventInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/riskEventInquire.js').then(m => { return { namespace: 'riskEventInquire',...m.default}}),
  import(/* webpackChunkName: 'p__AuditManagement__models__sensitiveLogInquire.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuditManagement/models/sensitiveLogInquire.js').then(m => { return { namespace: 'sensitiveLogInquire',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuditManagement" */'../AuditManagement/AuditConfig/CollectionAlarmConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuditManagement/AuditConfig/CollectionAlarmConfig').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/sensitiveManagement",
        "name": "脱敏管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement').default,
        "routes": [
          {
            "path": "/sensitiveManagement/sensitiveConfig",
            "name": "脱敏配置",
            "routes": [
              {
                "path": "/sensitiveManagement/sensitiveConfig/levelConfig",
                "name": "敏感级别配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveConfig/LevelConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveConfig/LevelConfig').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveConfig/measureConfig",
                "name": "脱敏措施配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveConfig/MeasureConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveConfig/MeasureConfig').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveConfig/fieldPermissionsConfig",
                "name": "敏感字段权限配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SensitiveManagement__SensitiveConfig__FieldPermissionsConfig__model.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SensitiveManagement/SensitiveConfig/FieldPermissionsConfig/model.js').then(m => { return { namespace: 'model',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveConfig/FieldPermissionsConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveConfig/FieldPermissionsConfig').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveConfig/exportWatermarkConfig",
                "name": "导出水印配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveConfig/ExportWatermarkConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveConfig/ExportWatermarkConfig').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveConfig/fieldLibraryConfig",
                "name": "字段库管理",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveConfig/FieldLibraryConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveConfig/FieldLibraryConfig').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveConfig/encrypeSaveStrategy",
                "name": "加密存储策略",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SensitiveManagement__SensitiveConfig__EncrypeSaveStrategy__model.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SensitiveManagement/SensitiveConfig/EncrypeSaveStrategy/model.js').then(m => { return { namespace: 'model',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveConfig/EncrypeSaveStrategy'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveConfig/EncrypeSaveStrategy').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "path": "/sensitiveManagement/sensitiveIdentify",
            "name": "敏感识别",
            "routes": [
              {
                "path": "/sensitiveManagement/sensitiveIdentify/fieldDefinition",
                "name": "敏感字段手动定义",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SensitiveManagement__SensitiveIdentify__FieldDefinition__model.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SensitiveManagement/SensitiveIdentify/FieldDefinition/model.js').then(m => { return { namespace: 'model',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveIdentify/FieldDefinition'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveIdentify/FieldDefinition').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveIdentify/safetyConfig",
                "name": "安全条目配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveIdentify/SafetyConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveIdentify/SafetyConfig').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveIdentify/fieldConfirm",
                "name": "敏感字段确认",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SensitiveManagement__SensitiveIdentify__FieldConfirm__model.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SensitiveManagement/SensitiveIdentify/FieldConfirm/model.js').then(m => { return { namespace: 'model',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveIdentify/FieldConfirm'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveIdentify/FieldConfirm').default,
                "exact": true
              },
              {
                "path": "/sensitiveManagement/sensitiveIdentify/fieldInquire",
                "name": "敏感字段查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SensitiveManagement__SensitiveIdentify__FieldInquire__model.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SensitiveManagement/SensitiveIdentify/FieldInquire/model.js').then(m => { return { namespace: 'model',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SensitiveManagement" */'../SensitiveManagement/SensitiveIdentify/FieldInquire'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SensitiveManagement/SensitiveIdentify/FieldInquire').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/authorizeManagement",
        "name": "授权管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuthorizeManagement__models__UserCodeLinkModel.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuthorizeManagement/models/UserCodeLinkModel.js').then(m => { return { namespace: 'UserCodeLinkModel',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuthorizeManagement" */'../AuthorizeManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuthorizeManagement').default,
        "routes": [
          {
            "path": "/authorizeManagement/authorizeConfig",
            "name": "授权配置",
            "routes": [
              {
                "path": "/authorizeManagement/authorizeConfig/applySysUserManagement",
                "name": "应用系统用户管理",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuthorizeManagement__models__UserCodeLinkModel.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuthorizeManagement/models/UserCodeLinkModel.js').then(m => { return { namespace: 'UserCodeLinkModel',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuthorizeManagement" */'../AuthorizeManagement/AuthorizeConfig/ApplySysUserManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuthorizeManagement/AuthorizeConfig/ApplySysUserManagement').default,
                "exact": true
              },
              {
                "path": "/authorizeManagement/authorizeConfig/rolesManagement",
                "name": "应用系统角色管理",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuthorizeManagement__models__UserCodeLinkModel.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuthorizeManagement/models/UserCodeLinkModel.js').then(m => { return { namespace: 'UserCodeLinkModel',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuthorizeManagement" */'../AuthorizeManagement/AuthorizeConfig/RolesManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuthorizeManagement/AuthorizeConfig/RolesManagement').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "path": "/authorizeManagement/userCodeAuthorize",
            "name": "账号授权",
            "routes": [
              {
                "path": "/authorizeManagement/userCodeAuthorize/userCodeLinkConfig",
                "name": "账号关联配置",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuthorizeManagement__models__UserCodeLinkModel.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuthorizeManagement/models/UserCodeLinkModel.js').then(m => { return { namespace: 'UserCodeLinkModel',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuthorizeManagement" */'../AuthorizeManagement/UserCodeAuthorize/AserCodeLinkConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuthorizeManagement/UserCodeAuthorize/AserCodeLinkConfig').default,
                "exact": true
              },
              {
                "path": "/authorizeManagement/userCodeAuthorize/applySysAuthorize",
                "name": "应用系统用户授权",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__AuthorizeManagement__UserCodeAuthorize__ApplySysAuthorize__model.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuthorizeManagement/UserCodeAuthorize/ApplySysAuthorize/model.js').then(m => { return { namespace: 'model',...m.default}}),
  import(/* webpackChunkName: 'p__AuthorizeManagement__models__UserCodeLinkModel.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/AuthorizeManagement/models/UserCodeLinkModel.js').then(m => { return { namespace: 'UserCodeLinkModel',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__AuthorizeManagement" */'../AuthorizeManagement/UserCodeAuthorize/ApplySysAuthorize'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../AuthorizeManagement/UserCodeAuthorize/ApplySysAuthorize').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/systemManagement",
        "name": "系统管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__SystemManagement" */'../SystemManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SystemManagement').default,
        "routes": [
          {
            "path": "/systemManagement/systemConfig",
            "name": "系统配置",
            "routes": [
              {
                "path": "/systemManagement/systemConfig",
                "name": "验证码管理",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SystemManagement__SystemConfig__CodeManagement__models__sendCheckRule.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SystemManagement/SystemConfig/CodeManagement/models/sendCheckRule.js').then(m => { return { namespace: 'sendCheckRule',...m.default}}),
  import(/* webpackChunkName: 'p__SystemManagement__SystemConfig__CodeManagement__models__tempConfigRule.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SystemManagement/SystemConfig/CodeManagement/models/tempConfigRule.js').then(m => { return { namespace: 'tempConfigRule',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SystemManagement" */'../SystemManagement/SystemConfig/CodeManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SystemManagement/SystemConfig/CodeManagement').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "path": "/systemManagement/logQuery",
            "name": "日志查询",
            "routes": [
              {
                "path": "/systemManagement/logQuery/operateLog",
                "name": "操作日志",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__SystemManagement__LogQuery__OperateLog__models__operateLog.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/SystemManagement/LogQuery/OperateLog/models/operateLog.js').then(m => { return { namespace: 'operateLog',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__SystemManagement" */'../SystemManagement/LogQuery/OperateLog'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../SystemManagement/LogQuery/OperateLog').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/keyManagement",
        "name": "秘钥管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__KeyManagement__models__keyCreatConfig.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyManagement/models/keyCreatConfig.js').then(m => { return { namespace: 'keyCreatConfig',...m.default}}),
  import(/* webpackChunkName: 'p__KeyManagement__models__keyDownQuery.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyManagement/models/keyDownQuery.js').then(m => { return { namespace: 'keyDownQuery',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__KeyManagement" */'../KeyManagement'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../KeyManagement').default,
        "routes": [
          {
            "path": "/keyManagement/keyCreatConfig",
            "name": "秘钥生成管理",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__KeyManagement__models__keyCreatConfig.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyManagement/models/keyCreatConfig.js').then(m => { return { namespace: 'keyCreatConfig',...m.default}}),
  import(/* webpackChunkName: 'p__KeyManagement__models__keyDownQuery.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyManagement/models/keyDownQuery.js').then(m => { return { namespace: 'keyDownQuery',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__KeyManagement" */'../KeyManagement/keyCreatConfig'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../KeyManagement/keyCreatConfig').default,
            "exact": true
          },
          {
            "path": "/keyManagement/keyDownquery",
            "name": "秘钥下载查询",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__KeyManagement__models__keyCreatConfig.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyManagement/models/keyCreatConfig.js').then(m => { return { namespace: 'keyCreatConfig',...m.default}}),
  import(/* webpackChunkName: 'p__KeyManagement__models__keyDownQuery.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyManagement/models/keyDownQuery.js').then(m => { return { namespace: 'keyDownQuery',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__KeyManagement" */'../KeyManagement/keyDownQuery'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../KeyManagement/keyDownQuery').default,
            "exact": true
          },
          {
            "path": "/keyManagement/keyAuth",
            "name": "应用系统密钥授权",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      app: require('@tmp/dva').getApp(),
models: () => [
  import(/* webpackChunkName: 'p__KeyAuth__models__keyAuth.js' */'/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/pages/KeyAuth/models/keyAuth.js').then(m => { return { namespace: 'keyAuth',...m.default}})
],
      component: () => import(/* webpackChunkName: "p__KeyManagement" */'../KeyAuth'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../KeyAuth').default,
            "exact": true
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/storageSecurityMgr",
        "name": "存储安全管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__storageSecurityMgr" */'../storageSecurityMgr'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../storageSecurityMgr').default,
        "routes": [
          {
            "path": "/storageSecurityMgr/encryptionGroup",
            "name": "加密存储分组管理",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__storageSecurityMgr" */'../storageSecurityMgr/EncryptStorageGroupMgr'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../storageSecurityMgr/EncryptStorageGroupMgr').default,
            "exact": true
          },
          {
            "path": "/storageSecurityMgr/storageKeys",
            "name": "存储密钥管理",
            "routes": [
              {
                "path": "/storageSecurityMgr/storageKeys/encryptionKeys",
                "name": "存储加密新增密钥",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__storageSecurityMgr" */'../storageSecurityMgr/storageKeys/EncryptionKeys'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../storageSecurityMgr/storageKeys/EncryptionKeys').default,
                "exact": true
              },
              {
                "path": "/storageSecurityMgr/storageKeys/keysAuth",
                "name": "存储加密下载授权",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__storageSecurityMgr" */'../storageSecurityMgr/storageKeys/KeysAuth'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../storageSecurityMgr/storageKeys/KeysAuth').default,
                "exact": true
              },
              {
                "path": "/storageSecurityMgr/storageKeys/downloadRecords",
                "name": "存储密钥下载查询",
                "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__storageSecurityMgr" */'../storageSecurityMgr/storageKeys/DownloadQuery'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../storageSecurityMgr/storageKeys/DownloadQuery').default,
                "exact": true
              },
              {
                "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
              }
            ]
          },
          {
            "path": "/storageSecurityMgr/strategy",
            "name": "存储加密策略",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__storageSecurityMgr" */'../storageSecurityMgr/StorageStrategy'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../storageSecurityMgr/StorageStrategy').default,
            "exact": true
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/collectionTransSecurityMgr",
        "name": "采集传输安全管理",
        "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__collectionTransSecurityMgr" */'../collectionTransSecurityMgr'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../collectionTransSecurityMgr').default,
        "routes": [
          {
            "name": "采集传输报备管理",
            "path": "/collectionTransSecurityMgr/report",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__collectionTransSecurityMgr" */'../collectionTransSecurityMgr/CollectionTransReportMgr'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../collectionTransSecurityMgr/CollectionTransReportMgr').default,
            "exact": true
          },
          {
            "name": "采集白名单管理",
            "path": "/collectionTransSecurityMgr/whitelist",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__collectionTransSecurityMgr" */'../collectionTransSecurityMgr/CollectionWhitelistMgr'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../collectionTransSecurityMgr/CollectionWhitelistMgr').default,
            "exact": true
          },
          {
            "name": "Agent配置管理",
            "path": "/collectionTransSecurityMgr/agent",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__collectionTransSecurityMgr" */'../collectionTransSecurityMgr/AgentConfigMgr'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../collectionTransSecurityMgr/AgentConfigMgr').default,
            "exact": true
          },
          {
            "name": "采集鉴权日志查询",
            "path": "/collectionTransSecurityMgr/authenticationLogs",
            "component": __IS_BROWSER
    ? _dvaDynamic({
      
      component: () => import(/* webpackChunkName: "p__collectionTransSecurityMgr" */'../collectionTransSecurityMgr/CollectionAuthenticationLogs'),
      LoadingComponent: require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/src/components/PageLoading/index').default,
    })
    : require('../collectionTransSecurityMgr/CollectionAuthenticationLogs').default,
            "exact": true
          },
          {
            "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
      }
    ]
  },
  {
    "component": () => React.createElement(require('/Users/lipu/Documents/Whale/ZSmartSafeWeb/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
  }
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

// route change handler
function routeChangeHandler(location, action) {
  plugins.applyForEach('onRouteChange', {
    initialValue: {
      routes,
      location,
      action,
    },
  });
}
history.listen(routeChangeHandler);
routeChangeHandler(history.location);

export { routes };

export default function RouterWrapper(props = {}) {
  return (
<RendererWrapper0>
          <Router history={history}>
      { renderRoutes(routes, props) }
    </Router>
        </RendererWrapper0>
  );
}
