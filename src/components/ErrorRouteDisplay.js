import React, {useState, useEffect} from 'react';
import { useLocation } from "react-router-dom";

const ErrorRouteDisplay = (props) => {
    const location = useLocation();
    const [errorMessage, setEerrorMessage] = useState('Accessing an invalid page, Please contact administrator for assistance.');
    useEffect(() => {
        if (location.state !== undefined) {
            console.log(location.state.errorMessage);
            setEerrorMessage(location.state.errorMessage)
        }
        
     }, [location]);
    return (
        <h4 className="text-danger w-50 m-auto text-center pt-4">{errorMessage}</h4>
    )
}

export default ErrorRouteDisplay
