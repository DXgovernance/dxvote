import React from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';

const QRCodeWrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap};
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 20px;
`;

export default function WalletConnectData({ uri = '', size }) {
    return (
        <QRCodeWrapper>
            {uri && (
                <QRCode
                    size={size}
                    value={uri}
                    bgColor={'white'}
                    fgColor={'black'}
                />
            )}
        </QRCodeWrapper>
    );
}
