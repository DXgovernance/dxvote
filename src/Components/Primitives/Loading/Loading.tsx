import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AiOutlineLoading } from 'react-icons/ai';
import Skeleton, {
  SkeletonProps,
  SkeletonStyleProps,
  SkeletonTheme,
} from 'react-loading-skeleton';

const Wrapper = styled.div``;

const SpinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  animation: ${SpinAnimation} 1s cubic-bezier(0.42, 0.8, 0.6, 0.83) infinite;
  width: fit-content;
  margin: 0 auto;
`;

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
}

interface LoadingProps {
  children?: React.ReactNode;
  loading: boolean;
  text?: boolean;
  skeletonProps?: SkeletonProps;
  skeletonStyleProps?: SkeletonStyleProps;
  iconProps?: IconBaseProps;
  style?: object;
}

export const Loading: React.FunctionComponent<LoadingProps> = ({
  children,
  loading,
  iconProps = { size: 40 },
  text = false,
  skeletonProps = { width: '100px', height: '16px', borderRadius: '50px' },
  skeletonStyleProps = { baseColor: '#333', highlightColor: '#555' },
  style = {},
}) => {
  return loading ? (
    <Wrapper style={style}>
      {text ? (
        <SkeletonTheme {...skeletonStyleProps}>
          <Skeleton {...skeletonProps} />
        </SkeletonTheme>
      ) : (
        <Spinner>
          <AiOutlineLoading {...iconProps} />
        </Spinner>
      )}
    </Wrapper>
  ) : (
    <>{children}</>
  );
};
