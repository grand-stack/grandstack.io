---
id: neo4j-graphql-js
title: neo4j-graphql-js
sidebar_label: neo4j-graphql-js
---

A GraphQL to Cypher query execution layer for Neo4j and JavaScript GraphQL implementations.

## Installation and usage

### Install

```
npm install --save neo4j-graphql-js
```

Then call `neo4jgraphql()` in your GraphQL resolver. Your GraphQL query will be translated to Cypher and the query passed to Neo4j.

```js
import { neo4jgraphql } from 'neo4j-graphql-js';

const resolvers = {
  Query: {
    Movie(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    }
  }
};
```

## Test

We use the `ava` test runner.

```
npm install
npm build
npm test
```

The `npm test` script will run unit tests that check GraphQL -> Cypher translation and the schema augmentation features and can be easily run locally without a test environment. Full integration tests can be found in `/test` and are [run on CircleCI](https://circleci.com/gh/neo4j-graphql/neo4j-graphql-js) as part of the CI process. 


## What is `neo4j-graphql-js`

A package to make it easier to use GraphQL and [Neo4j](https://neo4j.com/) together. `neo4j-graphql-js` translates GraphQL queries to a single [Cypher](https://neo4j.com/developer/cypher/) query, eliminating the need to write queries in GraphQL resolvers and for batching queries. It also exposes the Cypher query language through GraphQL via the `@cypher` schema directive.

### Goals

* Translate GraphQL queries to Cypher to simplify the process of writing GraphQL resolvers
* Allow for custom logic by overriding of any resolver function
* Work with `graphl-tools`, `graphql-js`, and `apollo-server`
* Support GraphQL servers that need to resolve data from multiple data services/databases
* Expose the power of Cypher through GraphQL via the `@cypher` directive

## How it works

`neo4j-graphql-js` aims to simplify the process of building GraphQL APIs backed by Neo4j, embracing the paradigm of GraphQL First Development. Specifically,

* The Neo4j datamodel is defined by a GraphQL schema.
* Inside resolver functions, GraphQL queries are translated to Cypher queries and can be sent to a Neo4j database by including a Neo4j driver instance in the context object of the GraphQL request.
* Any resolver can be overridden by a custom resolver function implementation to allow for custom logic
* Optionally, GraphQL fields can be resolved by a user defined Cypher query through the use of the `@cypher` schema directive.

### Start with a GraphQL schema

GraphQL First Development is all about starting with a well defined GraphQL schema. Here we'll use the GraphQL schema IDL syntax, compatible with graphql-tools (and other libraries) to define a simple schema:

```js
const typeDefs = `
type Movie {
  movieId: ID!
  title: String
  year: Int
  plot: String
  poster: String
  imdbRating: Float
  similar(first: Int = 3, offset: Int = 0): [Movie] @cypher(statement: "MATCH (this)-[:IN_GENRE]->(:Genre)<-[:IN_GENRE]-(o:Movie) RETURN o")
  degree: Int @cypher(statement: "RETURN SIZE((this)-->())")
  actors(first: Int = 3, offset: Int = 0): [Actor] @relation(name: "ACTED_IN", direction:"IN")
}

type Actor {
  id: ID!
  name: String
  movies: [Movie]
}


type Query {
  Movie(id: ID, title: String, year: Int, imdbRating: Float, first: Int, offset: Int): [Movie]
}
`;
```

We define two types, `Movie` and `Actor` as well as a top level Query `Movie` which becomes our entry point. This looks like a standard GraphQL schema, except for the use of two directives `@relation` and `@cypher`. In GraphQL directives allow us to annotate fields and provide an extension point for GraphQL.

* `@cypher` directive - maps the specified Cypher query to the value of the field. In the Cypher query, `this` is bound to the current object being resolved.
* `@relation` directive - used to indicate relationships in the data model. The `name` argument specifies the relationship type, and `direction` indicates the direction of the relationship ("IN" or "OUT" are valid values)

### Translate GraphQL To Cypher

Inside each resolver, use `neo4j-graphql()` to generate the Cypher required to resolve the GraphQL query, passing through the query arguments, context and resolveInfo objects.

```js
import { neo4jgraphql } from 'neo4j-graphql-js';

const resolvers = {
  // entry point to GraphQL service
  Query: {
    Movie(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    }
  }
};
```

GraphQL to Cypher translation works by inspecting the GraphQL schema, the GraphQL query and arguments. For example, this simple GraphQL query

```graphql
{
  Movie(title: "River Runs Through It, A") {
    title
    year
    imdbRating
  }
}
```

is translated into the Cypher query

```cypher
MATCH (movie:Movie {title:"River Runs Through It, A"})
RETURN movie { .title , .year , .imdbRating } AS movie
SKIP 0
```

A slightly more complicated traversal

```graphql
{
  Movie(title: "River Runs Through It, A") {
    title
    year
    imdbRating
    actors {
      name
    }
  }
}
```

becomes

```cypher
MATCH (movie:Movie {title:"River Runs Through It, A"})
RETURN movie { .title , .year , .imdbRating,
  actors: [(movie)<-[ACTED_IN]-(movie_actors:Actor) | movie_actors { .name }] }
AS movie
SKIP 0
```

## `@cypher` directive

*NOTE: The `@cypher` directive has a dependency on the APOC procedure library, specifically the function `apoc.cypher.runFirstColumn` to run subqueries. If you'd like to make use of the `@cypher` feature you'll need to install [APOC](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/tag/3.2.0.5-beta) in Neo4j 3.2+*

GraphQL is fairly limited when it comes to expressing complex queries such as filtering, or aggregations. We expose the graph querying language Cypher through GraphQL via the `@cypher` directive. Annotate a field in your schema with the `@cypher` directive to map the results of that query to the annotated GraphQL field. For example:

```graphql
type Movie {
  movieId: ID!
  title: String
  year: Int
  plot: String
  similar(first: Int = 3, offset: Int = 0): [Movie]
    @cypher(
      statement: "MATCH (this)-[:IN_GENRE]->(:Genre)<-[:IN_GENRE]-(o:Movie) RETURN o ORDER BY COUNT(*) DESC"
    )
}
```

The field `similar` will be resolved using the Cypher query

```cypher
MATCH (this)-[:IN_GENRE]->(:Genre)<-[:IN_GENRE]-(o:Movie) RETURN o ORDER BY COUNT(*) DESC
```

to find movies with overlapping Genres.

Querying a GraphQL field marked with a `@cypher` directive executes that query as a subquery:

_GraphQL:_

```graphql
{
  Movie(title: "River Runs Through It, A") {
    title
    year
    imdbRating
    actors {
      name
    }
    similar(first: 3) {
      title
    }
  }
}
```

_Cypher:_

```cypher
MATCH (movie:Movie {title:"River Runs Through It, A"})
RETURN movie { .title , .year , .imdbRating,
  actors: [(movie)<-[ACTED_IN]-(movie_actors:Actor) | movie_actors { .name }],
  similar: [ x IN apoc.cypher.runFirstColumn("
        WITH {this} AS this
        MATCH (this)-[:IN_GENRE]->(:Genre)<-[:IN_GENRE]-(o:Movie)
        RETURN o",
        {this: movie}, true) | x { .title }][..3]
} AS movie
SKIP 0
```

### Query Neo4j

Inject a Neo4j driver instance in the context of each GraphQL request and `neo4j-graphql-js` will query the Neo4j database and return the results to resolve the GraphQL query.

```js
let driver;

function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'letmein')
    );
  }
  return { driver };
}
```

```javascript
server.use(
  "/graphql",
  bodyParser.json(),
  graphqlExpress(request => ({
    schema,
    rootValue,
    context: context(request.headers, process.env)
  }))
);
```

## Benefits

* Send a single query to the database
* No need to write queries for each resolver
* Exposes the power of the Cypher query language through GraphQL

## Middleware

Middleware is often useful for features such as authentication / authorization. You can use middleware with neo4j-graphql-js by injecting the request object after middleware has been applied into the context. For example:

```
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

See [movies-middleware.js](https://github.com/neo4j-graphql/neo4j-graphql-js/tree/master/example/apollo-server/movies-middleware.js) for an example using a middleware function that checks for an `x-error` header.

## Features

- [x] translate basic GraphQL queries to Cypher
- [x] `first` and `offset` arguments for pagination
- [x] `@cypher` schema directive for exposing Cypher through GraphQL
- [x] Handle enumeration types
- [x] Handle fragments
- [ ] Handle interface types
- [ ] Handle inline fragments
- [ ] Ordering

## Examples

See [/examples](https://github.com/neo4j-graphql/neo4j-graphql-js/tree/master/example/apollo-server)

## Resources

* Read more in the [project docs](https://github.com/neo4j-graphql/neo4j-graphql-js).
* Open an issue on the project [issue tracker on Github.](https://github.com/neo4j-graphql/neo4j-graphql-js/issues)
* neo4j-graphql-js [on NPM](https://www.npmjs.com/package/neo4j-graphql-js)