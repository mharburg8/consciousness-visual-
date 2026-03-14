import { useState } from 'react';
import IntroOverlay from './components/IntroOverlay';
import AccessibilityToggle from './components/AccessibilityToggle';
import QualityToggle from './components/QualityToggle';
import TextModeAccordion from './components/TextModeAccordion';
import Scene from './components/Scene';
import InfoPanel from './components/InfoPanel';
import NavigationGuide from './components/NavigationGuide';
import HelpButton from './components/HelpButton';
import TransitionIndicator from './components/TransitionIndicator';
import DepthIndicator from './components/DepthIndicator';
import LayerNav from './components/LayerNav';
import NextLayerButton from './components/NextLayerButton';
import useExplorerStore from './stores/useExplorerStore';
import { useBreakpoint } from './hooks/useBreakpoint';
import './styles/globals.css';

const INTRO_KEY = 'consciousness-sphere-intro-seen';
const PANEL_WIDTH = 420;

function App() {
  const [showIntro, setShowIntro] = useState(
    () => localStorage.getItem(INTRO_KEY) !== 'true'
  );
  const isTextMode    = useExplorerStore((s) => s.isTextMode);
  const selectedLayer = useExplorerStore((s) => s.selectedLayer);
  const bp = useBreakpoint();

  const handleEnter = () => {
    localStorage.setItem(INTRO_KEY, 'true');
    setShowIntro(false);
  };

  const isPanelOpen = selectedLayer !== null;
  const sceneStyle =
    bp === 'desktop' && isPanelOpen
      ? {
          width: `calc(100% - ${PANEL_WIDTH}px)`,
          height: '100%',
          transition: 'width 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        }
      : { width: '100%', height: '100%', transition: 'width 0.5s cubic-bezier(0.32, 0.72, 0, 1)' };

  const hideCornerControls = isPanelOpen && bp !== 'desktop';

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
          <InfoPanel />
          <TransitionIndicator />
          {/* Top-center depth label — shows which sphere you're inside */}
          <DepthIndicator />
          {/* Dissolve current layer button */}
          <NextLayerButton />
          {/* Bottom-center layer jump nav */}
          {!isPanelOpen && <LayerNav getCameraRef={() => null} />}
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
