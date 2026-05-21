import React from "react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/auth-context";

export default function MainNavigation() {
    const value = useContext(AuthContext);

    return ( 
        <nav className="navbar navbar-expand-md navbar-light main-navigation"> 
            <div className="container-fluid">
              <NavLink to="/events" className="navbar-brand"> 
                مناسبات حسوب
              </NavLink>
             <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
             data-bs-target="#navbarNav" aria-controls="navbarNav"
              aria-expanded="false" aria-label="Toggle navigation"> 
                <span className="navbar-toggler-icon"></span> 
            </button> 
            <div className="collapse navbar-collapse main-navigation-items" id="navbarNav">
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <NavLink to="/events" className="nav-link">المناسبات</NavLink>
                  </li> 
                  { value.token && (
                    <li className="nav-item"> 
                    <NavLink to="/bookings" className="nav-link">حجوزاتي</NavLink>
                  </li> 
                )} 
                {!value.token  && (
                     <li className="nav-item">
                    <NavLink to="/login" className="nav-link">تسجيل الدخول</NavLink>
                  </li>
                )}
               
                </ul>
                 { value.token && (  
                <ul className="nav-auth-actions">  
                <button onClick={() => value.logout()}>تسجيل الخروج</button> 
                    <li className="nav-item">  
                     <NavLink to="#"> {value.username} </NavLink>
                  </li>
                </ul>
                )}
                
              </div>
             </div>
        </nav>

    );
}       
