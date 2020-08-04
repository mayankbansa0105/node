import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const  ErrorIndicator = ({showError,statusCode, statusText, errorMessage, closeServerError}) =>{
    return (
        <div>
            <Modal 
                show={showError} onHide={closeServerError}
                dialogClassName="error-indicator-modal"
                backdrop="static"
            >
            <Modal.Header closeButton>
                <Modal.Title>Oops - {statusCode} : {statusText}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div class="message-container">
                    <h5>{errorMessage}</h5>
                </div>
            </Modal.Body>
        </Modal>
    </div>
    )
}

export default ErrorIndicator
