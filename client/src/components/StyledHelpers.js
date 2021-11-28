import styled from 'styled-components';
import { colors } from '../theme';

export const StyledHeaderBox = styled.div`
  display: flex;
  background: #1f1f1f;
  justify-content: center;
  align-items: center;
  margin-top: 0.4rem;
  border: 1px solid ${colors.blue};
  padding: 10px;
  margin-left : 5px;
  margin-right : 5px;
  border-radius: 5px;
  height: 50px;
`;

export const FractFieldset = styled.fieldset`
  border: 1px solid ${colors.blue};
  background: #1f1f1f;
  color: white;
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
`;

export const NoFractFieldset = styled.fieldset`
  border: 1px solid ${colors.secondary};
  background: #1f1f1f;
  color: white;
  border-radius: 10px;
  padding: 10px;
  margin: 15px;
  margin-top: 20px;
`;

export const Legend = styled.legend`
  float: left;
`;

export const FractInput = styled.input`
  border: 1px solid ${colors.blue};
  background: ${colors.blue};
  width: 250px
  color: white;
  border-radius: 5px;
  margin: 5px;
`;

export const ConnectBtn = styled.button`
  border: 1px solid ${colors.blue};
  background: transparent;
  color: white;
  border-radius: 5px;
  margin: 5px;
`;
