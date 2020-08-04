import React, { useState, useContext, useRef } from 'react'
import { useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button, OverlayTrigger, Tooltip, Modal, Alert} from 'react-bootstrap';

import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';


import cellEditFactory, { Type }  from 'react-bootstrap-table2-editor';
import { AppContext } from '../App'
import '../App.css';
import axios from 'axios';
import * as moment from "moment";
import 'moment/locale/nl';

import viewLogsRes from '../mocks/view-log-values.mock.json';
import ErrorIndicator from './ErrorIndicator';

function ColumnLogs() {
    const API_URL = window.$API_URL;
    const {state, dispatch} = useContext(AppContext);
    const [username, setUsername] = useState('');
    const [tableLoadFlag, setTableLoadFlag] = useState(true);
    const [tableData, setTableData] = useState([]);

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

    useEffect(() => {
        console.log(state)
        if (state.viewLogValues !== undefined) {
            if (state.viewLogValues.isClicked === true) {
                console.log('fetch data');
                let dataValues = state.viewLogValues;
                let username = dataValues.username;
                let runtime = dataValues.runtime;
                let toSubDate = dataValues.submissionToDate;
                let fromSubDate = dataValues.submissionFromDate;
                let status = dataValues.status;
                let requestID = dataValues.requestID;

                setUsername(username);
                
                setTableLoadFlag(false);
                axios.get(`${API_URL}/get_request_id_data`,
                {
                    headers: {
                        username: username,
                        runtime: runtime,
                        FromSubDate: fromSubDate,
                        ToSubDate: toSubDate,
                        RequestID: requestID,
                        Status: status
                    }
                }).then(res => {
                    let data = res.data;
                    let statusCode = data.status_code;
                    console.log(statusCode);
                    if (parseInt(statusCode) === 200) {
                        console.log(JSON.parse(data.response));
                        populateTableData(JSON.parse(data.response));
                    } else {
                        let errorMsg = data.error_msg;
                        handleServerError(statusCode, '', errorMsg);
                    }
                    console.log('hooks',data);
                    setTableLoadFlag(true);
                }).catch(error => {
                    console.log(error);
                    handleServerError('', error, 'An error occured, Please contact administrator for assistance.');
                });


                // setTimeout(() => {
                //     setTableData(viewLogsRes);
                //     setTableLoadFlag(true);
                // }, 3000);
            }
        }
    }, [state.viewLogValues])

    const populateTableData = (data) => {
        let newArr = [];
        for (let key in data) {
            newArr.push(data[key]);
        }
        console.log(newArr);
        setTableData(newArr);
        console.log(tableData);
    };

    const handleDownload = (row) => {
        console.log('hanlde download');
          axios.get(`${API_URL}/get_submit_logs_data`,
                {
                    headers: {
                        username: username,
                        request_id: row.REQUEST_ID,
                    },
                    responseType: 'blob'
                },
                ).then(res => {
                    let data = res.data;
                    console.log(res);
                    console.log('hooks',data);

                    const url = window.URL.createObjectURL(new Blob([data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'AID Logs Report.csv'); //or any other extension
                    document.body.appendChild(link);
                    link.click();

                }).catch(error => {
                    console.log(error);
                    handleServerError('',error, 'An error occured, Please contact administrator for assistance.');
                });
    }

    const NoDataIndication = () => (
        <div className="table-no-data"></div>
    );

    const columns = [
        {
            dataField: 'REQUEST_NAME',
            text: 'Process Name',
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
                    width: '70px',
                    background: '#636669',
                    color: 'white',
                }
                return (style)
            },
        },
        {
            dataField: 'REQUEST_ID',
            text: 'Request ID',
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
                    width: '70px',
                    background: '#636669',
                    color: 'white',
                }
                return (style)
            },
        },
        {
            dataField: 'STATUS',
            text: 'Status',
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
                    width: '70px',
                    background: '#636669',
                    color: 'white',
                }
                return (style)
            },
        }, 
        {
            dataField: 'START_DATE',
            text: 'Submission Date',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                let style =  {
                    width: '70px',
                    background: '#636669',
                    color: 'white',
                }
                return (style)
            },
            formatter: (cell) => {
                let value = '';
                if (cell !== null) {
                    value = moment(cell).format('MM/DD/YYYY hh:mm:ss')
                }
                return (value);
            },
            sort: true
        },
        {
            dataField: 'END_DATE',
            text: 'Completion Date',
            editable: false,
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'left'
                }
            },
            headerStyle: (col, colIndex) => {
                let style =  {
                    width: '70px',
                    background: '#636669',
                    color: 'white',
                }
                return (style)
            },
            formatter: (cell) => {
                let value = '';
                if (cell !== null) {
                    value = moment(cell).format('MM/DD/YYYY hh:mm:ss')
                }
                return (value);
            },
            sort: true
        },
        {
            dataField: 'Download',
            text: 'Download',
            editable: false,
            formatter: (cell, row, rowIndex) => {
                return (
                    <div className="download-container">
                         <OverlayTrigger overlay={<Tooltip>Download</Tooltip>}>
                            <button className="btn btn-info" onClick={(e) => {
                                handleDownload(row); 
                                e.stopPropagation();
                            }}>
                                <i className="fa fa-download"/>
                            </button>
                         </OverlayTrigger>
                    </div>
                )
            },
            style: (cell, row, rowIndex, colIndex) => {
                return {
                    'word-break': 'break-all',
                    'text-align': 'center'
                }
            },
            headerStyle: (col, colIndex) => {
                let style = {
                    width: '70px',
                    background: '#636669',
                    color: 'white',
                }
                return (style)
            },
        },
    ];

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
            {tableData.length ? (
                <>
                    <BootstrapTable
                        id="view-logs-table"
                        keyField='REQUEST_ID'
                        bootstrap4
                        className="table-responsive"
                        loading = { !tableLoadFlag }
                        data={ tableData } 
                        columns={ columns }
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
                </>
            ): (
                <BootstrapTable
                        id="view-logs-table"
                        keyField='REQUEST_ID'
                        bootstrap4
                        className="table-responsive"
                        loading = { !tableLoadFlag }
                        data={[]} 
                        columns={ columns }
                        noDataIndication={ () => <NoDataIndication /> }
                        overlay={ overlayFactory({ spinner: true, 
                            styles: { 
                                overlay: (base) => ({...base, background: 'rgba(52, 58, 64, 0.51)'}),
                            } 
                        }) }
                        rowStyle={ rowStyle }
                    />
            )
        }
        </div>
    );
}

export default ColumnLogs;