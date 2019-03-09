---
id: guide-schema
title: Designing Your GraphQL Schema
sidebar_label: Schema Design
---

The goal of this guide is to explain how to design your GraphQL schema for use with GRANDstack and neo4j-graphql. We use "neo4j-grapqhl" to refer to the various Neo4j GraphQL integrations such as [neo4j-graphql.js](), [neo4j-graphql-java](neo4j-graphql-js.md), and the [Neo4j GraphQL database plugin](neo4j-graphql-plugin.md) While the examples in this guide reference neo4j-graphql.js the same concepts apply to the other implementations of neo4j-graphql. We also discuss some best practices for schema design and common patterns for considerations such as implementing custom logic.

## Three Principles of neo4j-graphql

1. GraphQL type definitions drive the Neo4j database schema.
2. A single Cypher database query is generated for each GraphQL request.
3. Custom logic can be added with `@cypher` GraphQL schema directives to extend the functionality of GraphQL.

### GraphQL Type Definitions Drive The Database

![GraphQL type definitions](/docs/assets/img/type-defs.png)

A major benefit of using neo4j-graphql is the ability to define both the database schema and the GraphQL schema with the same type definitions. neo4j-graphql can also automatically create Query and Mutation types from your type definitions that give you instant CRUD functionality. This GraphQL CRUD API can be configured and extended.

### A Single Cypher database query is generated for each GraphQL Request

![GraphQL type definitions](/docs/assets/img/cypher.png)

Since we use GraphQL type defintions to define the database schema, neo4j-graphql can generate a Cypher query to resolve any arbitrary GraphQL request. This also means our resolvers are automatically implemented for us. No need to write boilerplate data fetching code, just inject a Neo4j driver instance into the request context and neo4j-graphql will take care of generating the database query and handling the database call. Additinoally, a single Cypher query is generated, resulting in a huge performance boost and eliminating the n+1 query problem.

### Defining Custom Logic With `@cypher` Schema Directives

![GraphQL type definitions](/docs/assets/img/cypher-directive.png)

Since GraphQL is an API query language and not a database query language it lacks semantics for operations such as aggregations, projections, and more complex graph traversals. We can extend the power of GraphQL through the use of [`@cypher` GraphQL schema directives]() to bind the results of a Cypher query to a GraphQL field. This allows us to express complex logic and can be used on a Query or Mutation field to define custom data fetching or mutation logic.

For more on how neo4j-graphql aims to solve some of common problems that come up when building GraphQL APIs [see this post.](https://blog.grandstack.io/five-common-graphql-problems-and-how-neo4j-graphql-aims-to-solve-them-e9a8999c8d43)

## What is a GraphQL schema?

A GraphQL schema defines the types and the fields available on each type, including references to other types. A GraphQL schema includes two special types `Query` and `Mutation` the fields of which define the entry points for the schema. In typical GraphQL implementations the Query and Mutation types must be defined by the developer, however in our case neo4j-graphql.js will handle generating CRUD queries and mutations based on our type definitions. We do however have the ability to define custom queries and mutations by either using a `@cypher` schema directive in our type definitions,effectively annotation the schema with a Cypher query, or implementing the resolver in code. See below for examples of each of those approaches.

## Graph Thinking

The [official guide to GraphQL](https://graphql.org/learn/thinking-in-graphs/#shared-language) makes the observation that **your application data is a graph** and GraphQL models your business domain as a graph, which in the client presents an object-oriented like approach to data where objects reference other types, creating a graph. However, as GraphQL is data layer agnostic, the guide says developers are free to implement the backend however they wish. Well if we use a graph database on the backend, we don't need a mapping and translation layer, instead the type definitions can drive the database data model. The graph model of GraphQL translates easily to the labeled property graph model used by Neo4j and other graph database systems.

### Nodes, relationships, and properties.

In a graph database nodes are the entities in the graph and relationships connect them. We can store arbitrary key-value pairs as properties on both nodes and relationships. This is the *labeled property graph model*.

![GraphQL type definitions](/docs/assets/img/arrows1.png)

In GraphQL we define types and the fields available on each type, which may reference other types. For example:

```GraphQL
type TypeName {
	fieldName: FieldType
	referenceField: TypeName
	listReferenceField: [TypeName]
}
```

How do we map the GraphQL type system to the labeled property graph? By applying these basic rules:

1. GraphQL type names become node labels
2. Fields become node properties
2. Reference fields become relationships (we discuss the case of modeling relationship types below)

## The GraphQL Schema Definition Language

In GraphQL we use the Schema Definition Language (SDL) to define our types in a language agnostic way.

## Type Definitions

We use SDL to define object types for our domain and the fields available on each type. For example: 

```GraphQL
type Movie {
	movieId: ID!
	title: String
	description: String
	year: Int
}
```

This type definition is defining as a node with the label `Movie` and the properties `movieId`, `title`, `description`, and `year`:

![](/docs/assets/img/arrows2.png)

Our type definitions can reference other object types as well:

```GraphQL
type Actor {
	actorId: ID!
	name: String
	movies: [Movie]
}

type Movie {
	movieId: ID!
	title: String
	description: String
	year: Int
	actors: [Actor]
}
```

### Arguments

Fields can have arguments as well. For example, we may want to limit the number of actors we return for movie:

```GraphQL
type Actor {
	actorId: ID!
	name: String
	movies: [Movie]
}

type Movie {
	movieId: ID!
	title: String
	description: String
	year: Int
	actors(limit: Int = 10): [Actor]
}
```

Here `limit` is an integer argument with default value 10. This argument can be specified at query time.

### Schema Directives

Schema directives are GraphQL's built in extension mechanism. We can use them to annotate fields or object type definitions.

#### `@relation` Schema Directive

To be able to fully specify the labeled property graph equivalent we make use of the `@relation` GraphQL schema directive to declare the relationship type and direction:

```GraphQL
type Actor {
	actorId: ID!
	name: String
	movies: [Movie] @relation(name: "ACTED_IN", direction: OUT)
}

type Movie {
	movieId: ID!
	title: String
	description: String
	year: Int
	actors(limit: Int = 10): [Actor] @relation(name: "ACTED_IN", direction: IN)
}
```

*Here `direction` is an enum added to our type definitions by neo4j-graphql with possible values IN, OUT.*

These type definitions then map to this labeled property graph model in Neo4j:

![](/docs/assets/img/arrows3.png)


#### `@cypher` Schema Directive

neo4j-graphql implementations introduce a `@cypher` GraphQL schema directive that can be used to bind a GraphQL field to the results of a Cypher query.

```GraphQL
type Actor {
	actorId: ID!
	name: String
	movies: [Movie] @relation(name: "ACTED_IN", direction: OUT)
}

type Movie {
	movieId: ID!
	title: String
	description: String
	year: Int
	actors(limit: Int = 10): [Actor] @relation(name: "ACTED_IN", direction: IN)
	similarMovies(limit: Int = 10): [Movie] @cypher(statement: """
		MATCH (this)<-[:ACTED_IN]-(:Actor)-[:ACTED_IN]->(rec:Movie)
		WITH rec, COUNT(*) AS score ORDER BY score DESC 
		RETURN rec LIMIT $limit
	""")
}
```

> `this` is bound to the currently resolved object, similar to the `object` parameter passed to the GraphQL resolver

GraphQL field arguments are included passed to the Cypher query as Cypher parameters (See `$limit`)

> `@cypher` directives can be used to implement authorization logic as well. The request context can specify values to be included in the query.

### Relationship types

In the case above we model properties on nodes, but not on relationships. To handle the case where we want to model properties on relationships we promote the reference field to a proper object type and annotate it with the directive `@relation`. For example, let's introduce users and ratings:

```GraphQL
type Actor {
	actorId: ID!
	name: String
	movies: [Movie] @relation(name: "ACTED_IN", direction: OUT)
}

type Movie {
	movieId: ID!
	title: String
	description: String
	year: Int
	actors(limit: Int = 10): [Actor] @relation(name: "ACTED_IN", direction: IN)
	similarMovies(limit: Int = 10): [Movie] @cypher(statement: """
		MATCH (this)<-[:ACTED_IN]-(:Actor)-[:ACTED_IN]->(rec:Movie)
		WITH rec, COUNT(*) AS score ORDER BY score DESC 
		RETURN rec LIMIT $limit
	""")
}

type User {
	userId: ID!
	name: String
	rated: [Rated]
}

type Rated @relation(name: "RATED") {
	from: User
	to: Movie
	rating: Float
	review: String
}
```

An object type definition that includes an `@relation` directive will be treated as a relationship. We use the convention that the fields `from` and `to` define the nodes on the outgoing and incoming ends of the relationship, respectively.

This results in the follow model in Neo4j:

![](/docs/assets/img/arrows4.png)

## API Generation

In typical GraphQL server implementations we would also define a `Query` and `Mutation` object type, the fields of each becoming the entrypoints for our API. With neo4j-graphql we don't need to define a `Query` or `Mutation` type as queries and mutations with full CRUD operations will be generated for us from our type defintions.

We also don't need to define resolvers - the functions that contain the logic for resolving the actual data from the data layer. Since neo4j-graphql handles database query generation and data fetching our resolvers are generated for us as part of the [schema augmetation process.]()

The following `Query` and `Mutation` types would be generated for our type definitions above, defining CRUD operations for all our types:

```GraphQL
type Query {
  Movie(_id: String, movieId: ID, title: String, year: Int, description: String, first: Int, offset: Int, orderBy: [_MovieOrdering]): [Movie]
  Actor(actorId: ID, name: String, _id: String, first: Int, offset: Int, orderBy: [_ActorOrdering]): [Actor]
  User(userId: ID, name: String, _id: String, first: Int, offset: Int, orderBy: [_UserOrdering]): [User]
}

type Mutation {
  CreateMovie(movieId: ID, title: String, year: Int, description: String): Movie
  UpdateMovie(movieId: ID!, title: String, year: Int, description: String): Movie
  DeleteMovie(movieId: ID!): Movie
  AddMovieActors(from: _ActorInput!, to: _MovieInput!): _AddMovieActorsPayload
  RemoveMovieActors(from: _ActorInput!, to: _MovieInput!): _RemoveMovieActorsPayload
  AddMovieRatings(from: _UserInput!, to: _MovieInput!, data: _RatedInput!): _AddMovieRatingsPayload
  CreateActor(actorId: ID, name: String): Actor
  UpdateActor(actorId: ID!, name: String): Actor
  DeleteActor(actorId: ID!): Actor
  AddActorMovies(from: _ActorInput!, to: _MovieInput!): _AddActorMoviesPayload
  RemoveActorMovies(from: _ActorInput!, to: _MovieInput!): _RemoveActorMoviesPayload
  CreateUser(userId: ID, name: String): User
  UpdateUser(userId: ID!, name: String): User
  DeleteUser(userId: ID!): User
  AddUserRated(from: _UserInput!, to: _MovieInput!, data: _RatedInput!): _AddUserRatedPayload
  RemoveUserRated(from: _UserInput!, to: _MovieInput!): _RemoveUserRatedPayload
}
```

You can read more about the API generation process in the [neo4j-graphql.js user guide]() but here are a few observations:

* _id field
* ordering
* pagination fields (first, offset)
* Input fields / payload fields?

## Custom Queries And Mutations

The autogenerated API gives us basic CRUD functionality, but what if we wanted to implement our own custom logic?

### Using `@cypher`

```GraphQL
type Query {
	moviesByFuzzyMatch(search: String, first: Int = 10, offset: Int = 0): [Movie] @cypher("""
		CALL db.index.fulltext.queryNodes('movieIndex', $search) YIELD node
		RETURN node SKIP $offset LIMIT $first
	""")
}
```

> This approach can be used to define custom logic for Mutation fields as well.

### Implementing Custom Resolvers

Resolvers are functions that define how to actually fetch the data from the data layer. Because neo4j-graphql.js autogenerates CRUD resolvers for queries and mutations, you don't need to implement resolvers yourself, however if you have some custom code beyond which can be defined using an `@cypher` directive, you can implement your own resolvers and pass those along. Here's an example:

```javascript
import { makeAugmentedSchema } from "neo4j-graphql-js";

const typeDefs = ```
type User {
	userId: ID!
	firstName: String
	lastName: String
	fullName: String
}
```;

const resolvers = {
	User: {
		fullName(obj, params, ctx, resolveInfo) {
			return `${obj.firstName} ${obj.lastName}`;
		}
	}
};

const schema = makeAugmentedSchema{
	typeDefs,
	resolvers
}
```