import React, { useState, useEffect, useContext, useRef } from 'react'
import { Form, Col, Button, Alert, Spinner, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';
import { subDays } from 'date-fns';
import * as moment from "moment";
import 'moment/locale/nl';
import axios from 'axios';
import { AppContext } from '../App'

import Select from 'react-select-virtualized';
import ErrorIndicator from './ErrorIndicator';
import Papa from 'papaparse';

import buDataSet from '../../Master Data/BusinessUnitMaster.csv';
import supplierDataSet from '../../Master Data/SupplierMaster.csv';
import supplierSiteDataSet from '../../Master Data/SupplierSite.csv';

import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";

import TimeoutModal from '../dialogs/TimeoutModal';
import UserValidationDialog from '../dialogs/UserValidationDialog';

const SearchFields = ({userVal, runtimeVal, warningTimes}) => {
    const API_URL = window.$API_URL;
    const {state, dispatch} = useContext(AppContext);
    const history = useHistory();
    const location = useLocation();

    // React Select BU Unit field Ref
    let selectBURef = null;
    let selectSupplierRef =  null;
    let selectSupplierSiteRef = null;
    let selectTegnaSiteRef = null;

    // Submit button disable flag
    const [isSubmitDisable, setSubmitDisable] = useState(false);
    const [isReviewDisable, setReviewDisable] = useState(false);
    const [isSearchDisable, setSearchDisable] = useState(false);

    // User Validation Dialog
    const [showUserValDialog, setUserValDialog] = useState(false);
    const [userValDialogTitle, setUserValDialogTitle] = useState('');
    const [userValDialogMode, setUserValDialogMode] = useState(0);

    const [lovLoadStatus, setLovLoadStatus] =  useState(true);
    const [tempSuppliers, setSuppliers] = useState([]);
    const [tempBU, setBU] = useState([]);
    const [tempSupplierSite, setSupplierSite] = useState([]);
    const supplierSiteFilter = useRef([]);
    const [tempTegnaSite, setTegnaSite] = useState([]);
    const [supplierSiteLoadStatus, setSupplierSiteLoadStatus] = useState(false)

    const [selectedBU, setSelectedBU] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedSupplierSite, setSelectedSupplierSite] = useState('');
    const [selectedTegnaSite, setSelectedTegnaSite] = useState('');
    const [selectedInvoiceNum, setSelectedInvoiceNum] = useState('');

    // Get user details
    const [username, setUsername] = useState('');
    const [jwt, setJwt] = useState('');

    const [invoiceFromDate, setInvoiceFromDate] = useState(subDays(new Date(), 15));
    const [invoiceToDate, setInvoiceToDate] = useState(addDays(new Date(), 15));

    const [serverError, setServerError] = useState(false);
    const [serverStatusCode, setServerStatusCode] = useState();
    const [serverStatusText, setServerStatusText] = useState();
    const [serverErrorMessage, setServerErrorMessage] = useState();

    const [showError, setShowError] = useState(false);
    const [message, setMessage] = useState('');

    //CSV Button 
    const [csvbutState, setcsvbutState] = useState(false);

    const processUserValidation = (userValues, jwtValues) => {
        if (userValues !== undefined && jwtValues !== undefined) {
            if (userValues.length !== 0 && jwtValues.length !== 0) {
                setUserValidation(userValues, jwtValues)
                .then(value => {
                    console.log(value);
                    let username = value.username;
                    let jwt = value.jwt;
                    // Calling to populate Tegna Site when the API has been successfully populated
                    setTegnaSiteLov(username, jwt);
                });
            } else {
                // alert('error happened invalid username and runtime');
                history.push('/error', {errorMessage: 'URL is Invalid, Please try again and if issue persist contact administrator for assistance.'});
            }
        } else {
            // alert('error happened');
            history.push('/error', {errorMessage: 'URL is Invalid, Please try again and if issue persist contact administrator for assistance.'});
        }
    }

    const setUserValidation  = (userValue, jwtValue) => {
        console.log(`setting up validations`);
        return new Promise((resolve, reject) => {
            axios.get(`${API_URL}/check_user_access`, {
                headers: {
                    username: userValue,
                    runtime: jwtValue
                }
            })
            .then(res => {
                console.log(res);
                let data = res.data;
                let statusCode = data.status_code;
                if (statusCode === 200) {
                    setUsername(userValue);
                    setJwt(jwtValue)
                    // Return Success Promise Response
                    resolve({
                        username: userValue,
                        jwt: jwtValue
                    });
                } else {
                    history.push('/error', {errorMessage: data.error_msg});
                }
            }).catch(error => {
                console.log(error);
                handleServerError('',error, 'An error occured, Please contact administrator for assistance.');
            });
        })
    }
    // End: Process when user tried to refresh a current session
    const setLovBU = (data) => {
        let newArr = [...tempBU];
        for(let key in data) {
            newArr.push(data[key].BUSINESS_UNIT);
        };
        setBU(newArr);

    };

    const setLovSupplier = data => {
        // console.log('Calling to set lov supplier', data);
        let newArr = [];
        for(let key in data) {
            newArr = [...newArr, data[key].SUPPLIER_NAME];
        }
        setSuppliers(newArr);
    };

    const setLovSupplierSite = data => {
        // console.log('Calling to set lov supplierSite', data);
        let newArr = [];  
        for(let key in data) {
            newArr = [...newArr, data[key]];
        }
        setSupplierSite(newArr);
    };

    const setLovTegnaSite = data => {
        let newArr = [];
        for(let key in data) {
            newArr = [...newArr, data[key].ATTRIBUTE1];
        }
        setTegnaSite(newArr)
    }

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
        setLovLoadStatus(false);
    }

    const closeServerError = () => {
        setServerError(false);
    }

    const setTegnaSiteLov = (username, runtime) => {
        axios.get(`${API_URL}/get_Attribute1_lov_data`, { 
            headers: {
                username: username,
                runtime: runtime
            }
        }).then(res => {
            let data = res.data;
            console.log(data)
            let statusCode = data.status_code;
            if (statusCode === 200) {
                setLovTegnaSite(JSON.parse(data.response))
            } else {
                let errorMsg = data.error_msg;
                handleServerError(statusCode,'',errorMsg);
            }
        }).then(() => {
            setLovLoadStatus(false);
        }).catch((error) => {
            console.log(error.response)
            handleServerError('',error, 'An error occured, Please contact administrator for assistance.');
        });
    }

    useEffect(() => {
           Papa.parse(buDataSet, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                console.log(results);
                let data = results.data;
                setLovBU(data);
            }
        });

        Papa.parse(supplierDataSet, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                // console.log(results);
                let data = results.data;
                setLovSupplier(data);
            }
        });

        Papa.parse(supplierSiteDataSet, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                let data = results.data;
                // console.log('supplierSite',data);
                setLovSupplierSite(data);
            }
        });
    }, [])

    useEffect(() => {
        console.log('Initial Load...');
        console.log('get user Dummy', userVal);
        console.log('get jwt Dummy', runtimeVal);

        console.log(state, 'coming back');
        const fetchData = async () => {
            console.log('coming');
            console.log('get user Dummy 123', userVal);
            console.log('get jwt Dummy 123', runtimeVal);
            if (userVal !== undefined && runtimeVal !== undefined) {
                processUserValidation(userVal, runtimeVal);
            }
        }
        fetchData();
    }, [runtimeVal, userVal]);

    useEffect(() => {
        console.log(selectedSupplier, selectedBU);
        setSupplierSiteLoadStatus(true);
        // Added Set Time Out function to render display
        setTimeout(() => {
            if  (selectedSupplier !==  '' && selectedBU !==  '') {
                console.log('triggered')
                // console.log(selectedSupplier, selectedBU);
                // console.log('to be filtered', tempSupplierSite.filter(item => item.VENDOR_NAME === selectedSupplier && item.BU_NAME === selectedBU));
                supplierSiteFilter.current = tempSupplierSite.filter(item => item.VENDOR_NAME === selectedSupplier && item.BU_NAME === selectedBU);
                console.log(supplierSiteFilter.current)
            } else {
                supplierSiteFilter.current = [];
                setSelectedSupplierSite('');
            }
            setSupplierSiteLoadStatus(false);
        }, 200)
    },[selectedSupplier, selectedBU]);


    const handleInvoiceFromDate = date => {
        if(date === null){
            setInvoiceFromDate(subDays(new Date(), 15));
            setInvoiceToDate(addDays(new Date(), 15));
        }else{
            setInvoiceFromDate(date);
            setInvoiceToDate(addDays(date, 30));
        }
    };

    const handeInvoiceToDate = date => {
        if(date === null){
            setInvoiceToDate(addDays(new Date(), 15));
        } else{
            setInvoiceToDate(date);
        }
    };

    const handleInvoiceNum = (event) => {
        // console.log(event.target.value)
        setSelectedInvoiceNum(event.target.value);
    }

    const handleSearch = () => {
        console.log(selectedSupplier + "hellooss")
        // alert(`clicked search processing the ff: BU - ${selectedBU}|Supplier - ${selectedSupplier}|SupplierSite - ${selectedSupplierSite}`);
        console.log(`clicked search processing the ff: BU - ${selectedBU}|Supplier - ${selectedSupplier}|SupplierSite - ${selectedSupplierSite}`);    
        let tempInvoiceFromDate = moment(invoiceFromDate).format('MM-DD-YYYY');
        let tempInvoiceToDate = moment(invoiceToDate).format('MM-DD-YYYY');
        console.log('tegna site value', selectedTegnaSite);
        // Handle validations
        console.log(selectedSupplier === '' || selectedTegnaSite === '');
        console.log('Success');
        dispatch({ type: 'DATAVALUES_TRIGGERED', data: {
            supplier: selectedSupplier,
            supplierSite: selectedSupplierSite,
            bu: selectedBU,
            invoiceFromDate: tempInvoiceFromDate,
            invoiceToDate: tempInvoiceToDate,
            tegnaSite: selectedTegnaSite,
            invoiceNum: encodeURI(selectedInvoiceNum),
            username: username,
            runtime: jwt,
            isClicked: true,
            processing: true,
        }});
    };

    const setSupplierSearch =  tempSuppliers.map((currElement, index) => {
        return {'label':currElement,'value':index};
    });
    
    const setSupplierSiteSearch =  supplierSiteFilter.current.map((currElement, index) => {
        return {'label':currElement.SUPPLIER_SITE,'value':index}; 
    });
    
    const setBUSearch =  tempBU.map((currElement, index) => {
        return {'label':currElement,'value':index}; 
    });

    const setTegnaSearch =  tempTegnaSite.map((currElement, index) => {
        return {'label':currElement,'value':index}; 
    });

    // const handlePredict = () => {
    //     dispatch({ type: 'PREDICT_TRIGGERED', data: {
    //         isClicked: true,
    //     }});
    // };
    
    const handleUserValDialog = () => {
        setUserValDialog(false);

        if (userValDialogMode === 0) {
            dispatch({ type: 'REVIEW_TRIGGERED', 
                data: {
                    username: username,
                    runtime: jwt,
                    isClicked: true,
                    processing: true,
                }
            });
        } else if(userValDialogMode === 2){
            history.push('/view_logs');
        }else {
            dispatch({type: 'SUBMIT_TRIGGERED', data: {
                isClicked: true,
                username: username,
                runtime: jwt,
                processing: true,
            }});
        }
    }

    const handleCloseUserValidationDialog = () => {
        setUserValDialog(false);
    }

    const handleReview = () => {
        setUserValDialog(true);
        console.log('trigger')
        setUserValDialogTitle('Review');
        setUserValDialogMode(0);
    }

    const handleSubmit = () => {
        setUserValDialog(true);
        console.log('trigger')
        setUserValDialogTitle('Submit');
        setUserValDialogMode(1);
    }

    const handleViewLogs = () => {
        setUserValDialog(true);
        console.log('trigger')
        setUserValDialogTitle('View Logs');
        setUserValDialogMode(2);
    }


    //Handle onChange for Supplier Site
    const suppNameChange = (e) => {
        if (e !== null) {
            e.label === undefined ? setSelectedSupplier('') : setSelectedSupplier(e.label)
        } else {
            setSelectedSupplier('')
        } 
    }

    const supplierSiteChange = (e) => {
        if (e !== null) {
            e.label === undefined ? setSelectedSupplierSite('') : setSelectedSupplierSite(e.label)
        } else {
            setSelectedSupplierSite('') 
        }
    };

    const buChange = (e) => {
        if (e !== null) {
            e.label === undefined ? setSelectedBU('') :  setSelectedBU(e.label)
        } else {
            setSelectedBU('')
        }
        setSelectedSupplierSite('')
    }

    const tegnaSiteChange = (e) => {
        if (e !== null) {
            e.label === undefined ? setSelectedTegnaSite('') :  setSelectedTegnaSite(e.label)
        } else {
            setSelectedTegnaSite('')
        }
    }

    const handleExportCSV = () => {
        dispatch({ type: 'EXPORTCSVVALUES_TRIGGERED', data: {
            isClicked: true
        }});
    }

    useEffect(() => {
        // Export Button toggle hide
        if (state.dataValues !== undefined){
            console.log(state.dataValues.tabledata, 'table data...');
            if (state.dataValues.tabledata === true) {
                setcsvbutState(true)
            } else {
                setcsvbutState(false)
            } 
        }
        // Disable Submit button when record is still processing
        if (state.submitValues !== undefined) {
            let processing = state.submitValues.processing;
            if (processing) {
                setSubmitDisable(true)
            } else {
                setSubmitDisable(false)
            }
        }

        // Disable Review button when record is still processing
        if (state.reviewValues !== undefined) {
            let processing = state.reviewValues.processing;
            if (processing) {
                // console.log('disable buttons')
                setReviewDisable(true)
            } else {
                setReviewDisable(false)
                // console.log('don't disable buttons')
            }
        }

        if (state.dataValues !== undefined) {
            let processing = state.dataValues.processing;
            if (processing) {
                console.log('disable buttons')
                setSearchDisable(true);
            } else {
                console.log('dont disable buttons');
                setSearchDisable(false);
            }
        }

    },[state]);

    return (
        <div className="container mt-4">
            <TimeoutModal
                warningTimes = {warningTimes}
                handleServerError = {handleServerError}
                username = {username}
                jwt = {jwt}
            />

            <UserValidationDialog
                showUserValDialog={showUserValDialog}
                alertTitle={userValDialogTitle}
                handleUserValDialog={handleUserValDialog}
                handleCloseUserValidationDialog={handleCloseUserValidationDialog}
            />

            <ErrorIndicator 
                showError={serverError} 
                statusCode={serverStatusCode} 
                statusText={serverStatusText} 
                errorMessage={serverErrorMessage}
                closeServerError={closeServerError}
            />

            {lovLoadStatus === false ? ('') :
                (
                    <div className="fullpage-preloader">
                        <div className="outer-page">
                            <div className="inner-page text-center">
                                <h5 className="d-inline">Loading</h5>
                                <Spinner className="spinner-position" animation="border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                            </div>
                        </div>
                    </div>
                )
            }
            {!showError === true ? ('')
                :(
                    <Alert className="mt-2" variant="danger"  onClose={() => setShowError(false)} dismissible>
                        <p className="mb-0">{message}</p>
                    </Alert>
                ) 
            }
            <div className="d-flex flex-column flex-md-row bd-highlight">
                <div className="col-md-3 pl-1 pr-0">
                    <Form.Row>
                        <Form.Label className="col-md-5 mt-1 text-md-right text-sm-left p-0">
                            Business Unit
                        </Form.Label>
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                selectedBU.length !== 0 ? (
                                <Tooltip>
                                    <strong>{selectedBU}</strong>
                                </Tooltip>
                                ):
                                (
                                    <Tooltip>...</Tooltip>
                                )
                            }
                        >
                            <Col className="col-md-7">
                                    <Select 
                                        ref = {
                                            ref => selectBURef = ref
                                        }
                                        grouped={false}
                                        minimumInputSearch={0}
                                        onChange={buChange}
                                        options={setBUSearch}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 5,  width: 450}) }}
                                        menuPortalTarget={document.body}
                                        isClearable={true}
                                    />
                            </Col>
                        </OverlayTrigger>
                    </Form.Row>
                    <Form.Row className="mt-2">
                        <Form.Label className="col-md-5 text-md-right mt-1 text-sm-left form-label p-0">
                            Supplier Name
                        </Form.Label>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={
                                selectedSupplier.length !== 0 ? (
                                    <Tooltip>
                                        <strong>{selectedSupplier}</strong>
                                    </Tooltip>
                                ) : 
                                (<Tooltip>...</Tooltip>)
                                
                            }
                        >
                            <Col className="col-md-7">
                                <Select
                                    ref = {
                                        ref => selectSupplierRef = ref
                                    }
                                    grouped={false}
                                    minimumInputSearch={0}
                                    onChange={suppNameChange}
                                    options={setSupplierSearch}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 5,  width: 450}) }}
                                    menuPortalTarget={document.body}
                                    isClearable={true}
                                />
                            </Col>
                        </OverlayTrigger>
                    </Form.Row>
                </div>
                <div className="col-md-3 pl-1 pr-0">
                    <Form.Row>
                        <Form.Label className="col-md-5 mt-1 text-md-right text-sm-left">
                            Supplier Site
                        </Form.Label>
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                selectedSupplierSite.length !== 0 ? (
                                <Tooltip>
                                    <strong>{selectedSupplierSite}</strong>
                                </Tooltip>
                                ):
                                (
                                    <Tooltip>...</Tooltip>
                                )
                            }
                        >
                            <Col className="col-md-7">
                            {
                                (selectedSupplier ===  '') && (selectedBU ===  '') || 
                                (selectedSupplier === '') || (selectedBU === '') ?
                                (
                                    <input className="form-control" disabled="true"/>
                                )
                                :
                                (
                                    <>
                                        {
                                            supplierSiteLoadStatus === true ? 
                                            (
                                                <>
                                                    <input className="form-control" readOnly="true"/>
                                                    <span class="loading-form">
                                                        <div class="loading">Loading</div>
                                                    </span>
                                                </>
                                            ) : 
                                            (
                                                <Select
                                                    ref = {
                                                        ref => selectSupplierSiteRef = ref
                                                    }
                                                    grouped={false}
                                                    minimumInputSearch={0}
                                                    onChange={supplierSiteChange}
                                                    options={setSupplierSiteSearch}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 5, width: 450}) }}
                                                    menuPortalTarget={document.body}
                                                    isClearable={true}
        
                                                />
                                            )
                                        }
                                    </>
                                )
                            }
                            </Col>
                        </OverlayTrigger>
                    </Form.Row>
                    <Form.Row className="mt-2">
                        <Form.Label className="col-md-5 mt-1 text-md-right text-sm-left">
                            TEGNA Site
                        </Form.Label>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={
                                selectedTegnaSite.length !== 0 ? (
                                <Tooltip>
                                    <strong>{selectedTegnaSite}</strong>
                                </Tooltip>
                                ):
                                (
                                    <Tooltip>...</Tooltip>
                                )
                            }
                        >
                            <Col className="col-md-7">
                            <Select
                                grouped={false}
                                minimumInputSearch={0}
                                onChange={tegnaSiteChange}
                                options={setTegnaSearch} 
                                styles={{ menuPortal: base => ({ ...base, zIndex: 5, width: 250}) }} 
                                menuPortalTarget={document.body}
                                isClearable={true}
                            />
                            </Col>
                        </OverlayTrigger>
                    </Form.Row>
                </div>
                <div className="col-md-3 pl-1 pr-0">
                    <Form.Row>
                        <Form.Label className="col-md-7 mt-1 text-md-right text-sm-left">
                            *Invoice From Date
                        </Form.Label>
                        <Col className="col-md-5">
                            <DatePicker
                                className="form-control"
                                selected={invoiceFromDate}
                                onChange={handleInvoiceFromDate}
                            />
                        </Col>
                    </Form.Row>
                    <Form.Row className="mt-2">
                        <Form.Label className="col-md-7 mt-1 text-md-right text-sm-left">
                            *Invoice To Date
                        </Form.Label>
                        <Col className="col-md-5">
                            <DatePicker
                                className="form-control w-100"
                                selected={invoiceToDate}
                                onChange={handeInvoiceToDate}
                                minDate={invoiceFromDate}
                                maxDate={addDays(invoiceFromDate, 30)}
                            />
                        </Col>
                    </Form.Row>
                </div>
                <div className="col-md-3 pl-1 pr-0">
                    <Form.Row >
                        <Form.Label className="col-md-6 mt-1 text-md-right text-sm-left p-0">
                           Invoice Number
                        </Form.Label>
                        <Col className="col-md-6">
                            <Form.Control 
                                type="text"
                                onChange={handleInvoiceNum}
                                onBlur={handleInvoiceNum}
                            />
                        </Col>
                    </Form.Row>
                </div>
            </div>

            <div className="btn-container mb-2 text-center mt-4">
                <div className="btn-search-left">
                    <Button 
                        className="ml-2" 
                        variant="dark"
                        onClick={handleViewLogs}
                        disabled={isReviewDisable || isSubmitDisable}
                        id="viewlogBtn"
                    >
                        View Logs
                    </Button>

                    <Button 
                        className="ml-2" 
                        variant="dark" 
                        onClick={handleExportCSV}
                        style={{display: csvbutState  ? '' : 'none'}}
                        disabled={isReviewDisable || isSubmitDisable}
                    >
                        <i className="fa fa-print"/> Export
                    </Button>
                </div>
              
              
                <Button 
                    className="btn-theme-main" 
                    id="btnSearch" 
                    onClick={handleSearch} 
                    type="button"
                    disabled={isReviewDisable || isSubmitDisable}
                >Search</Button>

                {/* <Button className="ml-3 btn-yellow" onClick={handlePredict}>Predict</Button> Temporarily hide this button */}
                {/* <Button 
                    className="ml-3 btn-theme-main" 
                    onClick={handleReview}
                    disabled={isReviewDisable}
                >Review</Button> */}

                <Button 
                    className="ml-3 btn-theme-main"  
                    onClick={handleSubmit}
                    disabled={isSubmitDisable || isReviewDisable || isSearchDisable}
                >Submit</Button>
            </div>
        </div>
    )
}

export default SearchFields