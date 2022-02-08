import React from 'react';
import styled from 'styled-components';

export type StyledIconProps = {
  src: React.FC<React.SVGProps<SVGSVGElement>>;
  margin?: string;
};

const StyledIconWrapper = styled.div<StyledIconProps>`
  margin: ${({ margin }) => margin || '0 8px'};
  & svg {
    & path {
      fill: currentColor;
    }
  }
`;

const StyledIcon = React.memo((props: StyledIconProps) => {
  const { src, ...rest } = props;

  const Icon = src;

  return (
    <StyledIconWrapper {...rest}>
      <Icon />
    </StyledIconWrapper>
  );
});

export default StyledIcon;
