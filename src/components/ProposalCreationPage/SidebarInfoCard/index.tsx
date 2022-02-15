import styled from 'styled-components';
import SidebarCard, {
  SidebarCardContent,
  SidebarCardHeader,
} from 'components/Guilds/SidebarCard';
import { Flex } from 'components/Guilds/common/Layout';

const Row = styled(Flex)`
  margin-bottom: 0.8rem;
  flex-direction: row;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.body};
  line-height: ${({ theme }) => theme.lineHeights.body};
  color: ${({ theme, color }) => (color ? color : theme.colors.text)};
`;

const SidebarInfoCard = () => {
  // const { guild_id: guildId } =
  //   useParams<{ chain_name?: string; guild_id?: string }>();
  // const { data } = useGuildConfig(guildId);

  // console.log({ data });

  return (
    <SidebarCard header={<SidebarCardHeader>Information</SidebarCardHeader>}>
      <SidebarCardContent>
        <Row>
          <Label>Consensus System</Label>
          <Label>Guild</Label>
        </Row>
        <Row>
          <Label>Proposal Duration</Label>
          <Label>8 days</Label>
        </Row>
        <Row>
          <Label>Quorum</Label>
          <Label>40%</Label>
        </Row>
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default SidebarInfoCard;
