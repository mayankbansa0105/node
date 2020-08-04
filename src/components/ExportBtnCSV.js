import React, {useEffect} from 'react';

const ExportBtnCSV = ({props, state}) => {
    useEffect(() => {
        console.log(state)
        if (state !== undefined) {
            if (state.isClicked === true) {
                let csvProp = {...props.csvProps};
                console.log(csvProp);
                csvProp.onExport();
            }
        }
    },[state]);
    return (
      <>
      </>
    );
};
export default ExportBtnCSV