import styled from 'styled-components';
import { FiArrowRight, FiCircle } from 'react-icons/fi';
import { Box } from '../common/Layout';
import dxIcon from '../../../assets/images/ether.svg';
import ProposalStatus from '../ProposalStatus';
import { isDesktop } from 'react-device-detect';

const CardWrapper = styled(Box)`
  border: 1px solid #000;
  border-radius: 0.3rem;
  margin-bottom: 1rem;
  padding: 1rem;
`;

const CardHeader = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CardContent = styled(Box)`
  margin: 1rem 0;
  font-size: 14px;
  @media only screen and (min-width: 768px) {
    font-size: 1rem;
  }
`;

const CardFooter = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;

  @media only screen and (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const IconDetailWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Detail = styled(Box)`
  font-size: 0.95rem;
  font-weight: 600;
`;

const Icon = styled.img<{
  spaceLeft?: boolean;
  spaceRight?: boolean;
  bordered: boolean;
}>`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.spaceLeft && `margin-left: 0.5rem;`}
  ${props => props.spaceRight && `margin-right: 0.5rem;`}

  ${props =>
    props.bordered &&
    `
    border: 1px solid #000;
    border-radius: 50%;
  `}
`;

const BorderedIconDetailWrapper = styled(IconDetailWrapper)`
  border: 1px solid #000;
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
`;

interface ProposalCardProps {
  title: string;
  description: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ title, description }) => {
  return (
    <CardWrapper>
      <CardHeader>
        <IconDetailWrapper>
          <Icon src={dxIcon} spaceRight />
          <Detail>Swapr von 0x01Cf...2712</Detail>
        </IconDetailWrapper>
        <ProposalStatus status="Active" detail="4 days left" />
      </CardHeader>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <p>{description}</p>
      </CardContent>
      <CardFooter>
        <BorderedIconDetailWrapper>
          <Detail>150 ETH</Detail>
          {isDesktop && (
            <>
              <Icon as="div" spaceLeft spaceRight>
                <FiArrowRight />
              </Icon>{' '}
              <Detail>geronimo.eth</Detail>
            </>
          )}
        </BorderedIconDetailWrapper>
        <BorderedIconDetailWrapper>
          <Detail>15.60%</Detail>
          <Icon as="div" spaceLeft spaceRight>
            <FiCircle />
          </Icon>
          <Detail>5.25%</Detail>
        </BorderedIconDetailWrapper>
      </CardFooter>
    </CardWrapper>
  );
};

export default ProposalCard;
