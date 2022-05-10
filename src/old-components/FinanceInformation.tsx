import { useContext } from '../contexts';
import useExporters from '../hooks/useExporters';
import {
  bnum,
  parseCamelCase,
  ZERO_ADDRESS,
  formatCurrency,
  formatBalance,
} from '../utils';
import { NETWORK_ASSET_SYMBOL } from '../utils';
import { flatten } from '../utils/array';
import {
  BlockchainLink,
  Subtitle,
  Row,
  Table,
  TableHeader,
  HeaderCell,
  TableBody,
  TableRow,
  DataCell,
} from './common';
import { Button } from './common/Button';
import { useBalance } from 'hooks/useERC20';
import { useETHBalance } from 'hooks/useETHBalance';
import { observer } from 'mobx-react';
import moment from 'moment';
import styled from 'styled-components';

const FinanceInfoWrapper = styled.div`
  background: white;
  padding: 0px 10px;
  font-weight: 400;
  border-radius: 4px;
  justify-content: center;
  color: var(--dark-text-gray);
`;

const FinanceTable = styled(Table)`
  grid-template-columns: 33% 33% 33%;
`;

const CenteredRow = styled(Row)`
  justify-content: center;
  align-items: center;
  padding: 0;
`;

const ExportRow = styled(CenteredRow)`
  margin-top: 20px;
`;

const FinanceInformation = observer(() => {
  const {
    context: { daoStore, configStore, coingeckoService },
  } = useContext();
  const { exportToCSV, triggerDownload } = useExporters();

  const schemes = daoStore.getAllSchemes();
  const prices = coingeckoService.getPrices();
  const networkAssetSymbol =
    NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];

  const networkContracts = configStore.getNetworkContracts();
  const tokens = configStore.getTokensToFetchPrice();

  let assets = {
    total: [
      {
        address: ZERO_ADDRESS,
        name: networkAssetSymbol,
        amount: useETHBalance(networkContracts.avatar),
        decimals: 18,
      },
    ],
    avatar: [
      {
        address: ZERO_ADDRESS,
        name: networkAssetSymbol,
        amount: useETHBalance(networkContracts.avatar),
        decimals: 18,
      },
    ],
  };
  tokens.map(token => {
    assets.avatar.push({
      address: token.address,
      name: token.name,
      amount: useBalance(networkContracts.avatar, token.address),
      decimals: token.decimals,
    });
    assets.total.push({
      address: token.address,
      name: token.name,
      amount: useBalance(networkContracts.avatar, token.address),
      decimals: token.decimals,
    });
  });

  schemes.map(scheme => {
    if (scheme.controllerAddress !== ZERO_ADDRESS) return;

    if (!assets[scheme.name])
      assets[scheme.name] = [
        {
          address: ZERO_ADDRESS,
          name: networkAssetSymbol,
          amount: useETHBalance(scheme.address),
          decimals: 18,
        },
      ];

    tokens.map(token => {
      assets[scheme.name].push({
        address: token.address,
        name: token.name,
        amount: useBalance(scheme.address, token.address),
        decimals: token.decimals,
      });
      const indexOfAssetInTotal = assets.total.findIndex(
        asset => asset.address === token.address
      );
      if (indexOfAssetInTotal > -1) {
        assets.total[indexOfAssetInTotal].amount = assets.total[
          indexOfAssetInTotal
        ].amount.plus(useBalance(scheme.address, token.address));
      } else {
        assets.total.push({
          address: token.address,
          name: token.name,
          amount: useBalance(scheme.address, token.address),
          decimals: token.decimals,
        });
      }
    });
  });

  const getExportFileName = () => {
    return `finances-${moment().format('YYYY-MM-DD')}`;
  };

  const exportData = async () => {
    const allAssets = Object.keys(assets).map(assetHolder => {
      const assetsOfHolder = assets[assetHolder];
      const assetsExportable = assetsOfHolder.map(asset => ({
        name: asset.name,
        address: asset.address,
        holder: parseCamelCase(assetHolder),
        balance: formatBalance(asset.amount, asset.decimals, 2).toString(),
        usdPrice:
          prices[asset.address] && prices[asset.address].usd
            ? Number(formatBalance(asset.amount, asset.decimals, 2)) *
              prices[asset.address].usd
            : null,
      }));
      return assetsExportable;
    });
    const assetsExportable = flatten(allAssets);
    const csvString = await exportToCSV(assetsExportable);

    triggerDownload(csvString, `${getExportFileName()}.csv`, 'text/csv');
  };

  return (
    <FinanceInfoWrapper>
      {Object.keys(assets).map(assetHolder => {
        const assetsOfHolder = assets[assetHolder];
        return (
          <div>
            <Subtitle centered> {parseCamelCase(assetHolder)} </Subtitle>
            <FinanceTable>
              <TableHeader>
                <HeaderCell>Asset</HeaderCell>
                <HeaderCell align="center">Balance</HeaderCell>
                <HeaderCell align="center">USD Value</HeaderCell>
              </TableHeader>
              <TableBody>
                {assetsOfHolder.map((asset, i) => {
                  if (
                    asset &&
                    Number(formatBalance(asset.amount, asset.decimals, 2)) > 0
                  ) {
                    return (
                      <TableRow key={`asset${i}`}>
                        <DataCell align="left" weight="500">
                          <CenteredRow>
                            {asset.name}{' '}
                            {asset.address != ZERO_ADDRESS && (
                              <BlockchainLink
                                size="long"
                                type="address"
                                text={asset.address}
                                onlyIcon
                                toCopy
                              />
                            )}
                          </CenteredRow>
                        </DataCell>
                        <DataCell align="center">
                          {formatBalance(
                            asset.amount,
                            asset.decimals,
                            2
                          ).toString()}
                        </DataCell>
                        <DataCell align="center">
                          {prices[asset.address] && prices[asset.address].usd
                            ? formatCurrency(
                                bnum(
                                  Number(
                                    formatBalance(
                                      asset.amount,
                                      asset.decimals,
                                      2
                                    )
                                  ) * prices[asset.address].usd
                                )
                              )
                            : '-'}
                        </DataCell>
                      </TableRow>
                    );
                  } else return <></>;
                })}
              </TableBody>
            </FinanceTable>
          </div>
        );
      })}

      <ExportRow>
        <Button onClick={exportData}>Export to CSV</Button>
      </ExportRow>
    </FinanceInfoWrapper>
  );
});

export default FinanceInformation;
