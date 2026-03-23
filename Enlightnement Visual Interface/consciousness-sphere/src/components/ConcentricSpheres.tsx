import { layers } from '../data/layers';
import SphereLayer from './SphereLayer';
import CenterGlow from './CenterGlow';
import ThresholdRing from './ThresholdRing';
import ParticleField from './ParticleField';
import BlackHole from './BlackHole';
import VoidCenter from './VoidCenter';

export default function ConcentricSpheres() {
  return (
    <group>
      {layers.map((layer) => (
        <SphereLayer key={layer.id} layer={layer} />
      ))}
      <ThresholdRing />
      <CenterGlow />
      <BlackHole />
      <ParticleField />
      <VoidCenter />
    </group>
  );
}
