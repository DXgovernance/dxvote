import styled from 'styled-components';
import { Button } from '../../common/Button';
import LiveIndicator from './LiveIndicator';

const OptionButton = styled(Button)`
  width: 100%;

  padding: 0.6rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  margin-bottom: 0.8rem;

  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background} !important;
    color: ${({ theme }) => theme.colors.text} !important;
    outline: 2px solid #ccc;
  }

  &:focus {
    border: 2px solid ${({ theme }) => theme.colors.text};
  }

  ${props => props.active && `border: 2px solid #fff;`};
`;

const OptionButtonText = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
`;

const IconWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

export default function Option({
  link = null,
  clickable = true,
  size = null,
  onClick = null,
  icon,
  header,
  active = false,
}) {
  const content = (
    <OptionButton
      variant="secondary"
      onClick={onClick}
      clickable={clickable && !active}
      active={active}
    >
      <OptionButtonText>
        {active && <LiveIndicator />}
        {header}
      </OptionButtonText>
      <IconWrapper size={size} active={active}>
        {icon && <img src={icon} alt={'Icon'} />}
      </IconWrapper>
    </OptionButton>
  );
  if (link) {
    return <a href={link}>{content}</a>;
  }

  return content;
}
