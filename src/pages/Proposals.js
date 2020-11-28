import React from 'react';
import styled from 'styled-components';
import DaoInformation from '../components/DaoInformation';
import ProposalsTable from '../components/ProposalsTable';

const ProposalsPage = () => {
    return (
      <div>
        <DaoInformation/>
        <ProposalsTable/>
      </div>
    );
};

export default ProposalsPage;
