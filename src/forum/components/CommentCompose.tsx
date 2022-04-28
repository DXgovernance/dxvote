import Editor from 'components/Guilds/Editor';
import { Button } from 'components/Guilds/common/Button';
import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import { useCreate } from '../hooks/useForum';
import { useConnect } from '../hooks/useConnect';
import { CommentAvatar, ENSName } from './User';
import { Loading } from 'components/Guilds/common/Loading';

import { Text, Flex } from './common/Box';
import ErrorMessage from './common/ErrorMessage';

function ConnectCeramicButton() {
  const { connection, connect } = useConnect();
  return connection.status !== 'connected' ? (
    <Button variant="secondary" onClick={() => connect()}>
      {connection.status === 'connecting' ? (
        <Loading loading iconProps={{ size: 12 }} />
      ) : (
        'Connect Ceramic'
      )}
    </Button>
  ) : null;
}

export default function CommentCompose({ proposalId }) {
  const { account } = useWeb3React();
  const [content, setContent] = useState('');

  const [{ loading, error }, create] = useCreate();
  return (
    <Flex>
      <div>
        <CommentAvatar address={account} />
      </div>
      <div>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          height={'42px'}
        >
          <Text>
            Comment as <ENSName address={account} color="grey" />
          </Text>
          <ConnectCeramicButton />
        </Flex>
        <ErrorMessage error={error} />
        <form
          onSubmit={async e => {
            e.preventDefault();
            create({ content, parent: proposalId, type: 'comment' });
            setContent('');
          }}
        >
          <Editor
            placeholder="What do you want to propose?"
            onMdChange={setContent}
          />
          {/* Button has margin which is why we negate that here with mr (margin-right) */}
          <Flex justifyContent="flex-end" mr={-2}>
            <Button
              variant="secondary"
              type="submit"
              disabled={!content || loading}
            >
              Submit
            </Button>
          </Flex>
        </form>
      </div>
    </Flex>
  );
}
