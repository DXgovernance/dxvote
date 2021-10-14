import React from 'react'
import { useContext } from 'contexts';
import { Observer } from 'mobx-react-lite'
import { useHistory } from 'react-router-dom';



const CardsProposals = Observer(() => {
  const {
    context: { daoStore, configStore, providerStore },
  } = useContext();
  const history = useHistory();
    return (
        <div>

        </div>
    )
})

export default CardsProposals