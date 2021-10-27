import { observer } from 'mobx-react'
import { useContext } from '../contexts';


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
    <div>
      Hi this is my first component
    </div>

  );
})

export default CardProposalView

