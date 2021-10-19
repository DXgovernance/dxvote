import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import config from '../../utils/config';

const FooterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 24px 0px 32px;
  color: var(--footer-text-gray);
  flex-grow: 1;
`;

const LeftFooter = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const FooterItem = styled.div`
  a {
    text-decoration: none;
    color: var(--footer-text-gray);
    cursor: pointer;
  }
  a:hover {
    color: var(--text-gray-onHover);
  }
  span {
    color: var(--footer-text-gray);
  }
`;

const FooterDivider = styled.div`
  background: var(--footer-text-gray);
  width: 4px;
  height: 4px;
  border-radius: 2px;
  line-height: 24px;
  margin: auto 7px;
`;

const appVersion: string | undefined =
  config.version &&
  config.env &&
  `v${config.version}${
    config.env === 'production' || !config.commit
      ? ''
      : `-${config.env}-${config.commit}`
  }`;

const Footer = () => {
  let history = useHistory();

  return (
    <FooterWrapper>
      <LeftFooter>
        <FooterItem>
          <a href="https://dxdao.eth.link/#/" target="_blank">
            {' '}
            Website{' '}
          </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a
            onClick={() => {
              history.push('/forum');
            }}
            target="_self"
          >
            {' '}
            Forum{' '}
          </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a href="https://github.com/AugustoL/dxvote" target="_blank">
            {' '}
            Source Code{' '}
          </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a
            onClick={() => {
              history.push('/faq');
            }}
          >
            {' '}
            FAQ{' '}
          </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a
            href="https://github.com/AugustoL/dxvote/issues/new/choose"
            target="_blank"
          >
            {' '}
            Submit Issue{' '}
          </a>
        </FooterItem>
        {appVersion && (
          <>
            <FooterDivider></FooterDivider>
            <FooterItem>
              <span>{appVersion}</span>
            </FooterItem>
          </>
        )}
      </LeftFooter>
    </FooterWrapper>
  );
};

export default Footer;
