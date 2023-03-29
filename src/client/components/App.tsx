import * as React from 'react';
import useMessage from '@rottitime/react-hook-message-event';
import { useEffect, useState } from 'react';
import Scene from './Scene/Scene';
import { getNextLevel, Levels } from '../services/levels';
import { AnalysisResult } from '@archsense/scout';

const App = () => {
  useMessage('analysis', (_, payload) => {
    setAnalysis(payload as AnalysisResult);
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeView, setActiveView] = useState(Levels.Components);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!analysis) {
      return;
    }
    const projects = Object.keys(analysis);
    if (projects.length === 1) {
      setSelectedServiceId(projects[0]);
      setActiveView(Levels.Components);
    }
  }, [analysis]);

  const onNodeEnterHandler = (nodeId: string) => {
    const nextView = getNextLevel(activeView);
    if (!nextView) {
      return;
    }
    if (activeView === Levels.Services) {
      setSelectedServiceId(nodeId);
    }
    setActiveView(nextView);
  };

  const getSceneData = () => {
    switch (activeView) {
      case Levels.Components:
      case Levels.Modules:
        if (selectedServiceId && analysis) {
          return analysis[selectedServiceId].components;
        }
        return {};
      case Levels.Services:
        return analysis;
      default:
        return {};
    }
  };

  return (
    analysis && (
      <Scene
        data={getSceneData()}
        onNodeEnter={onNodeEnterHandler}
        onNodeSelect={console.log}
        onViewChange={setActiveView}
        view={activeView}
      />
    )
  );
};

export default App;
