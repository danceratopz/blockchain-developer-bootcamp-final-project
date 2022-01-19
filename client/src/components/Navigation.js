import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaDiceD20 } from 'react-icons/fa';
import { StyledHeaderBox } from './StyledHelpers';
import { colors } from '../theme';

function Navigation() {
  return (
    <StyledHeaderBox>
      <FaDiceD20 color={colors.blue} size="22" />
      <div className="navigation">
        <nav className="navbar navbar-expand navbar-dark">
          <div className="container">
            <div>
              <ul className="navbar-nav ml-auto">
                <li key="fractionalize" className="nav-item">
                  <NavLink className="nav-link" exact to="/">
                    Fractionalize
                  </NavLink>
                </li>
                <li key="market" className="nav-item">
                  <NavLink className="nav-link" to="/Market">
                    Market
                  </NavLink>
                </li>
                <li key="redeem" className="nav-item">
                  <NavLink className="nav-link" to="/Redeem">
                    Redeem
                  </NavLink>
                </li>
                <li key="payout" className="nav-item">
                  <NavLink className="nav-link" to="/Payout">
                    Payout
                  </NavLink>
                </li>
                <li key="about" className="nav-item">
                  <NavLink className="nav-link" to="/About">
                    About
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </StyledHeaderBox>
  );
}

export default Navigation;
