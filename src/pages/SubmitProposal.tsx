// Externals
import { observer } from 'mobx-react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import NewProposalPage from './ProposalSubmission/Custom';
import { ContributorProposalPage } from './ProposalSubmission/ContributorProposal';

export const SubmitProposalPage = observer(() => {
  let match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/custom`}>
        <NewProposalPage />{' '}
      </Route>
      <Route path={`${match.path}/contributor`}>
        <ContributorProposalPage />{' '}
      </Route>
    </Switch>
  );
});
