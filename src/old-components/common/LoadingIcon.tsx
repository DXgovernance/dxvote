import styled, { keyframes } from 'styled-components';
import DXdaoIcon from '../../assets/images/dxdao-icon.svg';

const pulseKeyframes = keyframes`
  from {
    stroke-width: 3px;
    stroke-opacity: 1;
    transform: scale(0.8);
  }
  to {
    stroke-width: 0;
    stroke-opacity: 0;
    transform: scale(2);
  }
`;

const RotatingImage = styled.image`
  filter: ${props => (props.inactive ? 'grayscale(100%)' : 'none')};
`;

const PulseCircle = styled.circle`
  stroke: #4f6afe;
  stroke-width: 2px;
  stroke-opacity: 1;

  fill: white;
  fill-opacity: 0;
  transform-origin: 50% 50%;
  animation-duration: 1.5s;
  animation-name: ${pulseKeyframes};
  animation-iteration-count: infinite;
`;

const PulsingIcon: React.FC<{ size: number; inactive: boolean }> = ({
  size,
  inactive,
}) => (
  <svg className="button" aria-expanded height={size} width={size}>
    <RotatingImage
      inactive={inactive}
      x="50%"
      y="50%"
      width={size / 2}
      height={size / 2}
      transform={`translate(-${size / 4}, -${size / 4})`}
      href={DXdaoIcon}
    />
    {!inactive && <PulseCircle cx="50%" cy="50%" r={size / 4} />}

    {!inactive && (
      <animateTransform
        attributeName="transform"
        attributeType="xml"
        type="rotate"
        from="360"
        to="0"
        dur="1.5s"
        additive="sum"
        repeatCount="indefinite"
      />
    )}
  </svg>
);

export default PulsingIcon;
