import { Moment } from 'moment';
import RootContext from '../contexts';

export default class SubgraphService {
  context: RootContext;

  constructor(context: RootContext) {
    this.context = context;
  }

  async dailyTokenPrice(token: string, from: Moment, to: Moment) {
    const oneDay = 86400;
    const subgraphUrl =
      'https://api.thegraph.com/subgraphs/name/luzzif/swapr-xdai-v2';

    const timestamps = getTimestampsFromRange(from, to, oneDay);
    const blocks = await getBlocksFromTimestamps(timestamps);
    if (blocks.length === 0) return [];

    const query = `
        query dailyTokenPrice {
          ${blocks.map(block => {
            return `t${
              block.timestamp
            }: token(id: "${token.toLowerCase()}", block: { number: ${
              block.number
            } }) {
              derivedNativeCurrency
            }`;
          })} 
        }
      `;

    let data = await (
      await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
    ).json();

    return data;
  }
}

export const getTimestampsFromRange = (
  from: Moment,
  to: Moment,
  granularity: number
): number[] => {
  let loopedDate = from;
  let timestamps = [];
  while (loopedDate.valueOf() < to.valueOf()) {
    timestamps.push(loopedDate.valueOf());
    loopedDate = loopedDate.add(granularity, 'seconds');
  }
  return timestamps;
};

// THIS SHOULD ONLY BE USED FOR NON CRITICAL DATA DUE TO RELIANCE ON SUBGRAPH
export const getBlocksFromTimestamps = async (
  timestamps: number[]
): Promise<{ number: number; timestamp: number }[]> => {
  if (!timestamps || timestamps.length === 0) return [];

  const blocksSubgraph =
    'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks';

  const query = `
      query blocks {
        ${timestamps.map(timestamp => {
          return `t${timestamp}: blocks(first: 1, orderBy: number, orderDirection: asc where: { timestamp_gt: ${Math.floor(
            timestamp / 1000
          )} }) {
          number
        }`;
        })}
      }
    `;

  let { data } = await (
    await fetch(blocksSubgraph, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
  ).json();

  return Object.entries(data).reduce(
    (
      accumulator: { timestamp: number; number: number }[],
      [timestampString, blocks]
    ) => {
      accumulator.push({
        timestamp: parseInt(timestampString.substring(1)),
        number: parseInt(blocks[0].number),
      });

      return accumulator;
    },
    []
  );
};
