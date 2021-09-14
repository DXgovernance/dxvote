import styled from 'styled-components';

const Button = styled.div`
  height: 40px;
  width: 166px;
  display: flex;
  justify-content: center;
  align-items: center;

  background: #b3494f;
  border: 1px solid #e1e3e7;
  box-sizing: border-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
  border-radius: 6px;

  font-size: 0.9rem;
  -webkit-box-align: center;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  background-color: rgb(255, 104, 113);
  color: rgb(255, 255, 255);
  font-weight: 500;
  flex-flow: row nowrap;
  padding: 0.5rem;
  border-radius: 2rem;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(255, 104, 113);
  border-image: initial;
`;

const Text = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.83rem;
  flex: 1 1 auto;
  overflow: hidden;
  justify-content: center;
  margin-left: 30px;
`;

export default function ErrorButton() {
  return (
    <Button>
      <Text>Wrong Network</Text>
    </Button>
  );
}
