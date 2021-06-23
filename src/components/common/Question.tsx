import React from 'react';
import styled from 'styled-components';
import { FaQuestionCircle } from "react-icons/fa";


const QuestionLink = styled.a`

  color: var(--dark-text-gray);
  
  svg {
    height: 15px;
  }
  svg:hover {
    color: var(--text-gray-onHover);
  }
`;

const QuestionIcon = ({ question }) => {
  return (
    <QuestionLink href={"/#/faq?question="+question} target="_self">
      <FaQuestionCircle> </FaQuestionCircle>
    </QuestionLink>
  );
}

export default QuestionIcon;
