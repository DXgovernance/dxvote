import styled from 'styled-components';

const SpinningCircle = styled.div`
    height: ${(props) => props.height || '16px'};
    width: ${(props) => props.width || '16px'};
    color: blue;
    top: 50%;
    left: 50%;
    margin: -(9px) 0 0 - (9px);
    -webkit-animation: rotation 1s infinite linear;
    -moz-animation: rotation 1s infinite linear;
    -o-animation: rotation 1s infinite linear;
    animation: rotation 1s infinite linear;
    border: 2px solid rgba(83, 109, 254, 0.2);
    border-radius: 100%;

    :before {
        content: '';
        display: block;
        position: absolute;
        left: -2px;
        top: -2px;
        height: 100%;
        width: 100%;
        border-top: 2px solid #758afe;
        border-left: 2px solid #758afe;
        border-bottom: 2px solid #758afe;
        border-right: 2px solid transparent;
        border-radius: 100%;
    }

    @-webkit-keyframes rotation {
        from {
            -webkit-transform: rotate(0deg);
        }
        to {
            -webkit-transform: rotate(359deg);
        }
    }
    @-moz-keyframes rotation {
        from {
            -moz-transform: rotate(0deg);
        }
        to {
            -moz-transform: rotate(359deg);
        }
    }
    @-o-keyframes rotation {
        from {
            -o-transform: rotate(0deg);
        }
        to {
            -o-transform: rotate(359deg);
        }
    }
    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(359deg);
        }
    }
`;

const PendingCircle = ({ height, width }) => {
    return <SpinningCircle height={height} width={width} />;
};

export default PendingCircle;
