import styled from 'styled-components';

interface ButtonProps {
  size?: number;
  color?: string;
}

const Bullet: React.FC<ButtonProps> = styled.span<{ size: number }>`
  display: inline-flex;
  height: ${props => `${props.size}px`};
  width: ${props => `${props.size}px`};
  background-color: ${({ color, theme }) => color || theme.colors.primary};
  border-radius: 50%;
`;

Bullet.defaultProps = {
  size: 16,
};

export default Bullet;
