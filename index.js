var express = require("express");
var { graphqlHTTP } = require("express-graphql");
const todoSchema = require("./graphql/todoSchemas");
var cors = require("cors");

var app = express();
app.use("*", cors());
app.use(
  "/graphql",
  cors(),
  graphqlHTTP({
    schema: todoSchema,
    rootValue: global,
    graphiql: true,
  }),
);

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
