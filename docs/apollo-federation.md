---
id: apollo-federation
title: Apollo Federation & Gateway
sidebar_label: Apollo Federation & Gateway
---

## Introduction
[Apollo Gateway](https://www.apollographql.com/docs/apollo-server/federation/gateway/) composes federated schemas into a single schema, with each receiving appropriately delegated operations while running as a service. An [implementing service](https://www.apollographql.com/docs/apollo-server/federation/implementing-services/) is a schema that conforms to the [Apollo Federation specification](https://www.apollographql.com/docs/apollo-server/federation/federation-spec/). This approach exposes a [single data graph](https://principledgraphql.com/integrity#1-one-graph) while enabling [concern-based separation](https://www.apollographql.com/docs/apollo-server/federation/introduction/#concern-based-separation) of types and fields across services.

The following guide will overview this [example](https://github.com/neo4j-graphql/neo4j-graphql-js/tree/master/example/apollo-federation), based on the Apollo Federation [demo](https://github.com/apollographql/federation-demo), to demonstrate current behavior with `neo4j-graphql-js`. 

---
## Setup
As with the Federation demo [services](https://github.com/apollographql/federation-demo/tree/master/services), we use [buildFederatedSchema](https://www.apollographql.com/docs/apollo-server/api/apollo-federation/) to build four schema:
* [<span style="color: #c990c0;font-weight: bold;">Accounts</span>](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/example/apollo-federation/services/accounts/index.js)
* [<span style="color: #ffe081;font-weight: bold;">Reviews</span>](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/example/apollo-federation/services/reviews/index.js)
* [<span style="color: #f79767;font-weight: bold;">Products</span>](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/example/apollo-federation/services/products/index.js)
* [<span style="color: #f79767;font-weight: bold;">Inventory</span>](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/example/apollo-federation/services/inventory/index.js)

Each federated schema is then exposed as an individual, implementing service using [ApolloServer](https://www.apollographql.com/docs/apollo-server/). Finally, the service names and URLs of those servers are provided to [ApolloGateway](https://www.apollographql.com/docs/apollo-server/api/apollo-gateway/), starting a server for  a single API based on the composition of the federated schema.

* [Gateway](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/example/apollo-federation/gateway.js)

You can follow these steps to run the example:
* Clone or download the [neo4j-graphql-js](https://github.com/neo4j-graphql/neo4j-graphql-js) repository
* `npm run install`
* `npm run start-gateway`

Upon successful startup you should see:
```
🚀 Accounts ready at http://localhost:4001/
🚀 Reviews ready at http://localhost:4002/
🚀 Products ready at http://localhost:4003/
🚀 Inventory ready at http://localhost:4004/
🚀 Apollo Gateway ready at http://localhost:4000/
```
The following mutation can then be run to merge example data into your Neo4j database:
```graphql
mutation {
  MergeSeedData
}
```
![Example data in Neo4j Bloom](/docs/assets/img/exampleDataGraph.png)

---
## Walkthrough
Let's consider a reduced version of the example schema:
```js
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloGateway } from '@apollo/gateway';
import { neo4jgraphql, makeAugmentedSchema } from 'neo4j-graphql-js';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'letmein'
  )
);

const augmentedAccountsSchema = makeAugmentedSchema({
  typeDefs: gql`
    type Account @key(fields: "id") {
      id: ID!
      name: String
      username: String
    }
  `,
  config: {
    isFederated: true
  }
});

const accountsService = new ApolloServer({
  schema: buildFederatedSchema([
    augmentedAccountsSchema
  ]),
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});

const reviewsService = new ApolloServer({
  schema: buildFederatedSchema([
    makeAugmentedSchema({
      typeDefs: gql`
        extend type Account @key(fields: "id") {
          id: ID! @external

          # Example: A reference to an entity defined in -this service-
          # as the type of a field added to an entity defined 
          # in -another service-
          reviews(body: String): [Review]
            @relation(name: "AUTHOR_OF", direction: OUT)
        }

        type Review @key(fields: "id") {
          id: ID!
          body: String

          # Example: A reference to an entity defined in -another service-
          # as the type of a field added to an entity defined 
          # in -this service-
          author: Account
            @relation(name: "AUTHOR_OF", direction: IN)
          product: Product
            @relation(name: "REVIEW_OF", direction: OUT)
        }

        extend type Product @key(fields: "upc") {
          upc: ID! @external
          
          # Same case as Account.reviews
          reviews(body: String): [Review]
            @relation(name: "REVIEW_OF", direction: IN)
        }
      `,
      config: {
        isFederated: true
      }
    })
  ]),
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});

const productService = new ApolloServer({
  schema: buildFederatedSchema([
    makeAugmentedSchema({
      typeDefs: gql`
        type Product @key(fields: "upc") {
          upc: String!
          name: String
          price: Int
          weight: Int
        }
      `,
      config: {
        isFederated: true
      }
    })
  ]),
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});

// Start implementing services
accountsService.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Accounts ready at ${url}`);
});

reviewsService.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Reviews ready at ${url}`);
});

productsService.listen({ port: 4003 }).then(({ url }) => {
  console.log(`🚀 Products ready at ${url}`);
});

// Configure gateway
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'accounts', url: 'http://localhost:4001/graphql' },
    { name: 'reviews', url: 'http://localhost:4002/graphql' },
    { name: 'products', url: 'http://localhost:4003/graphql' }
  ]
});

// Start gateway
(async () => {
  const server = new ApolloServer({
    gateway
  });
  server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀 Apollo Gateway ready at ${url}`);
  });
})();
```
### Data sources
All services in this example use `neo4j-graphql-js` and the same Neo4j database as a data source. This is only for demonstration and testing. If you have an existing monolithic GraphQL server, Gateway could compose your schema with another schema that uses `neo4j-graphql-js`, enabling [incremental adoption](https://www.apollographql.com/docs/apollo-server/federation/introduction/#incremental-adoption).

### Schema augmentation
To support using schema augmentation with Federation, the `isFederated` configuration option can be set to `true`. For now, this does two things.

* Ensures the return format is a schema module - an object containing `typeDefs` and `resolvers`. A schema module is the expected argument format for `buildFederatedSchema`.
<br>
* The `isFederated` configuration flag is not required for supporting the use of `neo4jgraphql` to resolve a federated operation. However, two new kinds of resolvers are now generated during schema augmentation to handle entity [references](#resolving-entity-references) and [extensions](#resolving-entity-extension-fields).

---
## Defining an entity
### @key directive
An [entity](https://www.apollographql.com/docs/apollo-server/federation/entities) is an object type with its primary keys [defined](https://www.apollographql.com/docs/apollo-server/federation/entities/#defining) using a new [@key](https://www.apollographql.com/docs/apollo-server/federation/federation-spec/#key) type directive provided by Federation. When a service defines an object type entity, another service can [extend](http://spec.graphql.org/June2018/#ObjectTypeExtension) it, allowing that service to [reference](https://www.apollographql.com/docs/apollo-server/federation/entities/#referencing) it on fields and to [add fields](https://www.apollographql.com/docs/graphql-tools/generate-schema/#extending-types) to it that the service will be responsible for resolving. 

To define an object type as an entity, its primary key fields are provided to the `fields` argument of the `@key` type directive. This allows Apollo Gateway to identify `Account` type data between services. In the below schema, the `id` field of the `Account` type is specified as a key.

###### *Accounts*
```graphql
type Account @key(fields: "id") {
  id: ID!
  name: String
  username: String
}
```
###### *Products*
```graphql
type Product @key(fields: "upc") {
  upc: String!
  name: String!
  price: Int
}
```
###### *Reviews*
```graphql
type Review @key(fields: "id") {
  id: ID!
  body: String
  authorID: ID
}
```
---
## Referencing an entity
A reference to an entity defined in a given service occurs when that entity is used as the type of a field added to an entity defined in another service. 

With the above entities defined throughout three services, an entity is introduced from one service into another by using the GraphQL `extend` keyword. This allows for that entity to be referenced on fields of entities defined by the extending service. 

For example, we can extend the `Account` type in the reviews service and reference it as the type of a new `author` field on `Review`:

###### *Reviews schema*
```graphql
extend type Account @key(fields: "id") {
  id: ID! @external
}

type Review @key(fields: "id") {
  id: ID!
  body: String
  authorID: ID
  author: Account
}
```
### @external directive
Another new directive provided by Federation is the [@external](https://www.apollographql.com/docs/apollo-server/federation/federation-spec/#external) field directive. When a service extends an entity from another service, the `fields` of the `@key` directive for the entity must be marked as `@external` so field types can be known during runtime when Gateway builds a query plan.

### Resolving entity references
When the `Review` entity is the root field type of a query, the federated operation begins with the reviews service. If [neo4jgraphql](https://grandstack.io/docs/neo4j-graphql-js-api.html#neo4jgraphqlobject-params-context-resolveinfo-debug-executionresult-https-graphqlorg-graphql-js-execution-execute) is used to resolve the query, it will be translated under normal conditions:
###### *Reviews query*
```graphql
query {
  Review {
    id
    body
    author {
      id
    }
  }
}
```
###### *Reviews resolvers*
```js
Query: {
  async Review(object, params, context, resolveInfo) {
    return await neo4jgraphql(object, params, context, resolveInfo);
  }
}
```
This would result in querying `Account` type data in the reviews service to obtain the `id` key field for the `author` of each queried `Review`. In a federated schema, this `Account` type data for a `Review` `author` is called a **representation**. Field resolvers for fields of the entity type being represented provide representations to other services in order to fetch additional data for the entity, given its specified keys.

Here is an example of a resolver for the `author` field of the `Review` type in the reviews service, providing a representation of an `Account` entity.
```js
Review: {
  author(review, context, resolveInfo) {
    return { __typename: "Account", id: "1" };
  }
}
```
Because a query with `neo4jgraphql` resolves at the root field, all representations appropriate for the data the reviews service is responsible for are obtained and provided by the root field translation. When executing a federated query, `neo4jgraphql` decides a default `__typename`. The result is that field resolvers do not normally need to be written to provide representations.

In this example, we have not yet selected an *external* field of the `Account` entity which is *not* a key. We have only selected the field of an `Account` key the reviews service can provide. So there is no need to query the accounts service. If we were to select additional fields of the `Account` entity, such as `name`, which the reviews service is not responsible for resolving, it would result in the following:
###### *Query*
```graphql
query {
  Review {
    id
    body
    author {
      name
    }
  }
}
```
###### *Reviews query*
Gateway would delegate the following selections to the reviews service:
```graphql
query {
  Review {
    id
    body
    author {
      id
    }
  }
}
```
The `Account` entity representation data resolved for the `author` field would then be provided to a [new kind of resolver](https://www.apollographql.com/docs/apollo-server/federation/entities/#resolving) defined with a [__resolveReference](https://www.apollographql.com/docs/apollo-server/api/apollo-federation/#__resolvereference) function in the `Account` type resolvers of the accounts service.
> An implementing service uses reference resolvers for providing data to other services for the fields it resolves for any entities it defines. These reference resolvers are generated during schema augmentation.
###### *Accounts resolvers*
```js
Account: {
  async __resolveReference(object, context, resolveInfo) {
    return await neo4jgraphql(object, {}, context, resolveInfo);
  }
}
```
###### *Accounts query*
In this case, Gateway delegates resolving the following selections to the accounts service.
```graphql
query {
  Account {
    name
  }
}
```
When deciding how to use `neo4jgraphql` to resolve the `author` field, there are a few possibilities we can consider. We may use a property on the `Review` type in a [@cypher](neo4j-graphql-js.md#cypher-directive) directive on its `author` field to select related `Account` data.
###### *Reviews schema*
```graphql
type Review @key(fields: "id") {
  id: ID!
  body: String
  authorID: ID
  author: Account
    @cypher(statement: """
      MATCH (a:Account {
        id: this.authorID
      })
      RETURN a
    """)
}
```
If `Review` and `Account` data are stored in Neo4j as a [property graph](https://neo4j.com/developer/graph-database/#property-graph), we can use the [@relation](neo4j-graphql-js.md#start-with-a-graphql-schema) field directive to support generated translation to Cypher that selects the related `Account` through [relationships](https://neo4j.com/docs/getting-started/current/cypher-intro/patterns/#cypher-intro-patterns-relationship-syntax).
```graphql
type Review @key(fields: "id") {
  id: ID!
  body: String
  author: Account
    @relation(name: "AUTHOR_OF", direction: IN)
}
```
In both cases, the `id` field from each selected `Account`, related to each resolved `Review` in some way, is provided from the reviews service to the accounts service. These representations are then used by the accounts service to select `Account` entities and return a value for the `name` field of each.

The situation is similar with the `product` field on the `Review` entity in our example.
```graphql
extend type Account @key(fields: "id") {
  id: ID! @external
}

extend type Product @key(fields: "upc") {
  upc: ID! @external
}

type Review @key(fields: "id") {
  id: ID!
  body: String
  author: Account
    @cypher(statement: """
      MATCH (a:Account {
        id: this.authorID
      })
      RETURN a
    """)
  product: Product
    @relation(name: "REVIEW_OF", direction: OUT)
}
```
In this case, the products service would need to use a reference resolver for the `Product` entity, in order to provide its `name`, `price`, or `weight` fields when selected through the `product` field referencing it.

###### *Products resolvers*
```js
Product: {
  async __resolveReference(object, context, resolveInfo) {
    return await neo4jgraphql(object, {}, context, resolveInfo);
  }
}
```
---
## Extending an entity
An [extension](https://www.apollographql.com/docs/graphql-tools/generate-schema/#extending-types) of an entity defined in a given service occurs when a field is added to it by another service. This enables concern-based separation of types and fields across services. Expanding on the example schema of the reviews service, a `reviews` field is added to the type extension of the `Account` entity below.
###### *Reviews*
```graphql
extend type Account @key(fields: "id") {
  id: ID! @external
  name: String @external
  reviews(body: String): [Review]
    @relation(name: "AUTHOR_OF", direction: OUT)
}

type Review @key(fields: "id") {
  id: ID!
  body: String
  author: Account
    @relation(name: "AUTHOR_OF", direction: IN)
  product: Product
    @relation(name: "REVIEW_OF", direction: OUT)
}

extend type Product @key(fields: "upc") {
  upc: ID! @external
  reviews(body: String): [Review]
    @relation(name: "REVIEW_OF", direction: IN)
}
```
### Resolving entity extension fields

Any other service that can reference the `Account` type can now select the `reviews` field added by the reviews service. The `Review` entity may or may not be the root field type of a query that selects the `reviews` field, so the reviews service may not receive the root operation. When it does, as with the following query, the normal type resolver for the `Review` field of the `Query` type would be called.
###### *Reviews query*
```graphql
query {
  Review {
    id
    body
    author {
      id
      name
      reviews
    }
  }
}
```
The root field type of a query that selects the `reviews` field may or may not be `Account`. The Gateway query plan may begin at the accounts service, or at some other service selecting the `reviews` field through a reference to the `Account` entity when it is used as the type of a field on another entity defined by the other service. In the below example, the accounts service initially receives the query.
###### *Accounts query*
```graphql
query {
  Account {
    id
    name
    reviews
  }
}
```
In any case, after the service that receives the root query resolves data for any selected `Account` fields it's responsible for (keys, etc.), the query plan will send any obtained `Account` representations to the reviews service for use in resolving the `reviews` field selection set its responsible for, such as `body`, from appropriately related `Review` entity data.

Resolving fields added to entities from other services also requires the new [__resolveReference](https://www.apollographql.com/docs/apollo-server/api/apollo-federation/#__resolvereference) type resolver. In the case of the `reviews` field added to the `Account` extension, the reviews service must provide a reference resolver for the `Account` entity in order to support resolving `Review` entity data selected through the `reviews` field.
 
> An implementing service uses reference resolvers for providing data to other services for the fields it resolves for any extensions of entities defined by other services. These reference resolvers are generated during schema augmentation.
###### *Accounts resolvers*
```js
Account: {
  async __resolveReference(object, context, resolveInfo) {
    const entityData = await neo4jgraphql(object, {}, context, resolveInfo);
    return {
      // Entity data possibly previously resolved from other services
      ...object,
      // Entity data now resolved for any selected fields this service is responsible for
      ...entityData
    };
  }
}
```
