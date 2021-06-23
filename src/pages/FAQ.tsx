import React, { useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import Box from '../components/common/Box';
import { useLocation } from 'react-router-dom';

const FAQPage = observer(() => {
    
  const questionId = useLocation().search.split("=")[1];
  
  useEffect(() => {
      document.getElementById('question'+questionId).scrollIntoView();
   }, []);

  return (
    <Box style={{padding: "0px 10px"}}>
      <h2 id="question1">Question 1</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
      <h2 id="question2">Question 2</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
      <h2 id="question3">Question 3</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
      <h2 id="question4">Question 4</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
      <h2 id="question5">Question 5</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
      <h2 id="question6">Question 6</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
      <h2 id="question7">Question 7</h2>
      <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
      </p>
    </Box>
  );
});

export default FAQPage;
