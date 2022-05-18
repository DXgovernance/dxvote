import styled from 'styled-components';
import Switch from 'react-switch';

const Wrap = styled.section`
  z-index: 99;
  margin: 10px;
  margin-right: 10px;
`;

const Icon = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 0.6rem;
  color: white;
  padding-right: 2;
`;

export default function Toggle({
  onToggle,
  state,
  optionOne,
  optionTwo,
  width = 120,
  height = 50,
}) {
  return (
    <Wrap>
      <Switch
        checked={state}
        onChange={onToggle}
        height={height}
        width={width}
        offColor="#536DFE"
        onColor="#536DFE"
        uncheckedIcon={<Icon>{optionOne}</Icon>}
        checkedIcon={<Icon>{optionTwo}</Icon>}
      />
    </Wrap>
  );
}
