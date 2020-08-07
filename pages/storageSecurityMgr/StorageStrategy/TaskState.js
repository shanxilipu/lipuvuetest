import React from 'react';
import SquareState from '@/components/SquareState';
import {
  STATES,
  TO_BE_INITIALIZED,
  TO_BE_CUTOVER,
  EXECUTING,
  EXECUTED_FAILED,
  EXECUTED_SUCCESS,
} from './const';

const TaskState = ({ state }) => {
  const text = (STATES.find(o => o.value === state) || {}).label || '';
  const allStatus = {
    [TO_BE_INITIALIZED]: 'cyan',
    [TO_BE_CUTOVER]: 'purple',
    [EXECUTING]: 'processing',
    [EXECUTED_FAILED]: 'error',
    [EXECUTED_SUCCESS]: 'success',
  };
  const status = allStatus[state] || 'error';
  return <SquareState status={status} text={text} />;
};
export default TaskState;
