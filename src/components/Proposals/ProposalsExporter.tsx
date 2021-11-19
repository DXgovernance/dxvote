import moment, { Moment } from 'moment';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useContext } from '../../contexts';
import useExporters from '../../hooks/useExporters';
import { useProposals } from '../../hooks/useProposals';
import { getChains } from '../../provider/connectors';
import {
  VotingMachineProposalState,
  WalletSchemeProposalState,
} from '../../utils';
import { Button, InputDate } from '../common';
import { Modal } from '../Modal';
import Toggle from '../Toggle';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  padding: 0 24px;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: center;
  min-height: 450px;
`;

const WrapperRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExportButtonsRow = styled(WrapperRow)`
  margin-top: 50px;
`;

interface ProposalExportRow {
  id: string;
  title: string;
  proposer: string;
  status: string;
  schemeName: string;
  schemeAddress: string;
  submittedAt: string;
  boostedAt: string;
  finishedAt: string;
  stateInVotingMachine: string;
  stateInScheme: string;
}

const ProposalsExporter = () => {
  const {
    context: { daoStore },
  } = useContext();
  const { proposals } = useProposals();
  const location = useLocation();
  const { exportToCSV, triggerDownload } = useExporters<ProposalExportRow>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDateRange, setIsDateRange] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Moment>(
    moment().subtract(1, 'week')
  );
  const [endDate, setEndDate] = useState<Moment>(moment());

  const getExportFileName = () => {
    if (isDateRange) {
      return `proposals_${startDate.format('YYYY-MM-DD')}-to-${endDate.format(
        'YYYY-MM-DD'
      )}`;
    } else {
      return `proposals_all-${moment().format('YYYY-MM-DD')}`;
    }
  };

  const getFilteredProposalsList = async () => {
    let filteredProposals = proposals;
    if (isDateRange) {
      filteredProposals = filteredProposals.filter(
        proposal =>
          moment
            .unix(proposal.creationEvent.timestamp)
            .isSameOrAfter(startDate) &&
          moment.unix(proposal.creationEvent.timestamp).isSameOrBefore(endDate)
      );
    }

    return filteredProposals;
  };

  const triggerCSVExport = async () => {
    let exportName = getExportFileName();
    let filteredProposals = await getFilteredProposalsList();

    const extractedData: ProposalExportRow[] = filteredProposals.map(
      proposal => {
        const scheme = daoStore.getScheme(proposal.scheme);

        return {
          id: proposal.id,
          title: proposal.title,
          proposer: proposal.proposer,
          status: proposal.status,
          schemeName: scheme.name,
          schemeAddress: scheme.address,
          submittedAt: moment.unix(proposal.submittedTime.toNumber()).format(),
          boostedAt: moment.unix(proposal.boostTime.toNumber()).format(),
          finishedAt: moment.unix(proposal.finishTime.toNumber()).format(),
          stateInVotingMachine:
            VotingMachineProposalState[proposal.stateInVotingMachine],
          stateInScheme: WalletSchemeProposalState[proposal.stateInScheme],
        };
      }
    );

    const csvString = await exportToCSV(extractedData);

    triggerDownload(csvString, `${exportName}.csv`, 'text/csv');
  };

  const copyAsMarkdown = async () => {
    let filteredProposals = await getFilteredProposalsList();
    const urlNetworkName = location.pathname.split('/')[1];

    const chainName =
      getChains().find(chain => chain.name == urlNetworkName)?.name || null;

    let markdown = `**${chainName}**\n\n`;
    filteredProposals.map(proposal => {
      markdown += `- [${proposal.title}](${window.location.origin}/#/${urlNetworkName}/proposal/${proposal.id})\n`;
    });

    await navigator.clipboard.writeText(markdown);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Export...</Button>
      <Modal
        header={<div>Export proposals</div>}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
      >
        <Wrapper>
          <div>I want to export</div>
          <Toggle
            onToggle={() => setIsDateRange(!isDateRange)}
            state={isDateRange}
            optionTwo={'Date Range'}
            optionOne={'Everything'}
          />

          {isDateRange && (
            <WrapperRow>
              <InputDate
                value={startDate}
                onChange={(date: Moment) => {
                  setStartDate(date.startOf('day'));
                }}
                text={'Start Date'}
                width={150}
                isValidDate={(date: Moment) =>
                  date.isBefore(endDate) && date.isBefore(moment())
                }
              />
              <InputDate
                value={endDate}
                onChange={(date: Moment) => {
                  setEndDate(date.endOf('day'));
                }}
                text={'End Date'}
                width={150}
                isValidDate={(date: Moment) =>
                  date.isAfter(startDate) && date.isBefore(moment())
                }
              />
            </WrapperRow>
          )}

          <ExportButtonsRow>
            <Button onClick={triggerCSVExport}>Export to CSV</Button>
            <Button onClick={copyAsMarkdown}>Copy Titles as Markdown</Button>
          </ExportButtonsRow>
        </Wrapper>
      </Modal>
    </>
  );
};

export default ProposalsExporter;
