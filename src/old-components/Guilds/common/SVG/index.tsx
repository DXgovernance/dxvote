import React from 'react';
import styled from 'styled-components';

export type StyledIconProps = {
  src: React.FC<React.SVGProps<SVGSVGElement>> | string;
  margin?: string;
  size?: number;
};

const StyledIconWrapper = styled.div<StyledIconProps>`
  margin: ${({ margin }) => margin || '0 8px'};
  width: ${({ size }) => size + 'px'};
  height: ${({ size }) => size + 'px'};
  & svg {
    & path {
      fill: currentColor;
    }
  }
`;

const StyledIcon = React.memo((props: StyledIconProps) => {
  const { src, ...rest } = props;
  const Icon = src;

  if (typeof Icon === 'string') {
    return (
      <StyledIconWrapper {...rest}>
        <img src={Icon} />
      </StyledIconWrapper>
    );
  }

  return (
    <StyledIconWrapper {...rest}>
      <Icon />
    </StyledIconWrapper>
  );
});

export default StyledIcon;
