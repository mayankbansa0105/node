import React, { useState, useContext, useRef } from 'react'
import { useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button, OverlayTrigger, Tooltip, Modal, Alert} from 'react-bootstrap';

import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';

import cellEditFactory, { Type }  from 'react-bootstrap-table2-editor';

import { AppContext } from '../App'
import Cookies from 'js-cookie';

import NewCodeCombiDialog from '../dialogs/NewCodeCombiDialog';
import ErrorIndicator from './ErrorIndicator';

import '../App.css';
import ExportBtnCSV from './ExportBtnCSV';

import axios from 'axios';

import * as moment from "moment";
import 'moment/locale/nl';

import response from '../mocks/sample-response.mock.json';
import searchRes from '../mocks/sample-search.mock.json';

import Papa from 'papaparse'
import myDataset1 from '../../Master Data/segments1.csv';
import myDataset2 from '../../Master Data/segments2.csv';
import myDataset3 from '../../Master Data/segments3.csv';
import myDataset4 from '../../Master Data/segments4.csv';
import myDataset5 from '../../Master Data/segments5.csv';
import myDataset6 from '../../Master Data/segments6.csv';


function Column() {
    const API_URL = window.$API_URL;
    
    const { ExportCSVButton } = CSVExport;
    const {state, dispatch} = useContext(AppContext);

    const selectedRows = useRef([])
    const [isValuesSelected, setIsValuesSelected] = useState(false);
    const [tableLoadFlag, setTableLoadFlag] = useState(true);
    const [tableData, setTableData] = useState([]);

    const nonSelectableKeys = useRef([])
    const nonSelectableArray = useRef([]);

    // Get user details
    const getUserDetails = () => {
        let userValue = '';
        let runtimeValue = '';
        let values = Cookies.get('values');

        if (values !== undefined) {
            let tempValue = JSON.parse(values);
            userValue = tempValue.username;
            runtimeValue = tempValue.runtime;
        }

        return {
            username: userValue,
            runtime: runtimeValue
        }
    };

    // Handles Network Errors
    const [serverError, setServerError] = useState(false);
    const [serverStatusCode, setServerStatusCode] = useState();
    const [serverStatusText, setServerStatusText] = useState();
    const [serverErrorMessage, setServerErrorMessage] = useState();

    const handleServerError = (status = 500, error, errorMessage) => {
        let statusText = 'Server Error';
        let statusCode = status;
        let statusMessage = errorMessage

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
        setTableLoadFlag(true);
    }

    const closeServerError = () => {
        setServerError(false);
    }

    // Modal for Submit
    const [show, setShow] = useState(false);
    const [submitData, setSubmitData] = useState('');
    const handleClose = () => setShow(false);

    // Modal for New Code Combination
    const [tempCompany, setCompany] = useState([]);
    const [tempAccount, setAccount] = useState([]);
    const [tempOrganization , setOrganization ] = useState([]);
    const [tempLocation, setLocation] = useState([]);
    const [tempProduct, setProduct] = useState([]);
    const [tempIntercompany, setIntercompany] = useState([]);

    const [isLoadingSegments, setIsLoadingSegments] = useState(true);
    const [segmentErrorsCatcher, setSegmentErrorsCatcher] = useState([
        {   
            key: 'company',
            value: false,
            errorMsg: '',
        },
        {
            key: 'account',
            value: false,
            errorMsg: '',
        },
        {
            key: 'organization',
            value: false,
            errorMsg: '',
        },
        {
            key: 'location',
            value: false,
            errorMsg: '',
        },
        {
            key: 'product',
            value: false,
            errorMsg: '',
        },
        {
            key: 'interCompany',
            value: false,
            errorMsg: '',
        },
    ]);

    const fieldError = useRef(false);

    const selectCompany = useRef('');
    const selectAccount = useRef('');
    const selectOrganization = useRef('');
    const selectLocation = useRef('');
    const selectProduct = useRef('');
    const selectIntercompany = useRef('');

    const setErrorCatcher = (segmentName, errorMessage) => {
        console.log('setting up error catcher', segmentName);
        setSegmentErrorsCatcher(
            segmentErrorsCatcher.map(item => 
                item.key === segmentName
                ? {...item, value : true, errorMsg: errorMessage} 
                : item 
        ));
        setIsLoadingSegments(false);
    }

    const handleFinalCombiModal = (e,UID) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        console.log(UID)
        let targetIndex = tableData.findIndex(item => item.UID === UID);
        console.log(targetIndex);
        let finalCombiModalVal = tableData[targetIndex].FINAL_COMBI_MODAL;
        console.log(finalCombiModalVal);
        if (!finalCombiModalVal) {
            setTableData(
                tableData.map(item => item.UID === UID ? {...item, FINAL_COMBI_MODAL: true} : item)
            );
        } else {
            setTableData(
                tableData.map(item => item.UID === UID ? {...item, FINAL_COMBI_MODAL: false} : item)
            );
        }
    }

    useEffect(() => {
        Papa.parse(myDataset1, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                setCompany(results.data)
                // console.log(results.data);
            },
            error: function(err, file, inputElem, reason) {
                console.log(err, reason)
            },
        });
        Papa.parse(myDataset2, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                setAccount(results.data)
                // console.log(results.data);
            }
        });
        Papa.parse(myDataset3, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                setOrganization(results.data)
                // console.log(results.data);
            }
        });
        Papa.parse(myDataset4, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                setLocation(results.data)
                // console.log(results.data);
            }
        });

        Papa.parse(myDataset5, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                setProduct(results.data)
                // console.log(results.data);
            }
        });
        Papa.parse(myDataset6, {
            download: true,
            delimiter: "",	
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                setIntercompany(results.data)
                // console.log(results.data);
            }
        });
    },[]);

    const handleSelectCompany = (e) => {
        console.log(e);
        if (e.label !== null) {
            selectCompany.current = e.label;
        }
        
    }

    const handleSelectAccount = (e) => {
        console.log(e);
        if (e.label !== null) {
            selectAccount.current = e.label;
        }
        
    }

    const handleSelectOrganization = (e) => {
        console.log(e);
        if (e.label !== null) {
            selectOrganization.current = e.label;
        }
        
    }

    const handleSelectLocation = (e) => {
        console.log(e);
        if (e.label !== null) {
            selectLocation.current = e.label;
        }
    }

    const handleSelectProduct = (e) => {
        console.log(e);
        if (e.label !== null) {
            selectProduct.current = e.label;
        }
    }

    const handleSelectIntercompany = (e) => {
        console.log(e);
        if (e.label !== null) {
            selectIntercompany.current = e.label;
        }
    }

    const getAllSelect = (e, rowIndex) => {
        let UID = tableData[rowIndex].UID;
        let codeDelimeter = tableData[rowIndex].CODE_COMB_DELIMETER === ('-') ? ('-') : ('.');

        console.log('CODE delimiter', tableData[rowIndex].CODE_COMB_DELIMETER);

        let newCodeCombi = `${selectCompany.current}${codeDelimeter}${selectAccount.current}${codeDelimeter}${selectOrganization.current}${codeDelimeter}${selectLocation.current}${codeDelimeter}${selectProduct.current}${codeDelimeter}${selectIntercompany.current}`;
        // Select new code Combination
        setTableData(
            tableData.map(item => item.UID === UID ? {...item, FINAL_CODE_COMBINATION: newCodeCombi, FINAL_COMBI_MODAL: false} : item)
        );
        // Check wheter also is defined in the selectedRows
        let tempSelectedRows = selectedRows.current.map(item => item.UID === tableData[rowIndex].UID ? {...item, FINAL_CODE_COMBINATION: newCodeCombi}:item);
        console.log(tempSelectedRows);
        selectedRows.current = tempSelectedRows;
    }

    const handleSetLUCC = (e, row) => {
        e.stopPropagation();
        console.log('select value', row);
        setTableData(
            tableData.map(item => item.UID === row.UID ? {...item, FINAL_CODE_COMBINATION: row.LAST_USED_SEG} : item)
        );
        // Check wheter also is defined in the selectedRows
        let tempSelectedRows = selectedRows.current.map(item => item.UID === row.UID ? {...item, FINAL_CODE_COMBINATION: row.LAST_USED_SEG}:item);
        console.log(tempSelectedRows);
        selectedRows.current = tempSelectedRows;
        console.log('New Selected Rows SET LUCC', selectedRows);
    }

    const handleSetPCC = (e,row) => {
        e.stopPropagation();
        console.log('select value', row);
        setTableData(
            tableData.map(item => item.UID === row.UID ? {...item, FINAL_CODE_COMBINATION: row.CODE_COMBINATION} : item)
        )
        // Check wheter also is defined in the selectedRows        
        let tempSelectedRows = selectedRows.current.map(item => item.UID === row.UID ? {...item, FINAL_CODE_COMBINATION: row.CODE_COMBINATION}:item);
        console.log(tempSelectedRows);
        selectedRows.current = tempSelectedRows;
        console.log('New Selected Rows SET PCC', selectedRows);
    }

    useEffect(() => {
        console.log(state, 'search');

        // if (state.predictValues !== undefined && state.dataValues === undefined && state.submitValues === undefined) {
        //     if (state.predictValues.isClicked === true) {
        //         console.log(selectedRows.current);
        //         console.log('to be sent',JSON.stringify(selectedRows.current));
        //         let values = selectedRows.current;

        //         setTableLoadFlag(false);

        //         axios.post(`${API_URL}/get_prediction_data&username=${getUserDetails().username}&jwt=${getUserDetails().runtime}`,values)
        //             .then(res => {
        //                 console.log(res);
        //                 console.log(res.data);
        //                 let data = res.data;
        //                 console.log(data);
        //                 if (data[0] !== undefined) {
        //                     populateMLOutput(data);
        //                 } else {
        //                     console.log('Something went wrong...');
        //                     handleServerError(res, data.result);
        //                 }
        //             }).then(() => {
        //                 setTableLoadFlag(true);
        //             }).catch(error => {
        //                 setTableLoadFlag(true);
        //                 handleServerError(error, 'An error occured, Please contact administrator for assistance.');
        //             });
        //     }
        // }

        // Search Process
        if (state.dataValues !== undefined && state.reviewValues === undefined && state.submitValues === undefined) {
            if (state.dataValues.isClicked === true) {
                selectedRows.current = [];
                setTableLoadFlag(false);
                // Reset Table Values
                setTableData([]);
                nonSelectableKeys.current = [];
                nonSelectableArray.current = [];

                console.log('flag before click',tableLoadFlag);
                // Search Values
                let dataValues = state.dataValues;
                let bu = dataValues.bu;
                let supplier = dataValues.supplier;
                let supplierSite = dataValues.supplierSite;
                let invoiceFromDate = dataValues.invoiceFromDate;
                let invoiceToDate = dataValues.invoiceToDate;
                let invoiceNum = dataValues.invoiceNum;
                let tegnaSite = dataValues.tegnaSite;
                let username = dataValues.username;
                let runtime = dataValues.runtime;

                // setTimeout(() => {
                //     populateTableData(response);
                //     setTableLoadFlag(true);
                // }, 3000)

                axios.get(`${API_URL}/get_invoice_data?supplier_name=${supplier}&supplier_site=${supplierSite}&business_unit=${bu}&invoice_from_date=${invoiceFromDate}&invoice_to_date=${invoiceToDate}&tegna_Site=${tegnaSite}&invoice_num=${invoiceNum}`,
                    {
                        headers: {
                            username: username,
                            runtime: runtime
                        }
                    }).then(res => {
                        let data = res.data;
                        let statusCode = data.status_code;
                        if (statusCode === 200) {
                            populateTableData(JSON.parse(data.response));
                        } else {
                            let errorMsg = data.error_msg;
                            handleServerError(statusCode, '', errorMsg);
                            // Flag to disable buttons for search process
                            dispatch({ type: 'DATAVALUES_TRIGGERED', data: {
                                processing: false,
                            }});
                        }
                        console.log('hooks',data);
                        setTableLoadFlag(true);
                    }).catch(error => {
                        handleServerError('', error, 'An error occured, Please contact administrator for assistance.');
                        // Flag to disable buttons for search process
                        dispatch({ type: 'DATAVALUES_TRIGGERED', data: {
                            processing: false,
                        }});
                    });
            }
        }
        // Submit Process
        if (state.submitValues !== undefined && state.reviewValues === undefined && state.dataValues === undefined) {
            if (state.submitValues.isClicked === true) {
                if (!selectedRows.current.length) {
                    console.log('no selected rows');
                    setIsValuesSelected(false);
                    setShow(true);

                    // Flag to set the submit button to be enabled
                    dispatch({type: 'SUBMIT_TRIGGERED', data: {
                        processing: false,
                    }})

                } else {
                    setTableLoadFlag(false);
                    setIsValuesSelected(true);
                    console.log(tableData);
                    let newArr = processSelectedRows();
                    console.log('to be sent for submit', JSON.stringify(newArr));
                    // setHiddenRows(tempHiddenRows.current);
                    // &username=${getUserDetails().username}&runtime=${getUserDetails().runtime
                    console.log(nonSelectableKeys);
                    // Submit Values
                    let submitValues = state.submitValues;
                    let username = submitValues.username;
                    let runtime = submitValues.runtime;
                    axios.post(`${API_URL}/update_invoice_dist_code`,newArr,
                    {
                        headers : {
                            username: username,
                            runtime: runtime
                        }
                    }).then(res => {
                            let data = res.data;
                            console.log(res);
                            console.log(res.data);
                            let statusCode = data.status_code;
                            if (parseInt(statusCode) === 200) {
                                let output = JSON.parse(data.response)
                                let submitMessage = '';
                                for(let key in output) {
                                    submitMessage = output[key].Output;
                                }
                                selectedRows.current = [];
                                nonSelectableArray.current = nonSelectableKeys.current
                                console.log(nonSelectableArray);
                                setSubmitData(submitMessage);
                                setShow(true);
                                //Selected check CSV
                                checkedCSV()
                            } else {
                                let errorMsg = data.error_msg;
                                handleServerError(statusCode,'', errorMsg);
                            }

                            setTableLoadFlag(true);
                            // Flag to set the submit button to be enabled
                            dispatch({type: 'SUBMIT_TRIGGERED', data: {
                                processing: false,
                            }})
                            // console.log(hiddenRows.current);
                        }).catch(error => {
                            handleServerError('',error, 'An error occured, Please contact administrator for assistance.');

                            // Flag to set the submit button to be enabled
                            dispatch({type: 'SUBMIT_TRIGGERED', data: {
                                processing: false,
                            }})
                        });
                }
            }
        }

        // Review Process
        if (state.reviewValues !== undefined && state.submitValues === undefined && state.dataValues === undefined) {
            if (state.reviewValues.isClicked === true) {
                console.log('Process here review values', 'hello');
                if (!selectedRows.current.length) {
                    setIsValuesSelected(false);
                    setShow(true);

                    dispatch({type: 'REVIEW_TRIGGERED', data: {
                        processing: false,
                    }})

                } else {
                    setTableLoadFlag(false);
                    setIsValuesSelected(true);

                    let reviewValues = state.reviewValues;
                    let username = reviewValues.username;
                    let runtime = reviewValues.runtime;

                    let newArr = processSelectedRows();
                    
                    console.log('to be sent for review', JSON.stringify(newArr));
                    console.log(nonSelectableKeys);

                    
                    // setTimeout(() => {
                    //     nonSelectableArray.current = nonSelectableKeys.current
                    //     selectedRows.current = [];
                    //     setSubmitData('Success!');
                    //     setShow(true);
                    //     setTableLoadFlag(true);
                    //     dispatch({type: 'REVIEW_TRIGGERED', data: {
                    //         processing: false,
                    //     }})

                    // }, 3000);

                    axios.post(`${API_URL}/review_invoice_dist_code`,newArr,
                    {
                        headers : {
                            username: username,
                            runtime: runtime
                        }
                    }).then(res => {
                            let data = res.data;
                            console.log(res);
                            console.log(res.data);

                            let statusCode = data.status_code;
                            if (parseInt(statusCode) === 200) {
                                let output = JSON.parse(data.response)
                                let submitMessage = '';
                                for(let key in output) {
                                    submitMessage = output[key].Output;
                                }
                                selectedRows.current = [];
                                nonSelectableArray.current = nonSelectableKeys.current
                                console.log(nonSelectableArray);
                                setSubmitData(submitMessage);
                                setShow(true);
                                //Selected check CSV
                                checkedCSV()
                            } else {
                                let errorMsg = data.error_msg;
                                handleServerError(statusCode,'', errorMsg);
                                 // Flag to set the buttons to be enabled
                                dispatch({type: 'REVIEW_TRIGGERED', data: {
                                    processing: false,
                                }});
                            }
                            setTableLoadFlag(true);
                        }).catch(error => {
                            console.log(error);
                            handleServerError('',error, 'An error occured, Please contact administrator for assistance.');
                            // Flag to set the buttons to be enabled
                            dispatch({type: 'REVIEW_TRIGGERED', data: {
                                processing: false,
                            }});
                        });
                }
            }
        }

    },[state.dataValues, state.reviewValues, state.submitValues])

    const checkedCSV = () => {
        let arr = [];
        arr = tableData
        arr.map((currElement, index) => {
            console.log(currElement)
                console.log(currElement.UID)
            if(nonSelectableArray.current.indexOf(currElement.UID) !== -1 ){
                currElement.CHECK_DATA = 'Y';
            }
        });
        setTableData(arr)
    }
    // Process to determine the payload object keys and get the UID values to be the non selectable keys.
    const processSelectedRows = () => {
        let newArr = [];
        for(let i = 0; i<selectedRows.current.length; i++) {
            let values = selectedRows.current[i];
            newArr[i] = {
                BU_NAME: values['BU_NAME'],
                CURRENT_DIST_COMB: values['CURRENT_DIST_COMB'],
                CURRENT_DIST_DISC: values['CURRENT_DIST_DISC'],
                DISTRIBUTION_LINE_NUMBER: values['DISTRIBUTION_LINE_NUMBER'],
                INVOICE_DATE: values['INVOICE_DATE'],
                INVOICE_DISTRIBUTION_ID: values['INVOICE_DISTRIBUTION_ID'],
                INVOICE_ID: values['INVOICE_ID'],
                INVOICE_NUM: values['INVOICE_NUM'],
                LAST_USED_DESCRIPTION: values['LAST_USED_DESCRIPTION'],
                LAST_USED_SEG: values['LAST_USED_SEG'],
                LINE_AMOUNT: values['LINE_AMOUNT'],
                LINE_DESCRIPTION: values['LINE_DESCRIPTION'],
                LINE_NUMBER: values['LINE_NUMBER'],
                LINE_TYPE: values['LINE_TYPE'],
                NEWREC: values['NEWREC'],
                ORGANIZATION_ID: values['ORGANIZATION_ID'],
                SUPPLIER_NAME: values['SUPPLIER_NAME'],
                SUPPLIER_SITE:values['SUPPLIER_SITE'],
                SUPPLIER_TYPE: values['SUPPLIER_TYPE'],
                TEGNA_SITE: values['TEGNA_SITE'],
                RESPONSE: values['RESPONSE'],
                TASKNUMBER: values['TASKNUMBER'],
                FINAL_CODE_COMBINATION: values['FINAL_CODE_COMBINATION']
            }
            nonSelectableKeys.current = [...nonSelectableKeys.current, values['UID']]
        }
        return newArr;
    }

    const generateUID = (invoiceId, lineNumber, invoiceDistributionId) => {
        return (
            `${invoiceId}-${lineNumber}-${invoiceDistributionId !== null ? invoiceDistributionId : ''}`
        )
    }

    const populateTableData = (data) => {
        let newArr = [];
        for(let key in data) {
            let tempValue = data[key];
            //Set Check data field
            tempValue['CHECK_DATA'] =  'N';
            // Set Last Used Segment as Default FCC
            (tempValue['LAST_USED_SEG'] === null || tempValue['LAST_USED_SEG'] === undefined) ? 
                (tempValue['FINAL_CODE_COMBINATION'] = null) : 
                (tempValue['FINAL_CODE_COMBINATION'] = tempValue['LAST_USED_SEG']);
            // Generate UID
            tempValue['UID'] = generateUID(tempValue['INVOICE_ID'], tempValue['LINE_NUMBER'], tempValue['INVOICE_DISTRIBUTION_ID']);
            // Dialog Flag Openers
            tempValue['FINAL_COMBI_MODAL'] = false;
            newArr.push(tempValue);
        };
        console.log(newArr)
        setTableData(newArr);
        //Check if table has data to display export button
        if(newArr.length !== 0){
            dispatch({ type: 'DATAVALUES_TRIGGERED', 
                data: {
                    tabledata: true,
                    processing: false,
                }
            });
        } else {
            dispatch({ type: 'DATAVALUES_TRIGGERED', 
                data: {
                    tabledata: false,
                    processing: false,
                }
            });
        }
    };

    const populateMLOutput = (data) => {
        let newArr = [];
        for (let key in data) {
            newArr.push(data[key]);
        }
        
        newArr.forEach(value => {
            let tempValue = value;
            
            let invoiceId = tempValue['INVOICE_ID'];
            let lineNumber = tempValue['LINE_NUMBER'];

            // Default the LUCC as FCC Value
            if (tempValue['LAST_USED_SEG'] !== null || tempValue['LAST_USED_SEG'] !== undefined) {
                tempValue['FINAL_CODE_COMBINATION'] = tempValue['LAST_USED_SEG'];
            }

            // Find the index from the table that will be updated
            let targetIndex = tableData.findIndex(tableVal => (tableVal.INVOICE_ID === invoiceId && tableVal.LINE_NUMBER === lineNumber));
            console.log('UPDATE ML OUTPUT INDEX: ', targetIndex);
            
            // Ammend the missing values from the response payload
            tempValue['INVOICE_DISTRIBUTION_ID'] = tableData[targetIndex].INVOICE_DISTRIBUTION_ID;
            tempValue['UID'] = tableData[targetIndex].UID;

            console.log(tempValue);
            tableData[targetIndex] = tempValue;
        })
        console.log(tableData);
        setTableData(tableData);
    };

    const NoDataIndication = () => (
        <div className="table-no-data"></div>
    );

    const fixHeaderEmptyTable  =  (style) =>{
        if (!tableData.length) {
            style['position'] = 'relative';
            style['left'] = 0;
        }
        return style;
    }
    const columns = [
        {
            dataField: 'CHECK_DATA',
            text: 'Processed Flag',
            hidden: true,
        },
        {
            dataField: 'BU_NAME',
            text: 'Business Unit',
            editable: false,
            sort: true,
            style: (cell, row, rowIndex, colIndex) => {
                return {  
                    'word-break': 'break-all',
                    'text-align': 'left' 
                }
            },
            headerStyle: (col, colIndex) => {
                let style = {
                    width: '110px',
                }
                return (fixHeaderEmptyTable(style))
            },
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'SUPPLIER_NAME',
            text: 'Supplier Name',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                let style =  {
                    width: '150px'
                }

                return (fixHeaderEmptyTable(style))
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'TEGNA_SITE',
            text: 'TEGNA Site',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'center'
                }
            },
            headerStyle: (col, colIndex) => {
                let style = {
                    width: '80px'
                }
                return (fixHeaderEmptyTable(style))
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'INVOICE_NUM',
            text: 'Invoice No.',
            editable: false,
            sort: true,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                let style =  {
                    width: '100px'
                }

                return (fixHeaderEmptyTable(style))
            },
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'LINE_NUMBER',
            text: 'Line No.',
            editable: false,
            sort: true,
            headerStyle: (col, colIndex) => {
                let style = {
                    width: '50px',
                    'text-align': 'left',
                };

                return (fixHeaderEmptyTable(style)) 
            },
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'center',
                }
            },
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            text: 'Distribution No.',
            dataField: 'DISTRIBUTION_LINE_NUMBER',
            editable: false,
            headerStyle: (col, colIndex) => {
                let style = {
                    width: '80px'
                };
                
                return  (fixHeaderEmptyTable(style));
            },
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'center',
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'SUPPLIER_SITE',
            text: 'Supplier Site',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                let style = {
                    width: '110px'
                }
                return (fixHeaderEmptyTable(style));
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        }, 
        {
            dataField: 'INVOICE_DATE',
            text: 'Invoice Date',
            editable: false,
            formatter: (cell) => {
                return moment(cell).format('MM/DD/YYYY');
            },
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '120px'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            text: 'Line Type',
            dataField: 'LINE_TYPE',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '70px',
                    'text-align': 'left'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'LINE_DESCRIPTION',
            text: 'Line Description',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'CODE_COMB_DELIMETER',
            hidden: true,
            csvExport : false,
        },
        {
            text: 'Current Invoice Distribution (CID)',
            dataField: 'CURRENT_DIST_COMB',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            text: 'CID Description',
            dataField: 'CURRENT_DIST_DISC',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {   
            dataField: 'LAST_USED_SEG',
            text: 'Last Used Code Combination',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },

        {
            dataField: 'LAST_USED_DESCRIPTION',
            text: 'Last Used Code Combination Description',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {   
            text: 'Set LUCC',
            csvExport : false,
            formatter: (cell, row, rowIndex) => {
                if (typeof row.LAST_USED_SEG !== 'undefined' && row.LAST_USED_SEG) {
                    return (
                        <div className="final-code-container">
                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Populate LUCC as FCC</Tooltip>}>
                                <button class="btn btn-info" onClick={(e) => handleSetLUCC(e,row)}><i class="fa fa-edit"></i></button>
                            </OverlayTrigger>
                        </div>
                    )
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '60px'
                }
            },
            editable: false,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {   
            dataField: 'CODE_COMBINATION',
            text: 'Predicted Code Combination',
            csvExport : false,
            editable: false,
            hidden: true,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
        },
        {   
            dataField: 'CODE_COMBINATION_DESC',
            text: 'Predicted Code Combination Description',
            csvExport : false,
            hidden: true,
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '180px'
                }
            },
            sort: true,
        },
        {
            text: 'Set PCC',
            csvExport : false,
            hidden: true,
            formatter: (cell, row, rowIndex) => {
                if (typeof row.CODE_COMBINATION !==  'undefined' && row.CODE_COMBINATION) {
                    return(
                        <div className="final-code-container">
                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Populate PCC as FCC</Tooltip>}>
                                        <button class="btn btn-info" onClick={(e)=>handleSetPCC(e,row)}><i class="fa fa-edit"></i></button>
                            </OverlayTrigger>
                        </div>
                    )
                }
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '60px'
                }
            },
            editable:false,
        },
        {
            dataField: 'Probability',
            text: 'Probability',
            csvExport : false,
            hidden: true,
            headerStyle: (col, colIndex) => {
                return {
                    width: '70px'
                }
            },
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            editable: false,
            sort: true,
        },
        {
            text: 'Final Code Combination',
            dataField: 'FINAL_CODE_COMBINATION',
            formatter: (cell, row, rowIndex) => {
                    return (
                        <div className="final-code-container">
                            <input 
                                style={{width: '277px'}}
                                className="form-control"
                                value={row.FINAL_CODE_COMBINATION}
                            />
                            <OverlayTrigger overlay={<Tooltip>Enter Final Code Combination</Tooltip>}>
                                <button 
                                    className="btn btn-info ml-1" 
                                    onClick={(e)=> handleFinalCombiModal(e,row.UID)}
                                >
                                    <i class="fa fa-bars"></i>
                                </button>
                            </OverlayTrigger>
                            <NewCodeCombiDialog
                                handleSelectCompany = {handleSelectCompany} 
                                handleSelectAccount = {handleSelectAccount}
                                handleSelectOrganization = {handleSelectOrganization}
                                handleSelectLocation = {handleSelectLocation}
                                handleSelectProduct = {handleSelectProduct}
                                handleSelectIntercompany={handleSelectIntercompany}
                                getAllSelect = {(e) => getAllSelect(e,rowIndex)}
                                finalCodeDelimeter = {row.CODE_COMB_DELIMETER}
                                finalCombiValue = {row.FINAL_CODE_COMBINATION}
                                showFinalCombiModal = {row.FINAL_COMBI_MODAL}
                                handleFinalCombiModal = {(e) => handleFinalCombiModal(e,row.UID)}
                                fieldError= {fieldError}
                                tempCompany = {tempCompany}
                                tempAccount = {tempAccount}
                                tempOrganization = {tempOrganization}
                                tempLocation = {tempLocation}
                                tempProduct = {tempProduct}
                                tempIntercompany = {tempIntercompany}
                                isLoadingSegments = {isLoadingSegments}
                                segmentErrorsCatcher = {segmentErrorsCatcher}
                            />
                        </div>
                    )
            },
            headerStyle: (col, colIndex) => {
                return {
                    width: '345px'
                }
            },
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            sort: true,
            editable:true,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => { 
                    // console.log(e, 'stopping the selection');
                    // IMPORTANT WORKAROUND: Prevent the event select/unselect the rows when the column 
                    // is being clicked
                    e.stopPropagation();
                },
            }
        },
        {
            dataField: 'TASKNUMBER',
            csvExport : false,
            hidden: true,
        },
        {
            dataField: 'RESPONSE',
            csvExport : false,
            hidden: true,
        }

    ];
    const selectRow = {
        mode: 'checkbox',
        clickToSelect: true,
        clickToEdit: true,
        selectionRenderer: ({ mode, ...rest }) => {
            // console.log(rest)
            if (nonSelectableArray.current.indexOf(rest.rowKey) !== -1) {
                console.log(rest);
                let tempRest = rest;
                tempRest.disabled = true
                tempRest.checked = true
                return (
                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Record has been processed</Tooltip>}>
                        <span className="d-inline-block">
                            <input type={ mode } { ...tempRest } style={{ pointerEvents: 'none' }}/>  
                        </span>
                    </OverlayTrigger>
                )
            } else {
                return <input type={ mode } { ...rest } />
            }
        },
        onSelect: (row, isSelect, rowIndex, e) => {
            console.log(row);
            console.log(isSelect);
            console.log(rowIndex);
            console.log(e);
            
            if (isSelect === true && (nonSelectableArray.current.indexOf(row.UID) === -1)) {
                selectedRows.current = [...selectedRows.current, row];
            } else if (isSelect === false) {
                let targetIndex = selectedRows.current.findIndex(value => value.UID === row.UID);
                selectedRows.current.splice(targetIndex, 1);
            }
        },
        onSelectAll: (isSelect, row) => {
            console.log(isSelect, 'selecte boolean')
            console.log(row, 'row values')
            if (isSelect) {
                row.forEach(value => {
                    let targetIndex = selectedRows.current.findIndex(item => item.UID === value.UID);
                    console.log(targetIndex);
                    if (targetIndex === -1 && nonSelectableArray.current.indexOf(value.UID) === -1) {
                        selectedRows.current = [...selectedRows.current, value];
                    }
                });
            }
            else {
                console.log('to be removed')
                selectedRows.current = [];
            }
            console.log(selectedRows.current)
        }
    };

    const rowStyle = (row, rowIndex) => {
        if (rowIndex % 2 === 1) {
            return  {backgroundColor: '#ccc'};
        } else {
            return  {backgroundColor: 'white'};
        }
    };

    return (
        <div className="table-container mt-3">
            {serverError === true ? (
                <ErrorIndicator 
                    showError={serverError} 
                    statusCode={serverStatusCode} 
                    statusText={serverStatusText} 
                    errorMessage={serverErrorMessage}
                    closeServerError={closeServerError}
                />) : ('')
            }

            {tableData.length ? 
               (    
                <>
                    <ToolkitProvider
                        keyField="UID"
                        data={ tableData }
                        columns={ columns }
                        exportCSV
                    >

                        {
                            props => (
                                <span>
                                    <ExportBtnCSV props ={props} state={state.exportCSVValues} />
                                    <div className="parent-header">
                                        <div className="search-result" style={!tableLoadFlag ? {'width': '2390px'}:{'width': '1861px' }}>
                                            <h5 className="text-center mt-2">Search Results</h5>
                                        </div>
                                        {/* <div className="ml-output" style={{ 'width': '550px' }}>
                                            <h5 className="text-center mt-2">ML Output</h5>
                                        </div> */}
                                        <div className="final-code" style={!tableLoadFlag? {'width': '220px'} :{ 'width': '346px' }}>
                                            <h5 className="text-center mt-2">Final Code</h5>
                                        </div>
                                    </div>
                                    <BootstrapTable
                                        id="search-table"
                                         { ...props.baseProps }
                                        keyField='UID'
                                        bootstrap4
                                        className="table-responsive"
                                        loading = { !tableLoadFlag }
                                        data={ tableData } 
                                        columns={ columns }
                                        selectRow={ selectRow }
                                        cellEdit={ cellEditFactory({ 
                                            mode: 'click', 
                                            blurToSave: true,
                                        })}
                                        overlay={ overlayFactory({ spinner: true, 
                                            styles: { 
                                                overlay: (base) => ({...base, background: 'rgba(52, 58, 64, 0.51)'}),
                                            } 
                                        }) }
                                        rowStyle={ rowStyle }
                                    />
                                </span>
                            )
                        }
                    </ToolkitProvider> 
                </>
               ) 
               :
               (
                <>
                    <div className="parent-header">
                        <div className="search-result" style={!tableLoadFlag ? { 'width': '2196px' } : {}}>
                            <h5 className="text-center mt-2">Search Results</h5>
                        </div>
                        {/* <div className="ml-output">
                            <h5 className="text-center mt-2">ML Output</h5>
                        </div> */}
                        <div className="final-code"  style={!tableLoadFlag ? { 'width': '413px' } : {}}>
                            <h5 className="text-center mt-2">Final Code</h5>
                        </div>
                    </div>
                    <BootstrapTable
                        id="search-table" 
                        keyField="UID"
                        className="table-responsive"
                        loading = { !tableLoadFlag }
                        columns={ columns }
                        data={[]}
                        noDataIndication={ () => <NoDataIndication /> }
                        overlay={ overlayFactory({ spinner: true, 
                            styles: { 
                                overlay: (base) => ({...base, background: 'rgba(52, 58, 64, 0.51)'}),
                            } 
                        }) }
                    />
                </>
               )
            }

            <Modal 
                show={show} 
                onHide={handleClose}
                dialogClassName="submit-modal"
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Alert</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-body">
                            {
                                isValuesSelected === false ? 
                                (
                                    <h5 className="mb-0 text-danger">No rows have been selected to process.</h5>
                                )
                                :
                                (
                                    <>
                                        <h5 className="mb-0 text-success">{submitData}</h5>
                                    </>
                                )
                            }
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Column;