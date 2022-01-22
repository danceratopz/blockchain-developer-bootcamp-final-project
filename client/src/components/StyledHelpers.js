import styled from 'styled-components';
import { colors } from '../theme';

export const StyledHeaderBox = styled.div`
  display: flex;
  background: ${colors.componentBackground};
  justify-content: center;
  align-items: center;
  margin-top: 0.4rem;
  border: 1px solid ${colors.blue};
  padding: 10px;
  margin-left: 5px;
  margin-right: 5px;
  border-radius: 5px;
  height: 50px;
`;

export const FractFieldset = styled.fieldset`
  border: 1px solid ${colors.blue};
  background: ${colors.componentBackground};
  color: white;
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
`;

export const InfoFieldset = styled.fieldset`
  border: 1px solid ${colors.secondary};
  background: ${colors.componentBackground};
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

export const FractButton = styled.button`
  border: 1px solid ${colors.blue};
  background: transparent;
  color: white;
  border-radius: 5px;
  margin: 5px;
`;

export const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

export const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  width: 260px;
`;

export const StyledItemTextContainer = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: column;
`;

export const StyledAnchor = styled.a`
  color: ${colors.blue};
  font-weight: bold;
`;
