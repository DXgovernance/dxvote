import { observer } from 'mobx-react'
import { useContext } from '../contexts';
import styled from 'styled-components';




const Card = styled.div`
width: 326px;
height: 128px;
position: relative;
background: #FFFFFF;
box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
border-radius: 10px;
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
    <Card>
      Hi this is my first component
    </Card>

  );
})

export default CardProposalView

