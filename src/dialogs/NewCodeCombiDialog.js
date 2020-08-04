import React, {useState, useEffect} from 'react'
import { Form, Col, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select-virtualized';

const NewCodeCombiDialog = ({
    handleSelectCompany,
    handleSelectAccount, 
    handleSelectOrganization,
    handleSelectLocation,
    handleSelectProduct,
    handleSelectIntercompany,
    getAllSelect, 
    finalCombiValue, 
    showFinalCombiModal,
    handleFinalCombiModal,
    fieldError,
    tempCompany,
    tempAccount,
    tempOrganization,
    tempLocation,
    tempProduct,
    tempIntercompany,
    isLoadingSegments,
    segmentErrorsCatcher,
    finalCodeDelimeter
}) => {
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const selectModals = () => {
        console.log(segmentErrorsCatcher);
        for (let key in segmentErrorsCatcher) {
            if (segmentErrorsCatcher[key].value === true) {
                console.log('error detected')
                setIsError(true);
                setErrorMsg(segmentErrorsCatcher[key].errorMsg);
                break;
            }
        }
    }

    const segmentCSVSmap = tempCompany.map((currElement, index) => {
        return {'label' :currElement.SEGMENT_VALUE, 'value' : index }
    });

    const segmentCSVSmap2 = tempAccount.map((currElement, index) => {
        return {'label' :currElement.SEGMENT_VALUE, 'value' : index }
    });

    const segmentCSVSmap3 = tempOrganization.map((currElement, index) => {
        return {'label' :currElement.SEGMENT_VALUE, 'value' : index }
    });

    const segmentCSVSmap4 = tempLocation.map((currElement, index) => {
        return {'label' :currElement.SEGMENT_VALUE, 'value' : index }
    });

    const segmentCSVSmap5 = tempProduct.map((currElement, index) => {
        return {'label' :currElement.SEGMENT_VALUE, 'value' : index }
    });

    const segmentCSVSmap6 = tempIntercompany.map((currElement, index) => {
        return {'label' :currElement.SEGMENT_VALUE, 'value' : index }
    });

    const [companyDescription, setCompanyDesc] = useState('');
    const [accountDescription, setAccountDesc] = useState('');
    const [organizationDescription, setOrgDesc] = useState('');
    const [locationDescription, setLocationDesc] = useState('');
    const [productDescription, setProductDesc] = useState('');
    const [interCompanyDescription, setInterCompanyDesc] = useState('');

    const [tempCompVal, setCompVal] = useState('');
    const [tempAcctVal, setAcctVal] = useState(''); 
    const [tempOrgVal, setOrgVal] = useState(''); 
    const [tempLocVal, setLocVal] = useState(''); 
    const [tempProdVal, setProdVal] = useState(''); 
    const [tempInterCompVal, setInterCompVal] = useState(''); 

    const checkFinalCombiExists = (finalCombiValue) => {
        let isExists = true;
        if (finalCombiValue === undefined || finalCombiValue === null) {
            isExists = false;
        }
        return isExists;
    }

    const determineSegment = (index, e) => {
        if (index === 0) {
            handleCompanyDesc(e);
            handleSelectCompany(e);
        } else if (index === 1) {
            handleAccountDesc(e);
            handleSelectAccount(e);
        } else if (index === 2) {
            handleOrgDesc(e);
            handleSelectOrganization(e);
        } else if (index === 3) {
            handleLocationDesc(e);
            handleSelectLocation(e);
        } else if (index === 4) {
            handleProductDesc(e);
            handleSelectProduct(e);
        } else if (index === 5) {
             handleInterCompDesc(e);
             handleSelectIntercompany(e);
        }
    }

    const determineSegmentArr = (index) => {
        let array;
        if (index === 0) {
            array = tempCompany;
        } else if (index === 1) {
            array = tempAccount;
        } else if (index === 2) {
            array = tempOrganization;
        } else if (index === 3) {
            array = tempLocation;
        } else if (index === 4) {
            array = tempProduct;
        } else if (index === 5) {
            array = tempIntercompany;
        }
        return array;
    }

    const setDefaultVal = (finalCombiValue, index) => {
        let tempLabel = '';
        let tempValue = '';

        if (checkFinalCombiExists(finalCombiValue)) {
            console.log('entered has final combi value', finalCodeDelimeter);
            let codeDelimeter = finalCodeDelimeter === ('-') ? ('-') : ('.');
            let splitValues = finalCombiValue.split(codeDelimeter);
            console.log(splitValues, 'splitted values');
            if (splitValues !== undefined) {
                let value = splitValues[index];
                // console.log(value, 'values to populated');
                let targetIndex = determineSegmentArr(index).findIndex(item =>  item.SEGMENT_VALUE === value);
                // console.log(targetIndex, 'target index');
                if (targetIndex !== -1 && value !== undefined) {
                    console.log(targetIndex, value);
                    let e = {
                        value: targetIndex,
                        label: value
                    }
                    // console.log(index, e);
                    tempLabel = value;
                    tempValue = targetIndex;
                    determineSegment(index, e);
                }
            }
        }
        
        return ({ label: tempLabel, value: tempValue })
    }

    const handleCompanyDesc = (e) => {
        setCompanyDesc(tempCompany[e.value].DESCRIPTION);
        setCompVal(e.label)
    }

    const handleAccountDesc = (e) => {
        setAccountDesc(tempAccount[e.value].DESCRIPTION)
        setAcctVal(e.label)
    }

    const handleOrgDesc = (e) => {
        setOrgDesc(tempOrganization[e.value].DESCRIPTION)
        setOrgVal(e.label)
    }

    const handleLocationDesc = (e) => {
        setLocationDesc(tempLocation[e.value].DESCRIPTION)
        setLocVal(e.label)
    }

    const handleProductDesc = (e) => {
        setProductDesc(tempProduct[e.value].DESCRIPTION)
        setProdVal(e.label)
    }

    const handleInterCompDesc = (e) => {
        setInterCompanyDesc(tempIntercompany[e.value].DESCRIPTION)
        setInterCompVal(e.label)
    }

    const isButtonDisabled = () => {
        let disabled = false;
        const fields = [
            tempCompVal,
            tempAcctVal,
            tempOrgVal,
            tempLocVal,
            tempProdVal,
            tempInterCompVal
        ];

        for (let i = 0; i<fields.length; i++) {
            if (fields[i] === '') {
                disabled = true
                break;
            }
        }
        return disabled;
    }
    return(
        <>
        <Modal 
            show={showFinalCombiModal}
            backdrop="static"
            dialogClassName="newcc-modal"
        >
            <Modal.Header>
                <Modal.Title>Final Code Combination</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {segmentCSVSmap3.length < 1 ? 
                    (
                        <div className="inner-page text-center mt-5">
                            <h5 className="d-inline">Loading</h5>
                            <Spinner className="spinner-position" animation="border" role="status">
                                <span className="sr-only">Loading Modal...</span>
                            </Spinner>
                        </div>
                    ) : 
                    (
                        <>
                            {
                                isError === true ? 
                                (
                                    <Alert className="mt-2" variant="danger">
                                        <p className="mb-0">{errorMsg}</p>
                                    </Alert>
                                )
                                :
                                (
                                    <>
                                        <Form.Group>
                                        <Form.Row>
                                                <Form.Label className="col">
                                                    *Company
                                                </Form.Label>
                                                <Col>
                                                    <span onClick={(e)=>e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={() => setDefaultVal(finalCombiValue, 0)}
                                                            grouped={false}
                                                            minimumInputSearch={0}
                                                            optionHeight={31}
                                                            isClearable={false}
                                                            onChange={(e) =>{
                                                                handleSelectCompany(e);
                                                                handleCompanyDesc(e);
                                                            }}
                                                            options={segmentCSVSmap}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} 
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </span>
                                                </Col>
                                                <Form.Label className="col">
                                                    {companyDescription}
                                                </Form.Label>
                                            </Form.Row>

                                            <Form.Row className="mt-2">
                                                <Form.Label className="col">
                                                    *Account
                                                </Form.Label>
                                                <Col>
                                                    <span onClick={(e)=>e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={() => setDefaultVal(finalCombiValue, 1)}
                                                            grouped={false}
                                                            minimumInputSearch={0}
                                                            optionHeight={31}
                                                            isClearable={false}
                                                            onChange={(e) => {
                                                                handleSelectAccount(e);
                                                                handleAccountDesc(e);
                                                            }}
                                                            options={segmentCSVSmap2}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} 
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </span>
                                                </Col>
                                                <Form.Label className="col">
                                                    {accountDescription}
                                                </Form.Label>
                                            </Form.Row>
                                            <Form.Row className="mt-2">
                                                <Form.Label className="col">
                                                    *Organization
                                                </Form.Label>
                                                <Col>
                                                    <span onClick={(e)=>e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={() => setDefaultVal(finalCombiValue, 2)}
                                                            grouped={false}
                                                            minimumInputSearch={0}
                                                            optionHeight={31}
                                                            options={segmentCSVSmap3}
                                                            isClearable={false}
                                                            onChange={(e) => {
                                                                handleSelectOrganization(e);
                                                                handleOrgDesc(e)
                                                            }}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} 
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </span>
                                                </Col>
                                                <Form.Label className="col">
                                                        {organizationDescription}
                                                </Form.Label>
                                            </Form.Row>
                                            <Form.Row className="mt-2">
                                                <Form.Label className="col">
                                                    *Location
                                                </Form.Label>
                                                <Col>
                                                    <span onClick={(e)=>e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={() => setDefaultVal(finalCombiValue, 3)}
                                                            grouped={false}
                                                            minimumInputSearch={0}
                                                            optionHeight={31}
                                                            options={segmentCSVSmap4}
                                                            isClearable={false}
                                                            onChange={(e) => {
                                                                handleSelectLocation(e);
                                                                handleLocationDesc(e);
                                                            }}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} 
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </span>
                                                </Col>
                                                <Form.Label className="col">
                                                    {locationDescription}
                                                </Form.Label>
                                            </Form.Row>
                                            <Form.Row className="mt-2">
                                                <Form.Label className="col">
                                                    *Product
                                                </Form.Label>
                                                <Col>
                                                    <span onClick={(e)=>e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={() => setDefaultVal(finalCombiValue, 4)}
                                                            grouped={false}
                                                            minimumInputSearch={0}
                                                            optionHeight={31}
                                                            options={segmentCSVSmap5}
                                                            isClearable={false}
                                                            onChange={(e) => {
                                                                handleSelectProduct(e);
                                                                handleProductDesc(e);
                                                            }}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} 
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </span>
                                                </Col>
                                                <Form.Label className="col">
                                                    {productDescription}
                                                </Form.Label>
                                            </Form.Row>
                                            <Form.Row className="mt-2">
                                                <Form.Label className="col">
                                                    *Intercompany
                                                </Form.Label>
                                                <Col>
                                                    <span onClick={(e)=>e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={() => setDefaultVal(finalCombiValue, 5)}
                                                            grouped={false}
                                                            minimumInputSearch={0}
                                                            optionHeight={31}
                                                            isClearable={false}
                                                            options={segmentCSVSmap6}
                                                            onChange={(e) => {
                                                                handleSelectIntercompany(e);
                                                                handleInterCompDesc(e);
                                                            }}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} 
                                                            menuPortalTarget={document.body}
                                                        />
                                                    </span>
                                                </Col>
                                                <Form.Label className="col">
                                                    {interCompanyDescription}
                                                </Form.Label>
                                            </Form.Row>
                                        </Form.Group>
                                        <Modal.Footer>
                                            <Button 
                                                onClick={(e) =>
                                                    {
                                                        getAllSelect(e);
                                                        e.stopPropagation();
                                                    }} 
                                                variant="primary" 
                                                type="submit"
                                                disabled={isButtonDisabled()}
                                            >
                                                OK
                                            </Button>
                                            <Button 
                                                onClick={(e) =>
                                                    {
                                                        handleFinalCombiModal(e);
                                                        e.stopPropagation();
                                                    }} 
                                                variant="dark" 
                                            >
                                                CLOSE
                                            </Button>
                                        </Modal.Footer>
                                    </>
                                )
                            }
                        </>
                    )
                }
            </Modal.Body>
        </Modal>
    </>
      
    )
};

export default NewCodeCombiDialog;