import styled from 'styled-components';
import { transparentize } from 'polished';
import Link from '../common/Link';

const InfoCard = styled.button<{ active?: boolean; clickable?: boolean }>`
  background-color: ${({ theme, active }) =>
    active ? theme.activeGray : theme.backgroundColor};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;
  : 0 4px 8px 0 ${({ theme, clickable }) =>
    clickable ? transparentize(0.95, theme.shadowColor) : 'none'};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.royalBlue};
  }
  border-color: ${({ theme, active }) =>
    active ? 'transparent' : theme.placeholderGray};
`;

const OptionCard = styled(InfoCard)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
`;

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`;

const OptionCardClickable = styled(OptionCard)`
  margin-top: 0;
  margin-bottom: 0.75rem;
  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    border: ${({ clickable, theme }) =>
      clickable ? `1px solid ${theme.malibuBlue}` : ``};
  }
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`;

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.connectedGreen};
    border-radius: 50%;
  }
`;

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.connectedGreen};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  font-size: 1rem;
  font-weight: 500;
`;

const SubHeader = styled.div`
  color: ${({ theme }) => theme.textColor};
  margin-top: 10px;
  font-size: 12px;
`;

const IconWrapper = styled.div<{ size?: number }>`
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
  subheader = null,
  active = false,
}) {
  const content = (
    <OptionCardClickable
      onClick={onClick}
      clickable={clickable && !active}
      active={active}
    >
      <OptionCardLeft>
        <HeaderText>
          {' '}
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ''
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        {icon && <img src={icon} alt={'Icon'} />}
      </IconWrapper>
    </OptionCardClickable>
  );
  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
