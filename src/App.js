import React, { useReducer, useState, useEffect, useRef} from 'react';
import Header from './partials/header';
import Column from './components/Columns';
import SearchFields from './components/SearchFields';
import ViewLogs from './components/ViewLogs';
import ColumnLogs from './components/ColumnLogs';
import ErrorRouteDisplay from './components/ErrorRouteDisplay';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './App.css';



// Create context object
export const AppContext = React.createContext();

// Set up Initial State
const initialState = {
    userValues: {
      username: '',
      jwt: '',
    },
    dataValues: {
        supplier: '',
        supplierSite: '',
        bu: '',
        invoiceFromDate: '',
        invoieToDate: '',
        tegnaSite: '',
        invoiceNum: '',
        username: '',
        runtime: '',
        isClicked: false,
        tabledata : false,
        processing: false,
    },

    predictValues: {
      username: '',
      runtime: '',
      isClicked: false,
    },

    reviewValues: {
      username: '',
      runtime: '',
      isClicked: false,
      processing: false,
    },

    submitValues: {
      username: '',
      runtime: '',
      processing: false,
      isClicked: false
    },
  
    exportCSVValues: {
      isClicked: false
    },

    viewLogValues: {
      requestID: '',
      submissionFromDate: '',
      submissionToDate: '',
      status: '',
      runtime: '',
      username: '',
      isClicked: false
    }
};



const reducer = (state, action) => {
    switch (action.type) {
        case 'DATAVALUES_TRIGGERED':
          return { dataValues: action.data }

        case 'PREDICT_TRIGGERED':
          return { predictValues: action.data }

        case 'REVIEW_TRIGGERED':
          return { reviewValues: action.data }

        case 'SUBMIT_TRIGGERED':
          return { submitValues: action.data }

        case 'USERVALUES_TRIGGERED':
          return { userValues: action.data }

        case 'EXPORTCSVVALUES_TRIGGERED':
         return { exportCSVValues: action.data }

        case 'VIEWLOGVALUES_TRIGGERED': 
        return { viewLogValues: action.data }

        default:
            return initialState;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [username, setUsername] = useState()
  const [jwt, setJwt] = useState();
  const warningTimes = '1500000';
  // const warningTimes = '15000';

  useEffect(() => {
    console.log('trigger');
    refineURL();
  },[])

  const refineURL = () => {
    let url = window.location.href;
    let userValues;
    let jwtValues;
    console.log(url);
    let afterURL = url.substring(url.lastIndexOf('/') + 1);

    console.log(afterURL, 'after URL');
    


    let initialUserValues = getUsername(afterURL);
    let initialJwtValues = getJWT(afterURL);

    let userAndRuntimeValues = getUserAndRuntimeValues(initialUserValues, initialJwtValues);
    
    if (afterURL === 'view_logs') {
      const isUserSessionExists = (getCurrentUserSessionDetails().username.length !== 0 
        && getCurrentUserSessionDetails().runtime.length !== 0)
        if (isUserSessionExists) {
          userValues = getCurrentUserSessionDetails().username
          jwtValues = getCurrentUserSessionDetails().runtime
          window.sessionStorage.removeItem('value')
        }
    } else {
      userValues = userAndRuntimeValues.username;
      jwtValues = userAndRuntimeValues.jwt;
    }
    
    console.log('decoding uservalues here...', decodeURIComponent(userValues));
    setUsername(decodeURIComponent(userValues));
    setJwt(jwtValues);

    let beforeQueryStrings = afterURL.split('?')[0];
    window.history.pushState({}, document.title, "/" + beforeQueryStrings );

    console.log('adding values to the component: ' + userValues, jwtValues);
  }


  const getUserAndRuntimeValues = (initialUserValues, initialJwtValues) => {
    let userValues = '';
    let jwtValues = '';
    const isUserAndJwtValid = (initialJwtValues !== undefined 
        && initialUserValues !== undefined);

    const isUserSessionExists = (getCurrentUserSessionDetails().username.length !== 0 
        && getCurrentUserSessionDetails().runtime.length !== 0)

    // Check whether Username and Runtime are valid string values
    if (isUserAndJwtValid) {
        const isUserAndJwtExists = (initialJwtValues.length !== 0 
            && initialUserValues.length !== 0);
        // Check whether the valid string Username and Runtime is attached in the query params
        if (isUserAndJwtExists) {
            // Logic to compare the newly Username and Runtime values that is 
            // attached in the query params to the current Username and Runtime session values
            let sessionValues = isUserSessionExists ? ({
                    username: validateCurrentSessionDetails(initialUserValues, initialJwtValues).username, 
                    jwt:validateCurrentSessionDetails(initialUserValues, initialJwtValues).jwt
                }):({
                    username: initialUserValues,
                    jwt: initialJwtValues
                });
            userValues = sessionValues.username;
            jwtValues = sessionValues.jwt;
            window.sessionStorage.removeItem('value')
            // console.log(userValues + ' ' + jwtValues, 'from existing')
        } else {  
            let sessionValues = isUserSessionExists ? ({
                username:getCurrentUserSessionDetails().username,
                jwt: getCurrentUserSessionDetails().runtime
            }) : ({
                username: initialUserValues,
                jwt: initialJwtValues
            });
            userValues = sessionValues.username;
            jwtValues = sessionValues.jwt;
            window.sessionStorage.removeItem('value')
            // console.log(userValues + ' ' + jwtValues, 'from refresh')
        }
    }
    return {
        username: userValues,
        jwt: jwtValues
    }
  }

  const validateCurrentSessionDetails = (initialUserValues, initialJwtValues) => {
    let userValues = getCurrentUserSessionDetails().username;
    let jwtValues = getCurrentUserSessionDetails().runtime;
    if (getCurrentUserSessionDetails().username !== initialUserValues || getCurrentUserSessionDetails().runtime !== initialJwtValues) {
        userValues = initialUserValues;
        jwtValues = initialJwtValues;
    }
    return {
        username: userValues,
        jwt: jwtValues
    }
  }

  const getUsername = (afterURL) => {
    let username = '';
    let queryParams = afterURL.replace('?', '');
    console.log(queryParams);
    if (queryParams.length !== 0) {
        let tempUser = queryParams.split('&')[0];
        if (tempUser !== undefined) {
            username = tempUser.split('username=')[1];
        }
    }
    return username;
  }

  const getJWT = (afterURL) => {
    let queryParams = afterURL.replace('?', '');
    let jwt = '';
    console.log(queryParams);
    if (queryParams.length !== 0) {
        let tempJwt = queryParams.split('&')[1];
        if (tempJwt !== undefined) {
            jwt = tempJwt.split('runtime=')[1];
        }
    }
    return jwt;
  }
// End: Saving User Credentials

// Process when user tried to refresh a current session
  window.onbeforeunload = (e) => {
    console.log('loaded');
    if (username.length !== 0 && jwt.length !== 0) {
        console.log('save only when reload')
        let value = {
            username: username,
            runtime: jwt
        }
        window.sessionStorage.setItem('value',JSON.stringify(value));
    }
  }

  const getCurrentUserSessionDetails = () => {
    let value  = {
        username: '',
        runtime: '',
    }

  let sessionVal = window.sessionStorage.getItem('value');
  if (sessionVal !== null) {
      let tempVal = JSON.parse(sessionVal);
      value.username = tempVal.username;
      value.runtime = tempVal.runtime;
  }
    return value;
  }

  return (
      <Router>
        <div>
        <AppContext.Provider value={{ state, dispatch }}>
          <Header userVal={username}/>
          <Switch>
            <Route exact path="/">
              <SearchFields runtimeVal={jwt} userVal={username} warningTimes = {warningTimes}/>
              <Column/>
            </Route>
            <Route path="/view_logs">
              <ViewLogs runtimeVal={jwt} userVal={username}  warningTimes = {warningTimes}/>
              <ColumnLogs/>  
            </Route>
            <Route path= "/error">
              <ErrorRouteDisplay/>
            </Route>
            <Route path="*">
              <ErrorRouteDisplay/>  
            </Route>
          </Switch>
        </AppContext.Provider>
        </div>
      </Router>
  );
}

export default App;
