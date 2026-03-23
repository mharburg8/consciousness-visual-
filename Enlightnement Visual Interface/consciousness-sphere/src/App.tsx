import { useState } from 'react';
import IntroOverlay from './components/IntroOverlay';
import AccessibilityToggle from './components/AccessibilityToggle';
import QualityToggle from './components/QualityToggle';
import TextModeAccordion from './components/TextModeAccordion';
import Scene from './components/Scene';
import NavigationGuide from './components/NavigationGuide';
import HelpButton from './components/HelpButton';
import TransitionIndicator from './components/TransitionIndicator';
import DepthIndicator from './components/DepthIndicator';
import BottomBar from './components/BottomBar';
import ChartPanel from './components/ChartPanel';
import useExplorerStore from './stores/useExplorerStore';
import { useBreakpoint } from './hooks/useBreakpoint';
import './styles/globals.css';

const INTRO_KEY = 'consciousness-sphere-intro-seen';

function App() {
  const [showIntro, setShowIntro] = useState(
    () => localStorage.getItem(INTRO_KEY) !== 'true'
  );
  const isTextMode = useExplorerStore((s) => s.isTextMode);
  const bp = useBreakpoint();

  const handleEnter = () => {
    localStorage.setItem(INTRO_KEY, 'true');
    setShowIntro(false);
  };

  const sceneStyle = { width: '100%', height: '100%' };
  const hideCornerControls = false;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isTextMode ? (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <TextModeAccordion />
        </div>
      ) : (
        <>
          <div style={sceneStyle}>
            <Scene />
          </div>
          <TransitionIndicator />
          {/* Left: dynamic consciousness chart for active layer */}
          <ChartPanel />
          {/* Top-center: static flat header showing active dimension */}
          <DepthIndicator />
          {/* Bottom: Dissolve button (left) + Jump to Layer (right) on same row */}
          <BottomBar getCameraRef={() => null} />
        </>
      )}

      {!hideCornerControls && (
        <>
          <AccessibilityToggle />
          <QualityToggle />
          <HelpButton />
        </>
      )}

      <NavigationGuide />
      <IntroOverlay visible={showIntro} onEnter={handleEnter} />
    </div>
  );
}

export default App;
