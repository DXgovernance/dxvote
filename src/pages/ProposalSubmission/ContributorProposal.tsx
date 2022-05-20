// Externals
import { useContext } from '../../contexts';
import useMainnetRep from '../../hooks/useMainnetRep';
import { LevelSelect } from '../../old-components/LevelSelect';
import { Modal } from '../../old-components/Modal';
import { Button } from '../../old-components/common/Button';
import { bnum, normalizeBalance } from '../../utils';
import { useDXDPrice } from 'hooks/ContributorProposal/useDXDPriceForPayment';
import { usePaymentAmounts } from 'hooks/ContributorProposal/usePaymentAmounts';
import { useSubmitProposal } from 'hooks/ContributorProposal/useSubmitProposal';
import { observer } from 'mobx-react';
import moment from 'moment';
import Toggle from 'old-components/Toggle';
import { InputDate } from 'old-components/common';
import PendingCircle from 'old-components/common/PendingCircle';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const VerticalLayout = styled.div`
  display: flex;
  width: 80%;
  height: 79vh;
  margin: auto;
  flex-direction: column;
  flex-wrap: wrap;
`;

const ModalContentWrap = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  margin: 16px 0px;
  padding: 0 50px;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: center;
`;

const NavigationBar = styled.div`
  display: flex;
  width: 100%;
  height: 10vh;
`;

const BackToProposals = styled.div`
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Center = styled.div`
  margin: 5% 0;
  text-align: center;
  width: 60%;
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Spacer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const Values = styled.div`
  margin: 5% 0;
`;
const Value = styled.h2`
  display: flex;
  justify-content: center;
  font-size: xx-large;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  font-size: xx-large;
  align-items: center;
  margin: 1%;
`;
const ButtonContentWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const WarningText = styled.p`
  color: red;
  font-size: smaller;
`;

const TextInput = styled.input`
  width: 280px;
  height: 50px;
  border: 0;
  border-bottom: 1px solid #10161a33;
  margin-right: 5px;
  font-size: xx-large;
  text-align: center;
`;

export const ContributorProposalPage = observer(() => {
  const {
    context: { configStore, providerStore },
  } = useContext();
  const { account } = providerStore.getActiveWeb3React();

  const history = useHistory();

  // UI states
  const [confirm, setConfirm] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  // Modifiers
  const [selectedLevel, setSelectedLevel] = useState(-1);
  const [percentage, setPercentage] = useState(null);
  const [trialPeriod, setTrialPeriod] = useState<boolean>(false);
  const [stableOverride, setStableOverride] = useState<number>(null);
  const [dxdOverride, setDXDOverride] = useState<number>(null);
  const [startDate, setStartDate] = useState<moment.Moment>(moment());
  const [noRep, setNoRep] = useState<boolean>(false);

  const levels = configStore.getContributorLevels();

  const {
    totalSupply,
    isLoading: cacheLoading,
    isStale: isCacheStale,
  } = useMainnetRep(account, 0, moment(startDate).unix());

  const { dxdPrice, loading: dxdLoading } = useDXDPrice(startDate, 30);
  const { dxdAmount, stableAmount, repReward, setDiscount } = usePaymentAmounts(
    confirm,
    dxdPrice,
    dxdOverride,
    stableOverride,
    noRep,
    levels[selectedLevel],
    totalSupply
  );
  const {
    submitProposal,
    loading: submitLoading,
    proposalCreated,
    errorMessage,
  } = useSubmitProposal(
    stableAmount,
    dxdAmount,
    repReward,
    dxdPrice,
    startDate,
    setConfirm,
    levels[selectedLevel]
  );

  useEffect(() => {
    setDiscount(
      (percentage ? parseFloat(percentage) / 100 : 1) * (trialPeriod ? 0.8 : 1)
    );
  }, [trialPeriod, percentage]);

  // Reset stable override when changing level
  useEffect(() => {
    setStableOverride(null);
  }, [selectedLevel]);

  const setStartDateAndDxdOverride = newDate => {
    if (newDate.isSameOrAfter(moment())) setDXDOverride(null);
    setStartDate(newDate);
  };

  const header = <div>Submit worker proposal</div>;

  const ModalContent = () => (
    <ModalContentWrap>
      <b>Payment:</b>
      <Values>${normalizeBalance(stableAmount).toString()}</Values>
      <Values>
        {parseFloat(normalizeBalance(dxdAmount).toString())}
        DXD vested for 3 years and 1 year cliff
      </Values>
      {noRep ? (
        <Values>No REP</Values>
      ) : (
        <Values>{normalizeBalance(bnum(repReward)).toString()} REP</Values>
      )}
    </ModalContentWrap>
  );

  return (
    <VerticalLayout>
      <NavigationBar>
        <BackToProposals
          onClick={() => {
            if (advanced) {
              setAdvanced(false);
            } else {
              history.push('../metadata/contributor');
            }
          }}
        >
          {`< Back`}
        </BackToProposals>
        {!advanced ? (
          <Center>
            <div>
              Select Level
              <LevelSelect
                numberOfLevels={levels.length}
                selected={selectedLevel}
                onSelect={index => {
                  setSelectedLevel(index);
                }}
              />
            </div>
            {selectedLevel >= 0 ? (
              <Values>
                <Value>${normalizeBalance(stableAmount).toString()}</Value>
                <Value>
                  {dxdPrice?.toString() ? (
                    parseFloat(normalizeBalance(dxdAmount).toString()).toFixed(
                      2
                    )
                  ) : (
                    <PendingCircle height="25px" width="25px" color="black" />
                  )}{' '}
                  DXD
                </Value>

                <Value>
                  {noRep
                    ? 0
                    : levels[selectedLevel]?.rep * (trialPeriod ? 0.8 : 1)}
                  % REP
                </Value>
                <InputDate
                  value={startDate}
                  onChange={setStartDateAndDxdOverride}
                  text={'Proposal Start Date:'}
                  width={200}
                />
                {isCacheStale && (
                  <div>
                    <WarningText>
                      REP out of date - switch to mainnet and back, then try
                      again
                    </WarningText>
                  </div>
                )}
              </Values>
            ) : null}
            <ButtonsWrapper>
              <Button
                disabled={
                  selectedLevel < 0 ||
                  proposalCreated ||
                  cacheLoading ||
                  dxdLoading
                }
                onClick={() => setConfirm(true)}
              >
                <ButtonContentWrapper>
                  {proposalCreated
                    ? 'Proposal Submitted'
                    : cacheLoading
                    ? 'Crunching REP Numbers'
                    : dxdLoading
                    ? 'Combing DXD price archives'
                    : 'Submit Proposal'}
                  {submitLoading || cacheLoading || dxdLoading ? (
                    <PendingCircle height="10px" width="10px" />
                  ) : null}
                </ButtonContentWrapper>
              </Button>
            </ButtonsWrapper>
            <WarningText>{errorMessage}</WarningText>
          </Center>
        ) : (
          <Center>
            <InputWrapper>
              <TextInput
                placeholder="Time commitment"
                type="number"
                onChange={event => setPercentage(event.target.value)}
                value={percentage}
              />
              %
            </InputWrapper>
            <Toggle
              onToggle={() => {
                setTrialPeriod(!trialPeriod);
              }}
              state={trialPeriod}
              optionOne={'Full worker'}
              optionTwo={'Trial period'}
            />
            <Toggle
              onToggle={() => {
                setNoRep(!noRep);
              }}
              state={noRep}
              optionOne={'REP'}
              optionTwo={'No REP'}
            />

            <InputWrapper>
              $
              <TextInput
                placeholder="Override Amount"
                type="number"
                onChange={event =>
                  setStableOverride(Number(event.target.value))
                }
                value={stableOverride}
              />
            </InputWrapper>

            <ButtonsWrapper>
              <Button onClick={() => setAdvanced(false)}>Save</Button>
            </ButtonsWrapper>
          </Center>
        )}

        <Spacer>
          <Button onClick={() => setAdvanced(!advanced)}>More options</Button>
        </Spacer>
      </NavigationBar>

      <Modal
        header={header}
        isOpen={confirm}
        onDismiss={() => setConfirm(false)}
        onCancel={() => setConfirm(false)}
        onConfirm={() => submitProposal()}
      >
        <ModalContent />
      </Modal>
    </VerticalLayout>
  );
});
