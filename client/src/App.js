import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

//import Apollo for graphQL functionality
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context'

import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

//create connection to Apollo Server
const httpLink = createHttpLink({
  uri: '/graphql',
});

//middleware function to retrieve user token and combine it with httpLink, so token is always sent with requests
const authLink = setContext((_, { headers }) => {
  //look for token in localStorage
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      //if token is found, add 'Bearer <token>' to authorization header, else set authorization to ''
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

//creates new instance of Apollo client
const client = new ApolloClient({
  //use concat to combine authLink headers with httpLink uri
  link: authLink.concat(httpLink),
  //creates cache to save changes from queries and mutations in memory so user doesn't need to refresh page
  cache: new InMemoryCache(),
});

function App() {
  return (
    //wrap entire element in ApolloProvider to grant all components access to cache, db, and graphql
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route exact path='/' component={SearchBooks} />
            <Route exact path='/saved' component={SavedBooks} />
            <Route render={() => <h1 className='display-2'>Wrong page!</h1>} />
          </Switch>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;
