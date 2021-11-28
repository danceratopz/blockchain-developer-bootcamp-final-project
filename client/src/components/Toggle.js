import React from 'react'
import styled from 'styled-components';
import { colors } from '../theme';

import { FaBars } from 'react-icons/fa';
import { FaDiceD20 } from 'react-icons/fa';

const Toggle = ({ handleNavToggle }) => {
    return (
        <StyledToggle onClick={handleNavToggle}>
            <FaDiceD20 size="24" />
        </StyledToggle>
    )
}

const StyledToggle = styled.button`
    top: 0%;
    left: 0%;
    border: 1px solid ${colors.blue};
    border-radius: 5px;
    color: ${colors.blue};
    background: rgb(31, 31, 31, 0.9);
    padding: .75rem;
    margin-top: 0.4rem;
    margin-right: 0.4rem;
    display: flex;
    place-items: center;
    font-size: 2rem;
    cursor: pointer;
`;

export default Toggle
