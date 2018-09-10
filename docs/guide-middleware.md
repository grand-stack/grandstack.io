---
id: guide-middleware
title: Authentication/Authorization And Middleware
sidebar_label: Auth / Middleware
---

This guide discusses some of the ways to address authentication and authorization when using `neo4j-graphql-js` and will evolve as new auth-specific features are added.

## Inspect Context In Resolver

A common pattern for dealing with authentication / authorization in GraphQL is to inspect an authorization token or a user object injected into the context in a resolver function to ensure the authenticated user is appropirately authorized to request the data. This can be done in `neo4j-graphql-js` by implementing your own resolver function(s) and calling [`neo4jgraphql`](neo4j-graphql-js-api.md#neo4jgraphqlobject-params-context-resolveinfo-debug-executionresult-https-graphqlorg-graphql-js-execution-execute) after inspecting the token / user object.

First, ensure the appropriate data is injected into the context object. In this case we inject the entire `request` object, which in our case will contain a `user` object (which comes from some authorization middleware in our application, such as passport.js):

```javascript
const server = new ApolloServer({
  schema: augmentedSchema,
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});
```

Then in our resolver, we check for the existence of our user object. If `req.user` is not present then we return an error as the request is not authenticated, if `req.user` is present then we know the request is authenicated and resolve the data with a call to `neo4jgraphql`:

```javascript
const resolvers = {
  // root entry point to GraphQL service
  Query: {
    Movie(object, params, ctx, resolveInfo) {
      if (!ctx.req.user) {
        throw new Error('request not authenticated');
      } else {
        return neo4jgraphql(object, params, ctx, resolveInfo);
      }
    }
  }
};
```

This resolver object can then be attached to the GraphQL schema using [`makeAugmentedSchema`](http://localhost:3000/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema)

We can apply this same strategy to check for user scopes, inspect scopes on a JWT, etc.

## Middleware

Middleware is often useful for features such as authentication / authorization. You can use middleware with neo4j-graphql-js by injecting the request object after middleware has been applied into the context. For example:

```javascript
const server = new ApolloServer({
  schema: augmentedSchema,
  // inject the request object into the context to support middleware
  // inject the Neo4j driver instance to handle database call
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});
```

This request object will then be available inside your GraphQL resolver function. You can inspect the context/request object in your resolver to verify auth before calling `neo4jgraphql`. Also, `neo4jgraphql` will check for the existence of:

- `context.req.error`
- `context.error`

and will throw an error if any of the above are defined.

Full example:

```javascript
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from 'apollo-server';
import { v1 as neo4j } from 'neo4j-driver';
import { typeDefs } from './movies-schema';

const schema = makeAugmentedSchema({
    typeDefs
  });

// Add auto-generated mutations
const schema = augmentSchema(schema);

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'letmein'
  )
);

const app = express();
app.use(bodyParser.json());

const checkErrorHeaderMiddleware = async (req, res, next) => {
  req.error = req.headers['x-error'];
  next();
};

app.use('*', checkErrorHeaderMiddleware);

const server = new ApolloServer({
  schema: schema,
  // inject the request object into the context to support middleware
  // inject the Neo4j driver instance to handle database call
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});

server.applyMiddleware({ app, path: '/' });
app.listen(3000, '0.0.0.0');
```
