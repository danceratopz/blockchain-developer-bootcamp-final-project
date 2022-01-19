import React from 'react';
import { Container } from 'react-bootstrap';
import AboutText from '../../components/AboutText';

const About = () => (
  <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
    <AboutText />
  </Container>
);

export default About;
