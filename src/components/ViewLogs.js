import React, { useState, useContext, useEffect } from 'react';
import { Form, Col, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import * as moment from "moment";
import 'moment/locale/nl';
import { useHistory } from "react-router-dom";
import Select from 'react-select-virtualized';
import axios from 'axios';
import { addDays } from 'date-fns';
import { subDays } from 'date-fns';
import { AppContext } from '../App'
import ErrorIndicator from './ErrorIndicator';
import TimeoutModal from '../dialogs/TimeoutModal';

const  ViewLogs = ({userVal, runtimeVal, warningTimes}) =>{
    const API_URL = window.$API_URL;
    const {state, dispatch} = useContext(AppContext);
    const history = useHistory();

    let statusRef = null;

    const options = [
        { value: 0, label: 'Completed' },
        { value: 1, label: 'Running' },
        { value: 3, label: 'Error' }
      ]
    
    const [username, setUsername] = useState(userVal);
    const [jwt, setJwt] = useState(runtimeVal); 
    const [selectedStatus, setStatus] = useState('');
    const [selectedRequestID, setRequestID] = useState('');
    const [submissionDateFrom, setSubmissionDateFrom] = useState(subDays(new Date(), 10));
    const [submissionDateTo, setSubmissionDateTo] = useState(new Date());
    
    const [serverError, setServerError] = useState(false);
    const [serverStatusCode, setServerStatusCode] = useState();
    const [serverStatusText, setServerStatusText] = useState();
    const [serverErrorMessage, setServerErrorMessage] = useState();

    const handleServerError = (status = 500, error, errorMessage ) => {
        console.log(status, error, errorMessage);
        let statusText = 'Server Error';
        let statusCode = status;
        let statusMessage = errorMessage;

        if (error.response !== undefined) {
            console.log(error.response);
            let err = error.response;
            statusText = err.statusText; 
            statusCode = err.status;
            statusMessage = errorMessage;
        }

        setServerError(true);
        setServerStatusText(statusText);
        setServerStatusCode(statusCode);
        setServerErrorMessage(statusMessage);
    }

    const closeServerError = () => {
        setServerError(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            console.log(userVal, runtimeVal);
            setUsername(userVal);
            setJwt(runtimeVal);
            if (userVal !== undefined && runtimeVal !== undefined) {
                    dispatch({ type: 'VIEWLOGVALUES_TRIGGERED', 
                    data: {
                        requestID: selectedRequestID,
                        submissionFromDate: moment(submissionDateFrom).format('MM/DD/YYYY'),
                        submissionToDate: moment(submissionDateTo).format('MM/DD/YYYY'),
                        status: selectedStatus.toUpperCase(),
                        username: userVal,
                        runtime: runtimeVal,
                        isClicked: true,
                    }
                });
            }
        }
        fetchData();
    }, [runtimeVal, userVal])

    const statusChange = (e) => {
        console.log(e);
        if (e !== null) {
            setStatus(e.label);
        } else {
            setStatus('');
        }
    }

    const handeSubmissionFrom = date => {
        
        if(date === null){
            setSubmissionDateTo(new Date())
            setSubmissionDateFrom(subDays(new Date(), 10))
        } else{
            setSubmissionDateTo(addDays(date,10))
            setSubmissionDateFrom(date);
        }
    };

    const handeSubmissionDateTo = date => {
        if(date === null){
            setSubmissionDateTo(new Date());
        } else{
            setSubmissionDateTo(date);
        }
    };


    const handleRequestID = (e) => {
        setRequestID(e.target.value);
    }

    const handleSearch = () => {
        console.log(username, jwt);
        console.log(`to be searched in view logs ${selectedRequestID}-${selectedStatus}-${submissionDateTo}-${submissionDateFrom}`);
        dispatch({ type: 'VIEWLOGVALUES_TRIGGERED', 
            data: {
                requestID: selectedRequestID,
                submissionFromDate: moment(submissionDateFrom).format('MM/DD/YYYY'),
                submissionToDate: moment(submissionDateTo).format('MM/DD/YYYY'),
                status: selectedStatus.toUpperCase(),
                username: username,
                runtime: jwt,
                isClicked: true,
            }
        });
    }

    return (
        <div className="container mt-4">
            <TimeoutModal
                  warningTimes = {warningTimes}
                  handleServerError = {handleServerError}
                  username = {username}
                  jwt = {jwt}
            />
            {serverError === true ? (
                <ErrorIndicator 
                    showError={serverError} 
                    statusCode={serverStatusCode} 
                    statusText={serverStatusText} 
                    errorMessage={serverErrorMessage}
                    closeServerError={closeServerError}
                />) : ('')
            }
            <div className="d-flex flex-column flex-md-row bd-highlight p-right-3">
                <div className="col-md-4 pl-1 pr-0">
                    <Form.Row>
                        <Form.Label className="col-md-6 mt-1 text-md-right text-sm-left">
                            Request ID
                        </Form.Label>
                        <Col className="col-md6">
                        <Form.Control
                            onChange={handleRequestID}
                            type="text"
                        />
                        </Col>
                    </Form.Row>
                    <Form.Row className="mt-2">
                        <Form.Label className="col-md-6 mt-1 text-md-right text-sm-left">
                            Status
                        </Form.Label>
                        <Col className="col-md-6">
                        <Select 
                                ref = {
                                    ref => statusRef = ref
                                }
                                grouped={false}
                                minimumInputSearch={0}
                                placeholder=""
                                onChange={statusChange}
                                options={options}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 5, width: 150}) }}
                                menuPortalTarget={document.body}
                                isClearable={true}
                            />
                        </Col>
                    </Form.Row>
                </div>
                <div className="col-md-5 pl-1 pr-0">
                    <Form.Row>
                        <Form.Label className="col-md-6 mt-1 text-md-right text-sm-left">
                            *Submission From Date
                        </Form.Label>
                        <Col className="col-md-5">
                        <DatePicker
                                className="form-control"
                                selected={submissionDateFrom}
                                onChange={handeSubmissionFrom}
                            />
                        </Col>
                    </Form.Row>

                    <Form.Row className="mt-2">
                        <Form.Label className="col-md-6 mt-1 text-md-right text-sm-left">
                            *Submission To Date
                        </Form.Label>
                        <Col className="col-md-5">
                        <DatePicker
                                className="form-control w-100"
                                selected={submissionDateTo}
                                onChange={handeSubmissionDateTo}
                                minDate={submissionDateFrom}
                            />
                        </Col>
                    </Form.Row>
                </div>
            </div>

            <div className="btn-container mb-2 text-center mt-4 w-75">
                <Button 
                    className="btn-theme-main mr-5" 
                    type="button"
                    onClick={handleSearch}
                >Search</Button>
                <Button 
                    className="mr-5 float-right" 
                    variant="dark"
                    onClick={() =>  history.push('/', {hasLoaded: true})}
                >Return</Button>
            </div>
        </div>
    )
}

export default ViewLogs
