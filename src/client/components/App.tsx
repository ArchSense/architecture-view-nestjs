import * as React from 'react';
import useMessage from '@rottitime/react-hook-message-event';
import { useState } from 'react';

const App = () => {
  const [analysis, setAnalysis] = useState({});
  useMessage('analysis', (_, payload) => {
    setAnalysis(payload);
  });
  return <div>{JSON.stringify(analysis)}</div>;
};

export default App;
