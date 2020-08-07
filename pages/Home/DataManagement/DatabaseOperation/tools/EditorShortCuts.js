export default function getShortCuts(e) {
  const { keyCode, ctrlKey, shiftKey, altKey } = e;
  if (ctrlKey && !shiftKey && !altKey && keyCode === 70) {
    return 'search';
  }
  if (!ctrlKey && shiftKey && !altKey && keyCode === 13) {
    return 'run';
  }
  if (!ctrlKey && !shiftKey && altKey && keyCode === 67) {
    return 'stop';
  }
  return null;
}
