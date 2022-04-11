import styled, { useTheme } from 'styled-components';
import Switch from 'react-switch';

const StyledSwitch = styled(Switch)`
  border: 1px solid ${({ theme }) => theme.colors.muted};

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.text};
  }

  .react-switch-bg {
    box-sizing: border-box;
  }
`;

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange }) => {
  const theme = useTheme();

  return (
    <StyledSwitch
      checked={value}
      onChange={(checked: boolean) => onChange(checked)}
      uncheckedIcon={false}
      checkedIcon={false}
      height={32}
      width={64}
      borderRadius={32}
      offColor={theme.colors.modalBackground}
      onColor={theme.colors.muted}
      handleDiameter={24}
      activeBoxShadow={`0 0 2px 3px ${theme.colors.muted}`}
    />
  );
};

export default Toggle;
