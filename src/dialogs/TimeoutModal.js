import React, {useState, useEffect} from 'react'
import { Form, Col, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { useHistory } from "react-router-dom";
import axios from 'axios';
const TimeoutModal = ({
    warningTimes,
    username,
    jwt,
    handleServerError
}) => {
    const API_URL = window.$API_URL;
    const history = useHistory();
     //Timeout warning
     const [isShowing, setIsShowing] = useState(false);

    const warn = () => {
        setIsShowing(true)
    };

    const buttonsModal  = () => {
        setIsShowing(false);
        axios.get(`${API_URL}/upd_user_token_time?username=${username}`,{
            headers: {
                username : username,
                runtime : jwt
            }
        }).then(res => {
            console.log(res);
            let data = res.data;
            let statusCode = res.status;
            if (statusCode === 200) {
                 console.log("success 200 codes")
            } else {
                history.push('/error', {errorMessage: data.error_msg});
            }
         }).catch(error => {
             console.log(error);
             handleServerError('',error, 'An error occured, Please contact administrator for assistance.');
         });
   }

    const showWarning = () => {
        // console.log('hello');
        if (isShowing === false) {
            warn()
        }
        // console.log(warningTimes);
    }

    useEffect(() => {
        let interval;

        const ids = [
            '#modalbuta',
            '#btnYes',
            '#btnSearch'
        ]
        
        // Interval listener for button Yes, Search and OK
        const actionInterval = setInterval(() => {
            // console.log('action triggered');
            for(let i in ids) {
                const el = document.querySelectorAll(ids[i])
                // console.log(el[1]);
                
                if (el[0] !== undefined) {
                    el[0].addEventListener('click', () =>{
                        console.log('reseting timer...');
                        clearInterval(interval);
                        interval = setInterval(showWarning, warningTimes);
                    });
                }
                // console.log(isShowing, 'modal flag checker');
            }
        }, 100);

        interval = setInterval(showWarning, warningTimes);

        return () => {
            clearInterval(interval);
            clearInterval(actionInterval);
        };
    }, []);

    return(
        <>
            <React.Fragment>
                <Modal 
                    show={ isShowing }
                    backdrop="static"
                    dialogClassName="timeout-modal"
                >
                    <Modal.Header>
                        <Modal.Title>Alert</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5 className="text-center">You have been idle for 25 minutes. </h5>
                        <h5 className="text-center"> Click <span className="text-primary">OK</span> to continue...</h5>
                        <Button onClick={buttonsModal} id="modalButa" className="float-right" type="submit" variant="primary">
                            OK
                        </Button>
                    </Modal.Body>
                </Modal>
            </React.Fragment>
        </>
    )
};

export default TimeoutModal;