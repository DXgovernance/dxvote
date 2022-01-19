import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import useEtherSWR from 'ether-swr';
import { useParams } from 'react-router';
import { useProposal } from 'hooks/Guilds/useProposal';
import { default as ProposalCard } from './';
import { renderWithRoutes, renderWithTheme } from '../../../utils/tests';

jest.mock('hooks/Guilds/useProposal', () => ({
  useProposal: () => ({
    data: {
      title: 'Proposal Title',
      description: 'Proposal Description',
      contentHash: '0x0',
      endTime: { toNumber: () => 3 },
    },
    loading: false,
  }),
}));

jest.mock('react-router', () => ({
  useParams: () => ({
    data: {},
  }),
}));

// it('Testing ProposalCard'
test('renders', async () => {
  renderWithTheme(<ProposalCard id="" href="" />);
  // expect(screen.queryByTestId('avatarNoSrc')).toBeNull();
});

test('renders ProposalCard', async () => {
  renderWithTheme(<ProposalCard id="" href="" />);
  // expect(screen.queryByTestId('avatarSrc')).toBeNull();
});

test('testing Proposal view', () => {
  /*
        useENSAvatar.mockReturnValue({});
        useENS.mockReturnValue({});
        useENSAddress.mockReturnValue({});
        
        // proposal
        useEtherSWR.mockReturnValue({
          loading: false,
          data: {
            contentHash: '0xf856099CDf925b60b4c2cb8AFE9040206BeEAa61',
            creator: '0xf856099CDf925b60b4c2cb8AFE9040206BeEAa61',
            
              {
                type: 'BigNumber',
                hex: '0x61b8f1c9',
              },
              {
                type: 'BigNumber',
                hex: '0x61b8f8d1',
              },
              ['0x0000000000000000000000000000000000000000'],
              ['0x0000000000000000000000000000000000000000000000000000000000000000'],
              [
                {
                  type: 'BigNumber',
                  hex: '0x00',
                },
              ],
              {
                type: 'BigNumber',
                hex: '0x00',
              },
              'Testing first proposal of rinkeby guild',
              '0xe30101701220ef306ec94df934afa2e5d163ce2cdc7ae9b7ccc5ac65a4126df8ad1d80ee310f',
              1,
              [
                {
                  type: 'BigNumber',
                  hex: '0x00',
                },
              ],
            ],
          },
        });
        decodedContentHash = jest.fn();
        useIPFSFile.mockReturnValue({
          description:
            '### Background\n\nIn my previous proposal period, the DXdao development efforts were consolidated to have more focus on Governance and Swapr. As a result, I moved to DXgov team, and have been working on DXvote. As I mentioned in my [reflection on the previous contribution period](https://daotalk.org/t/madusha-contributor-proposal-30-08-2021-31-10-2021/3276/5?u=madusha), the whole DXgov team has quickly adapted, with regular releases and a lot of new features and improvements delivered.\n\n### Proposed Scope of Contribution\n\nMy contributions will align with the DXvote Attack Plan. Right now we’re focusing on getting Phase 1 completed.\n\nGoals:\n\n  * Support Guild MVP development\n  * UI/UX improvements on DXvote\n\nResponsibilities:\n\n  * Collaborate with DXgov members to build and improve our governance products\n  * Keep DXvote development efforts on-track, according to the Attack Plan\n\n### Time commitment\n\nFull-time (40 hours / week)\n\n### Compensation\n\nExperience Level: 3\n\n* $12000 ($6000 * 2) to be sent half on the first payment proposal, and half on the second payment proposal\n* $8000 DXD ($4000 * 2) in a vesting contract continuously for two years with a one year cliff, when the work agreement finishes (31/12/21)\n* 0.3334% REP (0.1667 * 2), to be sent half on the first payment proposal, and half on the second payment proposal\n\n### Work Experience\n\n1. Past Proposals\n\n  * [Contributor Proposal (Trial) - 07/06/2021 - 06/07/2021](https://daotalk.org/t/madusha-prasanjith-worker-proposal-07-06-2021-06-07-2021)\n  * [Contributor Proposal - 27/06/2021 - 26/08/2021](https://daotalk.org/t/madusha-contributor-proposal-27-06-2021-26-08-2021)\n  * [Contributor Proposal - 30/08/2021 - 31/10/2021](https://daotalk.org/t/madusha-contributor-proposal-30-08-2021-31-10-2021/3276)\n\n2. Some notable PRs from the last proposal period\n\n  * [Adding WalletConnect support to DXvote](https://github.com/DXgovernance/dxvote/pull/145)\n  * [Network switching](https://github.com/DXgovernance/dxvote/pull/217)\n  * [IPFS deployment setup](https://github.com/DXgovernance/dxvote/pull/271)\n  * [DXvote loading screen everyone seems to love ](https://github.com/DXgovernance/dxvote/pull/276)\n  * [Fair sale bidding in Aqua](https://github.com/cryptonative-ch/aqua-interface/pull/457)\n\n3. See all contributions on [Github](https://github.com/mprasanjith)\n4. 4 years as a full-stack web developer at Pearson Education\n$6000 \n 5.77 DXD vested for 2 years and 1 year cliff @ $693.77/DXD\n          \n 0.1667% - 2109451978343095080491 REP \n ',
          title:
            'Madusha - Contributor Proposal [01/11/2021 - 31/12/2021] - First Half',
          tags: ['Contributor Proposal', 'Level 3', '', 'Full time worker', 'dxvote'],
          url: '',
        });
      
        const { getAllByText, container } = render(
          <Proposal proposal_id={'0xf856099CDf925b60b4c2cb8AFE9040206BeEAa61'} />
        );
        */
});
