import React from "react";
import { NavLink } from "react-router-dom";
import { StyledHeaderBox } from './StyledHelpers';

function Navigation() {
  return (
    <StyledHeaderBox>
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
                  <NavLink className="nav-link" to="/Redeem">
                    Redeem
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/Buyout">
                    Buyout
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
