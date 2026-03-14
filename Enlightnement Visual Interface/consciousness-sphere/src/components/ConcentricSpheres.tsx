import { layers } from '../data/layers';
import SphereLayer from './SphereLayer';
import SphereText from './SphereText';
import CenterGlow from './CenterGlow';
import ThresholdRing from './ThresholdRing';
import ParticleField from './ParticleField';

export default function ConcentricSpheres() {
  return (
    <group>
      {layers.map((layer) => (
        <SphereLayer key={layer.id} layer={layer} />
      ))}
      {/* Curved text on each sphere surface — only active sphere shows text */}
      {layers.map((layer) => (
        <SphereText key={`text-${layer.id}`} layer={layer} />
      ))}
      <ThresholdRing />
      <CenterGlow />
      <ParticleField />
    </group>
  );
}
