import styled from 'styled-components';
import { Button } from '../common/Button';

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
`;

const OptionButtonText = styled.div`
  display: flex;
  align-items: center;
`;

const GreenCircle = styled.span`
  height: 8px;
  width: 8px;
  margin-right: 0.5rem;
  background-color: #4cc7a2;
  border-radius: 50%;
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

export default function WalletOption({
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
      onClick={onClick}
      clickable={clickable && !active}
      active={active}
    >
      <OptionButtonText>
        {active && <GreenCircle />}
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
