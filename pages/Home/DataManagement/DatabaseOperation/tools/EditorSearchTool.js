const getCurrentRangeDefault = () => {
  return { id: -1, markerId: -1 };
};

class EditorSearchTool {
  constructor(props) {
    const { editor, dispatchResult } = props;
    this.editor = editor;
    this.searchRanges = [];
    this.currentRange = getCurrentRangeDefault();
    this.currentOccurrence = 0;
    this.dispatchResult = dispatchResult;
    this.caseSensitive = false;
    this.regSensitive = false;
  }

  advancedSearch = searchOpts => {
    const { type, params } = searchOpts;
    if (type === 'markAllOccurrences') {
      this.currentOccurrence = 0;
      this.markAllOccurrences(params);
      if (this.searchRanges.length > 0) {
        this.nextOccurrence();
      }
    } else {
      this[type](params);
    }
  };

  clearSearchSelection = () => {
    const { searchRanges, currentRange } = this;
    for (let i = 0; i < searchRanges.length; ++i) {
      this.editor.session.removeMarker(searchRanges[i].markerId);
    }
    this.searchRanges = [];
    if (currentRange.id !== -1) {
      this.editor.session.removeMarker(currentRange.markerId);
    }
    this.currentRange = getCurrentRangeDefault();
  };

  dispatchOccurrenceResult = (occurrencesCount, currentOccurrence) => {
    if (!currentOccurrence) {
      currentOccurrence = occurrencesCount > 0 ? 1 : 0;
    }
    this.currentOccurrence = currentOccurrence;
    if (this.dispatchResult) {
      this.dispatchResult(occurrencesCount, currentOccurrence);
    }
  };

  markAllOccurrences = params => {
    this.clearSearchSelection();
    const { keyword } = params;
    let { caseSensitive, regSensitive } = params;
    if (caseSensitive === undefined) {
      ({ caseSensitive } = this);
    } else {
      this.caseSensitive = caseSensitive;
    }
    if (regSensitive === undefined) {
      ({ regSensitive } = this);
    } else {
      this.regSensitive = regSensitive;
    }
    if (!keyword) {
      this.dispatchOccurrenceResult(0);
      return false;
    }
    const { editor, searchRanges } = this;
    if (editor.findAll(keyword, {}, undefined, caseSensitive, regSensitive) === 0) {
      this.dispatchOccurrenceResult(0);
      return false;
    }
    const ranges = editor.selection.getAllRanges();
    editor.selection.toSingleRange();
    editor.selection.clearSelection();
    for (let i = 0; i < ranges.length; ++i) {
      const id = editor.session.addMarker(ranges[i], 'ace_selected-word', 'text');
      searchRanges.push({ markerId: id, range: ranges[i] });
    }
    if (searchRanges.length === 0) {
      this.dispatchOccurrenceResult(0);
    }
  };

  nextOccurrence = () => {
    const { searchRanges, currentRange, editor } = this;
    const highlightedRangeExists = currentRange.id !== -1;
    if (highlightedRangeExists) {
      editor.session.removeMarker(currentRange.markerId);
      currentRange.markerId = -1;
    }
    this.currentOccurrence++;
    if (this.currentOccurrence > searchRanges.length) {
      this.currentOccurrence = 1;
    }
    currentRange.id = this.currentOccurrence - 1;
    if (currentRange.id >= searchRanges.length) {
      currentRange.id = -1;
      return false;
    }
    currentRange.markerId = editor.session.addMarker(
      searchRanges[currentRange.id].range,
      'ace_selection',
      'text'
    );
    const {
      range: {
        start: { row },
      },
    } = searchRanges[currentRange.id];
    editor.scrollToRow(row);
    this.dispatchOccurrenceResult(searchRanges.length, this.currentOccurrence);
  };

  prevOccurrence = () => {
    const { searchRanges, currentRange, editor } = this;
    const highlightedRangeExists = currentRange.id !== -1;
    if (highlightedRangeExists) {
      editor.session.removeMarker(currentRange.markerId);
      currentRange.markerId = -1;
    }
    if (currentRange.id === -1) {
      currentRange.id = searchRanges.length;
    }
    currentRange.id--;
    if (currentRange.id === -1) {
      return;
    }
    currentRange.markerId = editor.session.addMarker(
      searchRanges[currentRange.id].range,
      'ace_selection',
      'text'
    );
    const {
      range: {
        start: { row },
      },
    } = searchRanges[currentRange.id];
    editor.scrollToRow(row);
    this.currentOccurrence--;
    if (this.currentOccurrence === 0) {
      this.currentOccurrence = searchRanges.length;
    }
    this.dispatchOccurrenceResult(searchRanges.length, this.currentOccurrence);
  };

  replace = ({ from, to }) => {
    const { editor, currentRange } = this;
    let { searchRanges } = this;
    if (currentRange.id === -1) {
      return;
    }
    editor.session.removeMarker(currentRange.markerId);
    editor.session.replace(searchRanges[currentRange.id].range, to);
    this.markAllOccurrences({ keyword: from });
    ({ searchRanges } = this);
    if (searchRanges.length > 0) {
      this.currentOccurrence--;
      if (this.currentOccurrence < 0) {
        this.currentOccurrence = 0;
      }
      this.nextOccurrence();
    }
  };

  replaceAll = ({ from, to }) => {
    this.clearSearchSelection();
    this.editor.replaceAll(to, { needle: from });
    this.currentOccurrence = 0;
    this.markAllOccurrences({ keyword: from });
    this.nextOccurrence();
  };
}
export default EditorSearchTool;
