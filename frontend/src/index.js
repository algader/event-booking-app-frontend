import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App';
import { ApolloClient, HttpLink, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { set } from 'lodash';
import { setContext } from '@apollo/client/link/context';
import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';  
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new GraphQLWsLink(createClient({
    url: 'wss://event-booking-app-backend-va08.onrender.com/graphql', 
    connectionParams: {
        authToken: localStorage.getItem('token')
    },
}));

const httpLink = createHttpLink({ 
    uri: 'https://event-booking-app-backend-va08.onrender.com/graphql',
    credentials: 'same-origin'
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        ...headers,
        authorization: token ? `JWT ${token}` : "",
      }
    }
  });

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
        },
    wsLink,
    authLink.concat(httpLink)
)  

const client = new ApolloClient({ 
    cache: new InMemoryCache(), 
    link: splitLink
})




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
//   <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
//   </React.StrictMode> 

)
