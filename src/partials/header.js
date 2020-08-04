import React, {useState, useEffect, useContext}from 'react';
import logo from '../assets/EY-logo.png';
import { Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'

const Header = ({userVal}) => {
    const [currentUser, setCurrentUser] = useState('');

    const getCurrentUser = () => {
        if (userVal !== undefined) {
            if (userVal.length !== 0) {
                let username = userVal;
                setCurrentUser(username)
            }
        }
    }

    useEffect(() => {
        getCurrentUser();
    },[userVal])

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="navbar-inverse">
            <Navbar.Brand>
                <img
                    alt=""
                    src={logo}
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                /> 
            </Navbar.Brand>
            <h3 className="text-center header-title text-theme-main">EY Autoinvoice Code Prediction</h3>
            <Navbar.Text className="text-light header-username">
                <span class="username">{currentUser}</span>
                <FontAwesomeIcon className="user-icon" icon={faUserCircle} />
            </Navbar.Text>
      </Navbar>
    );
}

export default Header;
