---
id: neo4j-graphql-js-api
title: neo4j-graphql-js API Reference
sidebar_label: API Reference
---

This reference documents the exports from `neo4j-graphql-js`:

## Exports

### `neo4jgraphql(object, params, context, resolveInfo, debug)`: <[ExecutionResult](https://graphql.org/graphql-js/execution/#execute)>

This function's signature matches that of [GraphQL resolver functions](https://graphql.org/learn/execution/#root-fields-resolvers). and thus the parameters match the parameters passed into `resolve` by GraphQL implementations like graphql-js.

It can be called within a resolver to generate a Cypher query and handle the database call to Neo4j to completely resolve the GraphQL request. Alternatively, use `cypherQuery` or `cypherMutation` within a resolver to only generate the Cypher query and handle the database call yourself.

#### Parameters

* `object`: <`Object`>

The previous object being resolved. Rarely used for a field on the root Query type.

* `params`: <`Object`>

The arguments provided to the field in the GraphQL query.

* `context`: <`Object`>

Value provided to every resolver and hold contextual information about the request, such as the currently logged in user, or access to a database. *`neo4j-graphql-js` assumes a `neo4j-javascript-driver` instance exists in this object, under the key `driver`.*

* `resolveInfo`: <`GraphQLResolveInfo`>

Holds field-specific infomation relevant to the current query as well as the GraphQL schema. 

* `debug`: `Boolean` *(default: `true`)*

Specifies whether to log the generated Cypher queries for each GraphQL request. Logging is enabled by default.

#### Returns

[ExecutionResult](https://graphql.org/graphql-js/execution/#execute)


### `augmentSchema(schema)`: <`GraphQLSchema`>

Takes an existing GraphQL schema object and adds neo4j-graphql-js specific enhancements, including auto-generated mutations and queries, and ordering and pagination fields. See [this guide](neo4j-graphql-js.md) for more information.

#### Parameters

* `schema`: <`GraphQLSchema`>

#### Returns

`GraphQLSchema`

### `makeAugmentedSchema(options)`: <`GraphQLSchema`>

Wraps [`makeExecutableSchema`](https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#makeExecutableSchema) to create a GraphQL schema from GraphQL type definitions (SDL). Will generate Query and Mutation types for the provided type definitions and attach `neo4jgraphql` as the resolver for these queries and mutations. Either a schema or typeDefs must be provided. `resolvers` can optionally be implemented to override any of the generated Query/Mutation fields. Additional options are passed through to `makeExecutableSchema`.

#### Parameters

* `options`: <`Object`>
    * `schema`: <`GraphQLSchema`>
    * `typeDefs`: <`String`>
    * `resolvers`: <`Object`>
    * `logger`: <`Object`>
    * `allowUndefinedInResolve` = false
    * `resolverValidationOptions` = {}
    * `directiveResolvers` = null
    * `schemaDirectives` = null
    * `parseOptions` = {}
    * `inheritResolversFromInterfaces` = false

#### Returns

`GraphQLSchema`

### `cypherQuery(params, context, resolveInfo)`

Generates a Cypher query (and associated parameters) to resolve a given GraphQL request (for a Query). Use this function when you want to handle the database call yourself, use `neo4jgraphql` for automated database call support.

#### Parameters

* `params`: <`Object`>
* `context`: <`Object`>
* `resolveInfo`: <`GraphQLResolveInfo`>

#### Returns

`[`<`String`>, <`Object`>`]`

Returns an array where the first element is the genereated Cypher query and the second element is an object with the parameters for the generated Cypher query.

### `cypherMutation(params, context, resolveInfo`

Similar to `cypherQuery`, but for mutations. Generates a Cypher query (and associated parameters) to resolve a given GraphQL request (for a Mutation). Use this function when you want to handle the database call yourself, use `neo4jgraphql` for automated database call support.

#### Parameters

* `params`: <`Object`>
* `context`: <`Object`>
* `resolveInfo`: <`GraphQLResolveInfo`>

#### Returns

`[`<`String`>, <`Object`>`]`

Returns an array where the first element is the genereated Cypher query and the second element is an object with the parameters for the generated Cypher query.