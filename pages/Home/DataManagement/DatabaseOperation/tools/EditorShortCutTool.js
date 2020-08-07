class EditorShortCutTool {
  constructor(props) {
    const { editor, parentView } = props;
    this.editor = editor;
    this.parentView = parentView;
    this.lastShortcutMark = null;
  }

  handleShortCut = (action, data = {}, shortcutMark) => {
    if (this.lastShortcutMark === shortcutMark) {
      return false;
    }
    this.lastShortcutMark = shortcutMark;
    switch (action) {
      case 'search':
        this.parentView.toggleAdvSearch();
        break;
      case 'paste':
        this.parentView.insert(data.text || '');
        break;
      case 'run':
        this.parentView.handleRun();
        break;
      case 'stop':
        this.parentView.handleStop();
        break;
      default:
        return false;
    }
  };
}
export default EditorShortCutTool;
