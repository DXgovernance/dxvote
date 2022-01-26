import styled from 'styled-components';

interface Props {
  icon?: any;
  title: any;
  action?: any;
  isActive?: any;
}

const Item = styled.button`
  background-color: ${props => (props.active ? '#0d0d0d' : 'white')};
  border: none;
  border-radius: 0.4rem;
  color: ${props => (props.active ? 'white' : '#0d0d0d')};
  height: 1.75rem;
  margin-right: 0.25rem;
  padding: 0.25rem;
  width: 1.75rem;
  cursor: pointer;

  &:hover: {
    background-color: #0d0d0d;
    color: white;
  }
`;

// const SVG = styled.svg`
//   fill: currentColor;
//   height: 100%;
//   width: 100%;
// `;

const MenuItem = ({ icon, title, action, isActive = null }: Props) => {
  return (
    <Item active={isActive && isActive()} onClick={action} title={title}>
      {icon}
    </Item>
  );
};
export default MenuItem;
