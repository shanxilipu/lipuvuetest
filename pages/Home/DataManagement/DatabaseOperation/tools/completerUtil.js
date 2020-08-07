import { PROGRAM_WINDOW_KEY } from '../constant';
import { getChildrenInTreeData } from './utils';

const getAllCompletions = (database, allTables) => {
  let completions = allTables.map(o => ({
    value: o.code,
    meta: o.type,
    score: 999,
  }));
  completions.unshift({
    value: database.datasourceName,
    meta: 'DATABASE',
    score: 1000,
  });
  const allFields = [];
  allTables.forEach(table => {
    const { children = [] } = table;
    children.forEach(o =>
      allFields.push({
        value: o.code,
        meta: `${table.code}.COLUMN`,
        score: 998,
      })
    );
  });
  completions = completions.concat(allFields);
  const functions = getChildrenInTreeData(database, 'function');
  functions.forEach(o => {
    completions.push({
      value: o.code,
      meta: o.type,
      score: 997,
    });
  });
  return completions;
};

const getCompleter = ts => {
  return {
    getCompletions: (editor, session, pos, prefix, callback) => {
      const {
        dbOperation: {
          activeWindowKey,
          programWindowEditorComponentId,
          sqlEditTabs,
          activeSqlTabKey,
          treeData,
        },
      } = ts.props;
      let componentId = null;
      if (activeWindowKey === PROGRAM_WINDOW_KEY) {
        componentId = programWindowEditorComponentId;
      } else {
        ({ componentId } = sqlEditTabs.find(tab => tab.editorWindowId === activeSqlTabKey));
      }
      if (!componentId) {
        return;
      }
      if (!editor.isFocused()) {
        return;
      }
      let completions = [];
      const database = treeData.find(o => o.datasourceId === componentId);
      let allTables = getChildrenInTreeData(database, 'table');
      allTables = allTables.concat(getChildrenInTreeData(database, 'view'));
      const allCompletion = getAllCompletions(database, allTables);
      if (allCompletion.length <= 0) {
        callback(null, []);
      }
      if (prefix === '.') {
        const cursorPos = editor.getCursorPosition();
        const line = editor.session.getLine(cursorPos.row);
        let extract = [];
        for (let i = cursorPos.column - 2; i >= 0; i--) {
          if (line[i] === ' ') {
            break;
          }
          extract.push(line[i]);
        }
        if (extract.length) {
          // 获取字段补全
          extract = extract.reverse().join('');
          if (extract === database.datasourceName) {
            allTables.forEach(o => {
              completions.push({
                value: `.${o.code}`,
                meta: o.type,
                caption: o.code,
                score: 9999,
              });
            });
          } else {
            let tableCode = extract;
            const allText = session.getValue();
            const patternString = `(w*)(?:s+as)?s+${extract}\b|,`;
            const tableMatches = allText.match(new RegExp(patternString));
            if (tableMatches && tableMatches.length >= 2) {
              // 有别名
              const matchCode = tableMatches[1]; // 真名
              for (let i = 0; i < allTables.length; i++) {
                if (allTables[i].code === matchCode) {
                  tableCode = matchCode;
                  break;
                }
              }
            }
            let fields = [];
            for (let i = 0; i < allTables.length; i++) {
              if (allTables[i].code === tableCode) {
                fields = allTables[i].children;
                break;
              }
            }
            fields.forEach(field => {
              completions.push({
                value: `.${field.code}`,
                meta: `${tableCode}.COLUMN`,
                caption: field.code,
                score: 9999,
              });
            });
          }
        }
      } else {
        completions = allCompletion;
      }
      callback(null, completions);
    },
    identifierRegexps: [new RegExp('\\.'), new RegExp('[A-Za-z0-9_]')],
  };
};

export default function setCompleters(_this) {
  const langTools = window.ace.require('ace/ext/language_tools');
  langTools.setCompleters([
    getCompleter(_this),
    langTools.keyWordCompleter,
    langTools.snippetCompleter,
    langTools.textCompleter,
  ]);
}
