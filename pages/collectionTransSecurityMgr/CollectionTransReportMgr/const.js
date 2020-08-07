export const APPROVAL_STATES = [
  {
    value: 'PASS',
    label: '通过报备' ,
  },
  {
    value: 'REJECT',
    label:  '拒绝报备' ,
  },
  {
    value: 'SUBMITTED',
    label:  '已提交报备' ,
  },
  {
    value: 'WAIT_SUBMIT',
    label: '待提交报备' ,
  },
  {
    value: 'REJECT_SUBMIT',
    label: '拒绝' ,
  },
];

export const DATASOURCE_TAPE = [
  { value: 'ssh', label: 'ssh' },
  { value: 'oracle', label: 'oracle' },
  { value: 'mysql', label: 'mysql' },
  { value: 'hive', label: 'hive' },
  { value: 'hbase', label: 'hbase' },
  { value: 'ftp', label: 'ftp' },
  { value: 'hdfs', label: 'hdfs' },
  { value: 'kafka', label: 'kafka' },
  { value: 'gp', label: 'gp' },
  { value: 'db2', label: 'db2' },
  { value: 'mapreduce', label: 'mapreduce' },
  { value: 'spark', label: 'spark' },
  { value: 'hawq', label: 'hawq' },
  { value: 'rds', label: 'rds' },
  { value: 'drds', label: 'drds' },
  { value: 'restful', label: 'restful' },
  { value: 'mongodb', label: 'mongodb' },
  { value: 'redis', label: 'redis' },
  { value: 'es', label: 'es' },
  { value: 'analyticdb', label: 'analyticdb' },
  { value: 'telnet', label: 'telnet' },
  { value: 'postgresql', label: 'postgresql' },
  { value: 'sqlserver', label: 'sqlserver' },
];

export const TRANS_PROTOCOL = [
  { value: 'jdbc', label: 'jdbc' },
  { value: 'http', label: 'http' },
  { value: 'https', label: 'https' },
  { value: 'ftp', label: 'ftp' },
  { value: 'sftp', label: 'sftp' },
  { value: 'rpc', label: 'rpc' },
  { value: 'socket', label: 'socket' },
  { value: 'odbc', label: 'odbc' },
];

export const TRANSFER_FORM = [
  { value: 'file', label: 'file' },
  { value: 'interface', label: 'interface' },
];
