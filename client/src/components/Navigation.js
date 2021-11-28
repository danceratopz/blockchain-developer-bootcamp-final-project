import React from "react";
import { NavLink } from "react-router-dom";
import { StyledHeaderBox } from './StyledHelpers';
import { FaDiceD20 } from 'react-icons/fa';
import { colors } from '../theme';

function Navigation() {
  return (
    <StyledHeaderBox>
      <FaDiceD20 color={colors.blue} size="22"/>
      <div className="navigation">
        <nav className="navbar navbar-expand navbar-dark">
          <div className="container">
            <div>
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" exact={true} to="/">
                    Fractionalize
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/Market">
                    Market
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/Redeem">
                    Redeem
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/Payout">
                    Payout
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
