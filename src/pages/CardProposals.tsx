import { observer } from 'mobx-react'
import { useContext } from '../contexts';
import styled from 'styled-components';
import {  Row } from 'components/common';




 const Card = styled.div`
width: 326px;
height: 128px;
background: #FFFFFF;
box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
border-radius: 10px;
text-align: center;
margin: 30px 10px;
flex: ${props => props.size};
`

const Grid = styled.div`

`
const TimeTitle = styled.p`

font-family: Inter;
font-style: normal;
font-weight: 200;
font-size: 11px;
line-height: 13px;

color: #1254FF;
`

const CardTitle = styled.p`

font-family: Inter;
font-style: normal;
font-weight: normal;
font-size: 12px;
line-height: 15px;

color: #000000;
`

const InfoSum = styled.p`
font-family: Inter;
font-style: normal;
font-weight: 600;
font-size: 12px;
line-height: 15px;

color: #000000;
`



const CardProposalView = observer(() => {
  const {
    context: {
      providerStore,
      daoStore,
      configStore,
      daoService,
      ipfsService,
      pinataService,
    },
  } = useContext();
  console.log(
      providerStore,
      daoStore,
      configStore,
      daoService,
      ipfsService,
      pinataService,
  )
  return (
    <Grid>
      <Row>
        <Card size={3}>
          <TimeTitle>Boosted</TimeTitle>
          <CardTitle>Proposal Title</CardTitle>
          <InfoSum>
            Proposal Info Summary Stats
          </InfoSum>
        </Card>
        <Card >
          <TimeTitle>Boosted</TimeTitle>
          <CardTitle>Proposal Title</CardTitle>
          <InfoSum>
            Proposal Info Summary Stats
          </InfoSum>
        </Card>
      </Row>
    </Grid>

  );
})

export default CardProposalView

