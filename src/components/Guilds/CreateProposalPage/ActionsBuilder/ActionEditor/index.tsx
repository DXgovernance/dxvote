import styled from 'styled-components';
import { CardWrapper, Header } from 'components/Guilds/common/Card';
import { Box } from 'components/Guilds/common/Layout';
import { Input, BaseInput } from 'components/Guilds/common/Form/Input';
import AddButton from '../AddButton';
import { FiChevronDown, FiMoreHorizontal, FiX } from 'react-icons/fi';
import { Button } from 'components/Guilds/common/Button';

const CardWrapperWithMargin = styled(CardWrapper)`
  margin: 0.8rem 0;
`;

const HeaderWrapper = styled(Header)`
  display: flex;
  align-items: center;
  margin: 0.875rem;
`;

const IconWrapper = styled.span`
  display: flex;
  margin-right: 0.875rem;
`;

const TitleWrapper = styled(Box)`
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const DetailWrapper = styled(Box)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

const FooterWrapper = styled(DetailWrapper)`
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem 1.25rem;
`;

const Control = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0.75rem 0;
  width: 100%;
`;

const ControlLabel = styled(Box)`
  margin-bottom: 0.75rem;
`;

const ControlRow = styled(Box)`
  display: flex;
  align-items: stretch;
  height: 100%;
`;

const Spacer = styled(Box)`
  margin-right: 1rem;
`;

const MenuButton = styled(Button).attrs(() => ({
  variant: 'secondary',
}))`
  border-radius: 50%;
  height: 2.7rem;
  width: 2.7rem;
  padding: 0;
  margin: 0;
`;

interface ActionEditorProps {
  icon?: React.ReactElement;
  title: string;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ title, icon }) => {
  return (
    <CardWrapperWithMargin>
      <HeaderWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <TitleWrapper>{title}</TitleWrapper>
      </HeaderWrapper>

      <DetailWrapper>
        <Control>
          <ControlLabel>Recipient</ControlLabel>
          <ControlRow>
            <Input
              icon={
                <img
                  src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png"
                  alt="Ethereum"
                  height="24"
                />
              }
              iconRight={<FiX size={24} />}
              placeholder="Ethereum address"
            />
            <Spacer />
            <div>
              <MenuButton>
                <FiMoreHorizontal size={24} />
              </MenuButton>
            </div>
          </ControlRow>
        </Control>

        <ControlRow>
          <Control>
            <ControlLabel>Asset</ControlLabel>
            <ControlRow>
              <Input
                icon={
                  <img
                    src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png"
                    alt="Ethereum"
                    height="24"
                  />
                }
                iconRight={<FiChevronDown size={24} />}
              />
            </ControlRow>
          </Control>

          <Spacer />

          <Control>
            <ControlLabel>Amount</ControlLabel>
            <ControlRow>
              <BaseInput />
              <Spacer />
              <div>
                <MenuButton>
                  <FiMoreHorizontal size={24} />
                </MenuButton>
              </div>
            </ControlRow>
          </Control>
        </ControlRow>
      </DetailWrapper>

      <FooterWrapper>
        <AddButton label="Add Recipient" />
      </FooterWrapper>
    </CardWrapperWithMargin>
  );
};

export default ActionEditor;
