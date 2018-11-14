---
id: neo4j-graphql-js
title: neo4j-graphql-js
sidebar_label: Getting Started
---

A GraphQL to Cypher query execution layer for Neo4j and JavaScript GraphQL implementations.

## Installation and usage

### Install

```shell
npm install --save neo4j-graphql-js
```

### Usage

Start with GraphQL type definitions:

```javascript
const typeDefs = `
type Movie {
    title: String
    year: Int
    imdbRating: Float
    genres: [Genre] @relation(name: "IN_GENRE", direction: "OUT")
}
type Genre {
    name: String
    movies: [Movie] @relation(name: "IN_GENRE", direction: "IN")
}
`;
```

Create an executable GraphQL schema with auto-generated resolvers for Query and Mutation types, ordering, pagination, and support for computed fields defined using the `@cypher` GraphQL schema directive:

```
import { makeAugmentedSchema } from 'neo4j-graphql-js';

const schema = makeAugmentedSchema({ typeDefs });
```

Create a neo4j-javascript-driver instance:

```
import { v1 as neo4j } from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'letmein')
);
```

Use your favorite JavaScript GraphQL server implementation to serve your GraphQL schema, injecting the Neo4j driver instance into the context so your data can be resolved in Neo4j:

```
import { ApolloServer } from 'apollo-server';

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3003, '0.0.0.0').then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
```

If you don't want auto-generated resolvers, you can also call `neo4jgraphql()` in your GraphQL resolver. Your GraphQL query will be translated to Cypher and the query passed to Neo4j.

```js
import { neo4jgraphql } from "neo4j-graphql-js";

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

- Translate GraphQL queries to Cypher to simplify the process of writing GraphQL resolvers
- Allow for custom logic by overriding of any resolver function
- Work with `graphl-tools`, `graphql-js`, and `apollo-server`
- Support GraphQL servers that need to resolve data from multiple data services/databases
- Expose the power of Cypher through GraphQL via the `@cypher` directive

## How it works

`neo4j-graphql-js` aims to simplify the process of building GraphQL APIs backed by Neo4j, embracing the paradigm of GraphQL First Development. Specifically,

- The Neo4j datamodel is defined by a GraphQL schema.
- Inside resolver functions, GraphQL queries are translated to Cypher queries and can be sent to a Neo4j database by including a Neo4j driver instance in the context object of the GraphQL request.
- Any resolver can be overridden by a custom resolver function implementation to allow for custom logic
- Optionally, GraphQL fields can be resolved by a user defined Cypher query through the use of the `@cypher` schema directive.

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

- `@cypher` directive - maps the specified Cypher query to the value of the field. In the Cypher query, `this` is bound to the current object being resolved.
- `@relation` directive - used to indicate relationships in the data model. The `name` argument specifies the relationship type, and `direction` indicates the direction of the relationship ("IN" or "OUT" are valid values)

### Translate GraphQL To Cypher

Inside each resolver, use `neo4j-graphql()` to generate the Cypher required to resolve the GraphQL query, passing through the query arguments, context and resolveInfo objects.

```js
import { neo4jgraphql } from "neo4j-graphql-js";

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

> The `@cypher` directive feature has a dependency on the APOC procedure library, to enable subqueries. If you'd like to make use of the `@cypher` feature you'll need to install the [APOC procedure library](https://github.com/neo4j-contrib/neo4j-apoc-procedures#installation-with-neo4j-desktop).

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

> This means that the entire GraphQL request is still resolved with a single Cypher query, and thus a single round trip to the database.

### Query Neo4j

Inject a Neo4j driver instance in the context of each GraphQL request and `neo4j-graphql-js` will query the Neo4j database and return the results to resolve the GraphQL query.

```js
let driver;

function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(
      "bolt://localhost:7687",
      neo4j.auth.basic("neo4j", "letmein")
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

## Schema Augmentation

`neo4j-graphql-js` can augment the provided GraphQL schema to add

- auto-generated mutations and queries
- ordering and pagination fields

> NOTE: neo4j-graphql-js does not currently support the `filter` parameter, as currently implemented in the Neo4j-GraphQL database plugin.

To add these augmentations to the schema use either the [`augmentSchema`](neo4j-graphql-js-api.md#augmentschemaschema-graphqlschema) or [`makeAugmentedSchema`](neo4j-graphql-js-api.md#makeaugmentedschemaoptions-graphqlschema) functions exported from `neo4j-graphql-js`.

**`augmentSchema`** - _when you already have a GraphQL schema object_

```javascript
import { augmentSchema } from "neo4j-graphql-js";
import { makeExecutableSchema } from "apollo-server";
import { typeDefs, resolvers } from "./movies-schema";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const augmentedSchema = augmentSchema(schema);
```

**`makeAugmentedSchema`** - _generate executable schema from GraphQL type definitions only_

```javascript
import { makeAugmentedSchema } from "neo4j-graphql-js";

const typeDefs = `
type Movie {
    title: String
    year: Int
    imdbRating: Float
    genres: [Genre] @relation(name: "IN_GENRE", direction: "OUT")
    similar: [Movie] @cypher(
        statement: """MATCH (this)<-[:RATED]-(:User)-[:RATED]->(s:Movie) 
                      WITH s, COUNT(*) AS score 
                      RETURN s ORDER BY score DESC LIMIT {first}""")
}

type Genre {
    name: String
    movies: [Movie] @relation(name: "IN_GENRE", direction: "IN")
}`;

const schema = makeAugmentedSchema({ typeDefs });
```

### Generated Queries

Based on the type definitions provided, fields are added to the Query type for each type defined. For example, the following queries are added based on the type definitions above:

```graphql
Movie(
  title: String
  year: Int
  imdbRating: Float
  _id: Int
  first: Int
  offset: Int
  orderBy: _MovieOrdering
): [Movie]
```

```graphql
Genre(
  name: String
  _id: Int
  first: Int
  offset: Int
  orderBy: _GenreOrdering
): [Genre]
```

### Generated Mutations

Create, update, delete, and add relationship mutations are also generated for each type. For example:

**Create**

```graphql
CreateMovie(
  title: String
  year: Int
  imdbRating: Float
): Movie
```

> If an `ID` typed field is specified in the type defintion, but not provided when the create mutation is executed then a random UUID will be generated and stored in the database.

**Update**

```graphql
UpdateMovie(
  title: String!
  year: Int
  imdbRating: Float
): Movie
```

**Delete**

```graphql
DeleteMovie(
  title: String!
): Movie
```

**Add / Remove Relationship**

Input types are used for relationship mutations.

_Add a relationship with no properties:_

```graphql
AddMovieGenres(
  from: _MovieInput!
  to: _GenreInput!
): _AddMovieGenresPayload
```

and return a special payload type specific to the relationship:

```graphql
type _AddMovieGenresPayload {
  from: Movie
  to: Genre
}
```

Relationship types with properties have an additional `data` parameter for specifying relationship properties:

```graphql
AddMovieRatings(
  from: _UserInput!
  to: _MovieInput!
  data: _RatedInput!
): _AddMovieRatingsPayload

type _RatedInput {
  timestamp: Int
  rating: Float
}
```

Remove relationship:

```graphql
RemoveMovieGenres(
  from: _MovieInput!
  to: _GenreInput!
): _RemoveMovieGenresPayload
```

> See [the relationship types](#relationship-types) section for more information, including how to declare these types in the schema and the relationship type query API.

### Ordering

`neo4j-graphql-js` supports ordering results through the use of an `orderBy` parameter. The augment schema process will add `orderBy` to fields as well as appropriate ordering enum types (where values are a combination of each field and `_asc` for ascending order and `_desc` for descending order). For example:

```
enum _MovieOrdering {
  title_asc
  title_desc
  year_asc
  year_desc
  imdbRating_asc
  imdbRating_desc
  _id_asc
  _id_desc
}
```

### Pagination

`neo4j-graphql-js` support pagination through the use of `first` and `offset` parameters. These parameters are added to the appropriate fields as part of the schema augmentation process.

### Configuring Schema Augmentation

You may not want to generate Query and Mutation fields for all types included in your type definitions, or you may not want to generate a Mutation type at all. Both `augmentSchema` and `makeAugmentedSchema` can be passed an optional configuration object to specify which types should be included in queries and mutations.

#### Disabling Auto-generated Queries and Mutations

By default, both Query and Mutation types are auto-generated from type definitions and will include fields for all types in the schema. An optional `config` object can be passed to disable generating either the Query or Mutation type.

Using `makeAugmentedSchema`, disable generating the Mutation type:

```javascript
import { makeAugmentedSchema } from "neo4j-graphql-js";

const schema = makeAugmentedSchema({
  typeDefs,
  config: {
    query: true, // default
    mutation: false
  }
}
```

Using `augmentSchema`, disable auto-generating mutations:

```javascript
import { augmentSchema } from "neo4j-graphql-js";

const augmentedSchema = augmentSchema(schema, {
  query: true, //default
  mutation: false
});
```

#### Excluding Types

To exclude specific types from being included in the generated Query and Mutation types, pass those type names in to the config object under `exclude`. For example:

```javascript
import { makeAugmentedSchema } from "neo4j-graphql-js";

const schema = makeAugmentedSchema({
  typeDefs,
  config: {
    query: {
      exclude: ["MyCustomPayload"]
    },
    mutation: {
      exclude: ["MyCustomPayload"]
    }
  }
});
```

See the API Reference for [`augmentSchema`](neo4j-graphql-js-api.md#augmentschemaschema-graphqlschema) and [`makeAugmentedSchema`](neo4j-graphql-js-api.md#makeaugmentedschemaoptions-graphqlschema) for more information.

## Relationship Types

### Defining relationships in SDL

GraphQL types can reference other types. When defining your schema, use the `@relation` GraphQL schema directive on the fields that reference other types. For example:

```graphql
type Movie {
  title: String
  year: Int
  genres: [Attribute] @relation(name: "IN_GENRE", direction: "OUT")
}

type Genre {
  name: String
  movies: [Movie] @relation(name: "IN_GENRE", direction: "IN")
}
```

### Relationships with properties

The above example (annotating a field with `@relation`) works for simple relationships without properties, but does not allow for modeling relationship properties. Imagine that we have users who can rate movies, and we want to store their rating and timestamp as a property on a relationship connecting the user and movie. We can represent this by promoting the relationship to a type and moving the `@relation` directive to annotate this new type:

```graphql
type Movie {
  title: String
  year: Int
  ratings: [Rated]
}

type User {
  userId: ID
  name: String
  rated: [Rated]
}

type Rated @relation(name: "RATED") {
  from: User
  to: Movie
  rating: Float
  timestamp: Int
}
```

This approach of an optional relationship type allows for keeping the schema simple when we don't need relationship properties, but having the flexibility of handling relationship properties when we want to model them.

### Relationship queries

When queries are generated (through [`augmentSchema`](neo4j-graphql-js-api.html#augmentschemaschema-graphqlschema) or [`makeAugmentedSchema`](neo4j-graphql-js-api.md#makeaugmentedschemaoptions-graphqlschema)) fields referencing a relationship type are replaced with a special payload type that contains the relationship properties and the type reference. For example:

```graphql
type _MovieRatings {
  timestamp: Int
  rating: Float
  User: User
}
```

### Relationship mutations

See the [generated mutations](#generated-mutations) section for information on the mutations generated for relationship types.

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

## Benefits

- Send a single query to the database
- No need to write queries for each resolver
- Exposes the power of the Cypher query language through GraphQL

## Examples

See [/examples](https://github.com/neo4j-graphql/neo4j-graphql-js/tree/master/example/apollo-server)

## Resources

- Read more in the [project docs](https://github.com/neo4j-graphql/neo4j-graphql-js).
- Open an issue on the project [issue tracker on Github.](https://github.com/neo4j-graphql/neo4j-graphql-js/issues)
- neo4j-graphql-js [on NPM](https://www.npmjs.com/package/neo4j-graphql-js)
