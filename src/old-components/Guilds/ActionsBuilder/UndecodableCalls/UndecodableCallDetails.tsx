import { MetadataTag } from '../SupportedActions/common/infoLine';
import { DetailRow } from '../SupportedActions/common/summary';
import { Call } from '../types';
import { BigNumber } from 'ethers';
import { Box } from 'old-components/Guilds/common/Layout';
import UnstyledLink from 'old-components/Guilds/common/UnstyledLink';
import { FiExternalLink } from 'react-icons/fi';
import styled, { useTheme } from 'styled-components';

const ParamTitleRow = styled(DetailRow)`
  margin-bottom: 0.75rem;
`;

const ParamTitleTag = styled(MetadataTag)`
  display: inline-block;
  padding: 0.375rem 0.5rem;
  color: ${({ color }) => color};
`;

const ActionParamRow = styled(Box)`
  margin-bottom: 1.5rem;
`;

const ParamDetail = styled(Box)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  overflow-wrap: break-word;
`;

const UndecodableCallDetails: React.FC<{ call: Call }> = ({ call }) => {
  const theme = useTheme();

  function renderByCallData(key: string, value: any) {
    if (!key || !value) return null;

    if (key === 'to' || key === 'from') {
      return (
        <UnstyledLink href="#">
          <ParamDetail>
            {value} <FiExternalLink size={16} />
          </ParamDetail>
        </UnstyledLink>
      );
    }

    if (key === 'value') {
      return <ParamDetail>{BigNumber.from(value).toString()}</ParamDetail>;
    }

    return <ParamDetail>{value}</ParamDetail>;
  }

  return (
    <>
      {Object.entries(call)?.map(([key, value], index) => (
        <ActionParamRow key={index}>
          <ParamTitleRow>
            <ParamTitleTag color={theme?.colors?.params?.[index]}>
              {key}
            </ParamTitleTag>
          </ParamTitleRow>

          {renderByCallData(key, value)}
        </ActionParamRow>
      ))}
    </>
  );
};

export default UndecodableCallDetails;
