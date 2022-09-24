const express = require('express');
const path = require('path');
const db = require('./config/connection');
//no longer use API routes
// const routes = require('./routes');

//Apollo server implementation
const {ApolloServer} = require('apollo-server-express');
//import typeDefs and resolvers
const {typeDefs, resolvers} = require('./schemas');
//import Auth middleware
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;

//create new Apollo server and pass in schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  //every request performs an auth check and updated request object will be pass to resolvers as context
  context: authMiddleware
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//create new instance of Apollo Server with GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  //integrate server with Express application middleware
  server.applyMiddleware({app});
};

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//no longer use API routes
// app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`)
    // log where we can test our GraphQL API
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});

//call function to start Apollo server
startApolloServer(typeDefs, resolvers);