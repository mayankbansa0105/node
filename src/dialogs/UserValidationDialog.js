import React, {useState, useEffect} from 'react';
import {  Button, Modal } from 'react-bootstrap';

const UserValidationDialog = ({
    showUserValDialog, 
    alertTitle, 
    handleCloseUserValidationDialog,
    handleUserValDialog,
}) => {
    return (
        <Modal 
            show={showUserValDialog}
            backdrop="static"
            dialogClassName="user-validation-modal"
        >
            <Modal.Header>
                <Modal.Title>{alertTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5 className="text-center">Are you sure you want to proceed?</h5>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary" 
                    type="button"
                    onClick={handleUserValDialog}
                    // btnYes ID is being used for timeout reset timer
                    id={alertTitle === 'View Logs' ? "btnDialog" : "btnYes"}
                >YES</Button>
                <Button 
                    variant="dark"
                    onClick={handleCloseUserValidationDialog} 
                    id="btnNo"
                >NO</Button>
            </Modal.Footer>
        </Modal>
    )
}


export default UserValidationDialog;