import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import DaoInformation from '../components/DaoInformation';
import SchemesInformation from '../components/SchemesInformation';
import ProposalsTable from '../components/ProposalsTable';

const ProposalsPage = () => {
    const searchPath = useLocation().search;
    return (
      <div>
        { searchPath == "?view=dao" ?
          <DaoInformation/>
        : searchPath == "?view=schemes" ?
          <SchemesInformation/>
        : <ProposalsTable/>
        }
      </div>
    );
};

export default ProposalsPage;
