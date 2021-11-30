import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
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
} from '../components/common';
import {
  bnum,
  parseCamelCase,
  ZERO_ADDRESS,
  formatCurrency,
  formatBalance,
} from '../utils';
import { NETWORK_ASSET_SYMBOL } from '../utils';
import useExporters from '../hooks/useExporters';
import { Button } from './common/Button';
import { flatten } from '../utils/array';
import moment from 'moment';

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

  const daoInfo = daoStore.getDaoInfo();
  const schemes = daoStore.getAllSchemes();
  const prices = coingeckoService.getPrices();
  const networkAssetSymbol =
    NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];
  let assets = {
    total: [
      {
        address: ZERO_ADDRESS,
        name: networkAssetSymbol,
        amount: bnum(daoInfo.ethBalance),
        decimals: 18,
      },
    ],
    avatar: [
      {
        address: ZERO_ADDRESS,
        name: networkAssetSymbol,
        amount: bnum(daoInfo.ethBalance),
        decimals: 18,
      },
    ],
  };
  Object.keys(daoInfo.tokenBalances).map(tokenAddress => {
    const tokenData = configStore.getTokenData(tokenAddress);
    if (!tokenData) return;

    assets.avatar.push({
      address: tokenAddress,
      name: tokenData.name,
      amount: bnum(daoInfo.tokenBalances[tokenAddress]),
      decimals: tokenData.decimals,
    });
    assets.total.push({
      address: tokenAddress,
      name: tokenData.name,
      amount: bnum(daoInfo.tokenBalances[tokenAddress]),
      decimals: tokenData.decimals,
    });
  });

  schemes.map(scheme => {
    if (scheme.controllerAddress !== ZERO_ADDRESS) return;

    const tokenBalances = scheme.tokenBalances;
    if (!assets[scheme.name])
      assets[scheme.name] = [
        {
          address: ZERO_ADDRESS,
          name: networkAssetSymbol,
          amount: bnum(scheme.ethBalance),
          decimals: 18,
        },
      ];

    Object.keys(tokenBalances).map(tokenAddress => {
      const tokenData = configStore.getTokenData(tokenAddress);
      if (!tokenData) return;

      assets[scheme.name].push({
        address: tokenAddress,
        name: tokenData.name,
        amount: bnum(tokenBalances[tokenAddress]),
        decimals: tokenData.decimals,
      });
      const indexOfAssetInTotal = assets.total.findIndex(
        asset => asset.address === tokenAddress
      );
      if (indexOfAssetInTotal > -1) {
        assets.total[indexOfAssetInTotal].amount = assets.total[
          indexOfAssetInTotal
        ].amount.plus(bnum(tokenBalances[tokenAddress]));
      } else {
        assets.total.push({
          address: tokenAddress,
          name: tokenData.name,
          amount: bnum(tokenBalances[tokenAddress]),
          decimals: tokenData.decimals,
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
