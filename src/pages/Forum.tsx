import React from 'react';
import styled from 'styled-components';
import { Box } from '../components/common';
import { FiZap } from 'react-icons/fi';

const ForumPage = () => {
  const LoadingBox = styled.div`
    .loader {
      text-align: center;
      font-weight: 500;
      font-size: 20px;
      line-height: 18px;
      color: var(--dark-text-gray);
      padding: 25px 0px;

      .svg {
        height: 30px;
        width: 30px;
        margin-bottom: 10px;
      }
    }
  `;

  const [loading, setLoading] = React.useState(true);

  function postMessageReceived(e) {
    if (!e) {
      return;
    }

    if (loading) {
      setLoading(false);
    }
  }
  window.addEventListener('message', postMessageReceived, false);

  var lists = document.querySelectorAll('d-topics-list');
  for (var i = 0; i < lists.length; i++) {
    var list = lists[i];
    var url = list.getAttribute('discourse-url');
    if (!url || url.length === 0) {
      console.error('Error, `discourse-url` was not found');
      continue;
    }
    var frameId = 'de-' + Math.random().toString(36).substr(2, 9);
    var params = ['discourse_embed_id=' + frameId];
    list.removeAttribute('discourse-url');

    for (var j = 0; j < list.attributes.length; j++) {
      var attr = list.attributes[j];
      params.push(attr.name.replace('-', '_') + '=' + attr.value);
    }

    var iframe = document.createElement('iframe');
    iframe.src = url + '/embed/topics?' + params.join('&');
    iframe.id = frameId;
    iframe.width = '100%';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    console.log(iframe);
    list.appendChild(iframe);
  }

  return (
    <Box noPadding>
      {loading ? (
        <LoadingBox>
          <div className="loader">
            {' '}
            <FiZap /> <br /> Loading..{' '}
          </div>
        </LoadingBox>
      ) : (
        // @ts-ignore
        <d-topics-list
          discourse-url="https://daotalk.org/"
          category="15"
          per-page="10000"
          template="complete"
        />
      )}
    </Box>
  );
};

export default ForumPage;
