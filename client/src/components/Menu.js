import React from 'react'
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { colors } from '../theme';

// Credits: https://dev.to/hyggedev/how-to-build-a-responsive-react-navigation-menu-with-styled-components-3682

const Menu = ({ handleNavToggle }) => {
    return (
        <StyledMenu>
            <StyledLink onClick={handleNavToggle} to="/">Fractionalize</StyledLink>
            <StyledLink onClick={handleNavToggle} to="/Market">Market</StyledLink>
            <StyledLink onClick={handleNavToggle} to="/Redeem">Redeem</StyledLink>
            <StyledLink onClick={handleNavToggle} to="/Payout">Payout</StyledLink>
            <StyledLink onClick={handleNavToggle} to="/About">About</StyledLink>
            <CloseToggle onClick={handleNavToggle}><FaTimes size="24" /></CloseToggle>
        </StyledMenu>
    )
}

const StyledMenu = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    @media screen and (min-width: 790px) {
        width: 60%;
    }
    background-color: rgb(31, 31, 31, 0.9);
    z-index: 99;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const StyledLink = styled(Link)`
    color: #eee;
    text-decoration: none;
    font-size: clamp(3rem, 4vw, 6vw);
    font-family: "Source Code Pro, "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    transition: .2s all ease-in-out;

    user-select: none; /* supported by Chrome and Opera */
   -webkit-user-select: none; /* Safari */
   -khtml-user-select: none; /* Konqueror HTML */
   -moz-user-select: none; /* Firefox */
   -ms-user-select: none; /* Internet Explorer/Edge */

    &:hover {
        transition: .2s all ease-in-out;
        color: ${colors.blue};
    }
`;

const CloseToggle = styled.button`
    top: 2.3%;
    left: 2%;
    border: 1px solid ${colors.blue};
    border-radius: 5px;
    background: rgb(31, 31, 31, 0.9);
    color: ${colors.blue};
    border-radius: 10px;
    padding: .75rem;
    display: flex;
    place-items: center;
    font-size: 2rem;
    cursor: pointer;
`;

export default Menu
