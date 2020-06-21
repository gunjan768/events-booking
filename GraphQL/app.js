const express               =           require("express");
const bodyParser            =           require("body-parser");
const request               =           require('request');
const flash                 =           require("connect-flash");

const MongoClient           =           require('mongodb').MongoClient;
const mongoose              =           require("mongoose");

const passport              =           require("passport");
const LocalStrategy         =           require("passport-local");
const pssprtMong            =           require("passport-local-mongoose");
const session               =           require("express-session");
const methodOverride        =           require("method-override");

const graphqlHttp           =           require('express-graphql');
const graphQlSchema         =           require('./graphql/schema/index');
const graphQlResolvers      =           require('./graphql/resolvers/index');

const isAuth                =           require('./middleware/isAuth'); 
      
const port = 8000;
const app = express();

app.use(bodyParser.json());


// ********************************************************** GraphQL **********************************************************************


// express-graphql can be used as middleware in express node.js application and then allows to point at Schema, server and automatically connect
// all of them for us and route requests to a parser and then handle them according to our Schema and forward them to the right server

// graphql package allows us to define the Schema and setup Schema that follows the official graphql specification and definitions

// GraphQL is a type language

// graphqlHttp happens to be a function that we can use in the place where express expects a middleware function so it basically eports a 
// middleware function. 


// *****************************************************************************************************************************************


// ********************************************************** Cross-Origin *****************************************************************


// Error: "Access to ...... blocked by CORS policy". This is the security mechanism build into modern browers. They basically check behind the 
// scene requests (Ajax request or the fetch request ) whether to the server we are sending the request if it's not the same server as you are 
// currently on ( from where you are sending the request ) they block the request if cross origin is not allowed. To allow cross origin we have
// to set the right header.

// Adding headers to every response that is sent back by our server because for this server I want to add cross origin
app.use((req, res, next) =>
{
    // '*' means we are allowing every host or client
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // This header is used to tell which kind of request can be sent i.e post,get and options. Browser will automatically send the 'OPTIONS'
    // method before sending the post requst thats why have allowed this method also.
    res.setHeader("Access-Control-Allow-Methods", 'POST,GET,OPTIONS');

    // This header tells which type of heade(s) you want to send
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // We don't allow "OPTIONS" method to reah our graphql api as it will not handle it correctly
    if( req.method === "OPTIONS" )
    return res.sendStatus(200);

    next();
})


// *********************************************************************************************************************************************


app.use(isAuth);

app.use('/graphql', graphqlHttp(
{
    schema: graphQlSchema,

    // rootValue key will at the end will point an object that has all the resolver functions in it and resolver functions need to match our 
    // Schema end point by name. All logics like act on incoming requests that requests a list of datas or want to add event with createEvent() 
    // mutation. Remember that all resolver names which are defined should match exactly with Rootquery or RootMutation properties. Resolver 
    // functions will called when there will be request for events or createEvent
    rootValue: graphQlResolvers,

    // graphiql will unlock debugging and development tool that graphQL ships with. By putting graphiql property to true we get a special url we
    // can visit where we will get a nice user interface
    graphiql: true

}))

mongoose.connect(`
    mongodb+srv://${
    process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventbooking-q25vh.mongodb.net/${
    process.env.MONGO_DB}?retryWrites=true&w=majority`
)
.then(response =>
{
    app.listen(port ,() =>
    {
        console.log("server has started");
    })
})
.catch(error =>
{
    console.log("Error in connecting MongoDB Atlas",error);
})