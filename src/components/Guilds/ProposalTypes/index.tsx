import { AiOutlinePlus } from 'react-icons/ai';
import { ImPencil } from 'react-icons/im';
import { MdCreditCard } from 'react-icons/md';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';

const Container = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  width: 386px;
  padding: 24px;
  margin: 10px 0;
`;

const ProposalTypeButton = styled(Button)`
  width: 90%;
  margin: 6px 0;
`;

const Header = styled(Flex)`
  width: 90%;
  justify-content: initial;
  flex-direction: row;
  margin: 6px 0;
`;


const ProposalTypeDescription: React.FC = () => {
    return (
        <Container>
            <ContainerText variant='bold'>
                Signal Proposal
            </ContainerText>
            <ContainerText variant='medium'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam,
                blandit eu sapien eu, commodo dapibus nisl.
            </ContainerText>
            <ContainerText variant='medium' color='grey'>
                No on-chain action
            </ContainerText>
        </Container>
    );
};
const ProposalTypes: React.FC = () => {
    //@TODO import the SVG images of icons
    // @TODO create text box CSS
    return (
        <Flex>
            <Container>
                <Header>Choose Proposal Type</Header>
                <ProposalTypeButton>Signal</ProposalTypeButton>
                <ProposalTypeButton>
                    Transfer Funds
                </ProposalTypeButton>
                <ProposalTypeButton>
                    <MdCreditCard />
                    Contributer Payment
                </ProposalTypeButton>
                <ProposalTypeButton>
                    <AiOutlinePlus />
                    Mint Reputation
                </ProposalTypeButton>
                <ProposalTypeButton>
                    <ImPencil />
                    Custom Proposal
                </ProposalTypeButton>
            </Container>
            <ProposalTypeDescription />
        </Flex>
    );
};

export default ProposalTypes;
