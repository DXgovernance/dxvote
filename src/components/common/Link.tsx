import React from 'react';
import styled from 'styled-components';

export const Link = styled.a.attrs({
    target: '_blank',
    rel: 'noopener noreferrer',
})`
    text-decoration: none;
    cursor: pointer;
    color: var(--turquois-text);

    :focus {
        outline: none;
        text-decoration: underline;
    }

    :active {
        text-decoration: none;
    }
`;

export default Link;
