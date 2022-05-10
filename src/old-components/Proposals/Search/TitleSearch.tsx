import React from 'react';
import styled from 'styled-components';

const ProposalsNameFilter = styled.input`
  background-color: white;
  border: 1px solid #536dfe;
  border-radius: 4px;
  color: #536dfe;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: initial;
  width: 180px;
  padding: 0px 10px;
  margin: 5px 0px;
  font-family: var(--roboto);
  align-self: center;
`;

interface TitleSearchProps {
  value: string;
  onFilter: (value: string) => void;
}

const TitleSearch: React.FC<TitleSearchProps> = ({ value, onFilter }) => {
  return (
    <ProposalsNameFilter
      type="text"
      placeholder="Search by proposal title"
      name="titleFilter"
      id="titleFilter"
      value={value}
      onChange={e => onFilter(e.target.value)}
    ></ProposalsNameFilter>
  );
};

export default TitleSearch;
