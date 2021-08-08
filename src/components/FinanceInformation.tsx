import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import BlockchainLink from '../components/common/BlockchainLink';
import { bnum, parseCamelCase, ZERO_ADDRESS, formatCurrency, formatBalance } from '../utils';
import { NETWORK_ASSET_SYMBOL } from '../provider/connectors';
import { getTokenData } from '../config';

const FinanceInfoWrapper = styled.div`
    background: white;
    padding: 0px 10px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: row;
    color: var(--dark-text-gray);
    flex-wrap: wrap;
`;

const FinanceTableHeaderWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--light-text-gray);
    padding: 20px 40px 8px 24px;
    font-size: 14px;
    text-align: center;
`;

const TableHeader = styled.div`
    width: ${(props) => props.width};
    text-align: ${(props) => props.align};
`;

const TableRowsWrapper = styled.div`
    overflow-y: scroll;
`;

const TableRow = styled.div`
    font-size: 16px;
    line-height: 18px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid var(--line-gray);
    padding: 16px 24px;
    color: var(--dark-text-gray);
    text-align: right;
    cursor: pointer;
`;

const TableCell = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${(props) => props.align};;
    color: ${(props) => props.color};
    width: ${(props) => props.width};
    font-weight: ${(props) => props.weight};
    white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
    overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
    text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const FinanceInformation = observer(() => {
    const {
        context: { daoStore, configStore, coingeckoService },
    } = useContext();

    const daoInfo = daoStore.getDaoInfo();
    const schemes = daoStore.getAllSchemes();
    const prices = coingeckoService.getPrices();
    const networkAssetSymbol = NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];
    
    let assets = {
      total: [{
        address: ZERO_ADDRESS,
        name: networkAssetSymbol,
        amount: bnum(daoInfo.ethBalance),
        decimals: 18
      }],
      avatar: [{
        address: ZERO_ADDRESS,
        name: networkAssetSymbol,
        amount: bnum(daoInfo.ethBalance),
        decimals: 18
      }]
    };
    Object.keys(daoInfo.tokenBalances).map((tokenAddress) => {
      const tokenData = getTokenData(tokenAddress);
      assets.avatar.push({
        address: tokenAddress,
        name: tokenData.name,
        amount: bnum(daoInfo.tokenBalances[tokenAddress]),
        decimals: tokenData.decimals
      })
      assets.total.push({
        address: tokenAddress,
        name: tokenData.name,
        amount: bnum(daoInfo.tokenBalances[tokenAddress]),
        decimals: tokenData.decimals
      })
    });
    
    schemes.map((scheme) => {
      if (scheme.controllerAddress != ZERO_ADDRESS)
        return;
        
      const tokenBalances = scheme.tokenBalances;
      if (!assets[scheme.name])
        assets[scheme.name] = [{
          address: ZERO_ADDRESS,
          name: networkAssetSymbol,
          amount: bnum(scheme.ethBalance),
          decimals: 18
        }]
      
      Object.keys(tokenBalances).map((tokenAddress) => {
        const tokenData = getTokenData(tokenAddress);

        assets[scheme.name].push({
          address: tokenAddress,
          name: tokenData.name,
          amount: bnum(tokenBalances[tokenAddress]),
          decimals: tokenData.decimals
        })
        const indexOfAssetInTotal = assets.total.findIndex((asset) => asset.address == tokenAddress);
        if (indexOfAssetInTotal > -1) {
          assets.total[indexOfAssetInTotal].amount = assets.total[indexOfAssetInTotal].amount.plus(
            bnum(tokenBalances[tokenAddress])
          );
        } else {
          assets.total.push({
            address: tokenAddress,
            name: tokenData.name,
            amount: bnum(tokenBalances[tokenAddress]),
            decimals: tokenData.decimals,
          })
        }
        
      });
    });
    
    return (
      <FinanceInfoWrapper>
        { Object.keys(assets).map((assetHolder, i) => {
          const assetsOfHolder = assets[assetHolder];
          return (
            <div style={{width: i > 0 ? "50%" : "100%"}}>
              <h2 style={{textAlign: "center"}}>{parseCamelCase(assetHolder)}</h2>
              <FinanceTableHeaderWrapper>
              <TableHeader width="33%" align="center"> Asset </TableHeader>
              <TableHeader width="34%" align="center"> Balance </TableHeader>
              <TableHeader width="33%" align="center"> USD Value </TableHeader>

              </FinanceTableHeaderWrapper>
              <TableRowsWrapper>
              {assetsOfHolder.map((asset, i) => {
                if (asset && Number(formatBalance(asset.amount, asset.decimals, 2)) > 0) {
                  return (
                    <TableRow key={`asset${i}`}>
                      <TableCell width="33%" align="center" weight='500'>
                        {asset.name} <BlockchainLink size="long" type="address" text={asset.address} onlyIcon toCopy/>
                      </TableCell>
                      <TableCell width="34%" align="center"> 
                        {formatBalance(asset.amount, asset.decimals, 2).toString()}
                      </TableCell>
                      <TableCell width="33%" align="center"> 
                        {(prices[asset.address] && prices[asset.address].usd) ?
                          formatCurrency(
                            bnum(
                              Number(formatBalance(asset.amount, asset.decimals, 2)) * prices[asset.address].usd
                            )
                          )
                          : "-"
                        }
                      </TableCell>
                    </TableRow>);
                } else {
                  return <div key={`asset${i}`} />
                }
              })}
              </TableRowsWrapper>
            </div>
          );
        })}
      </FinanceInfoWrapper>
    );
});

export default FinanceInformation;
