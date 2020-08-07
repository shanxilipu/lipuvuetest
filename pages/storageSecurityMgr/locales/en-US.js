export default {
  'storage.encrypt.group': 'Storage Encrypted Groups',
  'datasource.code': 'Datasource Code',
  'datasource.ip.hostname': 'Datasource IP/Hostname',
  'datasource.port': 'Datasource Port',
  'storage.encrypt.group.new': 'New group',
  'storage.encrypt.group.modify': 'Edit group',
  'storage.encrypt.group.selected': 'Selected group: ',
  'storage.encrypt.group.add.tips':
    'If the encryption storage policy has been defined, before joining the group, you need to obtain the cutover script to perform the cutover (except for the empty database). After the cutover is completed, the group can be added',
  'storage.encrypt.unGroupedDatasource': 'Ungrouped datasources',
  'storage.encrypt.groupedDatasource': 'Grouped datasources',
  'storage.encrypt.viewCutoverScript': 'Cutover scripts',
  'storage.encrypt.cutoverScript': 'Cutover scripts',
  'storage.encrypt.noGroupSelected': 'No group selected',
  'storage.encrypt.confirmCutoverComplete': 'Confirm whether the cutover is completed?',
  'storage.encrypt.confirmDatasourceNoUse':
    'Confirm whether the datasource is no longer used. There is a risk that the encrypted data cannot be decrypted',
  'storage.encrypt.cutoverScript.save': 'Save cutover scripts',
  'storage.encrypt.groupName': 'Group Name',
  'encrypt.key.new': 'New Key',
  'storage.encrypt.selectDatasource': 'Please select a datasource',
  'encrypt.key.length': 'Key Length',
  'encrypt.key.tips1':
    'Four steps to modify the key: 1. Generate a new key and save the cutover plan; 2. Shut down and cutover offline; 3. Save the modified key; 4. Start the application',
  'encrypt.key.location': 'Location',
  'encrypt.key.info': 'Key Information',
  'encrypt.key.modify': 'Modify Key',
  'encrypt.key.checkModifiedKey': 'View Key Modification',
  'storage.encrypt.cutoverPlan.save': 'Save cutover plan',
  'storage.encrypt.cutoverPlan.generate': 'Generate cutover plan',
  'storage.encrypt.addAuth': 'Add Authorization',
  'storage.encrypt.editAuth': 'Edit Authorization',
  'storage.encrypt.isEnable': 'Enable',
  'storage.encrypt.download.success': 'Success',
  'storage.encrypt.download.abnormal': 'Abnormal',
  'storage.encrypt.download.timeout': 'Expired',
  'storage.encrypt.download.nottime': 'Un-effected',
  'storage,group': 'Group',
  'storage.strategy.toBeInitialized': 'Un-initialized',
  'storage.strategy.toBeCutover': 'Un-cutover',
  'storage.strategy.executing': 'Executing',
  'storage.strategy.executedFail': 'Failed',
  'storage.strategy.executedSuccess': 'Success',
  'storage.strategy.tips1':
    'If the task contains Hive manual cutover task, please check and confirm to complete initialization task after cutover',
  'storage.encrypt.groupCode': 'Group Code',
  'storage.strategy.initializeState': 'Initialization State',
  'storage.strategy.addTitle': 'New encryption storage strategy',
  'storage.strategy.tips2':
    'Please select the time when the system is relatively free to initialize. If it is unable to encrypt and the unencrypted data is mixed, please stop the application and use the cutover script',
  'storage.strategy.tips3': 'Please select the table containing sensitive data from the group',
  'storage.strategy.encryptionAnalysis': 'Encryption analysis',
  'storage.strategy.sameNameFieldCodeTables': 'Tables containing fields with the same name',
  'storage.strategy.submitInitTask': 'Submit initialization task',
  'storage.strategy.initialTime': 'Initialization Time',
  'storage.strategy.sameKeyFieldTips':
    'To use the same key as other fields in library, please select',
  'storage.strategy.selectField': 'Select a field',
  'storage.strategy.tableNoKeyError': 'The current table does not have a key configured',
  'storage.strategy.savePlan': 'Save plan',
  'storage.strategy.checkTitle': 'Check encryption storage strategy',
  'storage.strategy.finishInitialization': 'Finish initialization',
  'storage.encrypt.getUsersFailed': 'Fail to load users',
};
