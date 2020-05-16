---
id: graphql-schema-directives
title: GraphQL Schema Directives
sidebar_label: GraphQL Schema Directives
---

This page provides an overview of the various GraphQL schema directives made available in neo4j-graphql.js. See the links in the table below for full documentation of each directive.

## What Are GraphQL Schema Directives

GraphQL schema directives are a powerful feature of GraphQL that can be used in the type definitions of a GraphQL schema to indicate non-default logic and can be applied to either fields on types. Think of a schema directive as a way to indicate custom logic that should be executed on the GraphQL server.

In neo4j-graphql.js we use schema directives to:

* help describe our data model (`@relation`) 
* implement custom logic in our GraphQL service (`@cypher`, `@neo4j_ignore`)
* help implement authorization logic (`@additionalLabel`, `@isAuthenticated`, `@hasRole`, `@hasScope`)

## Neo4j GraphQL Schema Directives

The following GraphQL schema directives are declared during the schema augmentation process and can be used in the type definitions passed to `makeAugmentedSchema`.


| Directive         | Arguments    | Description | Notes                                           |
| ------------------|--------------|-------------|-------------------------------------------------|
| `@relation`       | `name`, `direction` | Used to define relationship fields and types in the GraphQL schema | See the ["Designing Your GraphQL Schema" Guide](guide-graphql-schema-design.md) |
| `@cypher`         | `statement` | Used to define custom logic using Cypher | See the defining custom logic page |
| `@neo4j_ignore`   |             | Used to exclude fields or types from the Cypher query generation process. Use when implementing a custom resolver. | See the defining custom logic page |
| `@additionalLabels` | `labels` | Used for adding additional node labels to types. Can be useful for multi-tenant scenarios where an additional node label is used per tenant. | See [GraphQL Authorization page](neo4j-graphql-js-middleware-authorization.md#additionallabels)
| `@isAuthenticated` |            | Protects fields and types by requiring a valid signed JWT | See [GraphQL Authorization page](neo4j-graphql-js-middleware-authorization.md#isauthenticated) |
| `@hasRole`        | `roles`     | Protects fields and types by limiting access to only requests with valid roles | See [GraphQL Authorization page](neo4j-graphql-js-middleware-authorization.md#hasrole) |
| `@hasScope`       | `scopes`    | Protects fields and types by limiting access to only requests with valid scopes | See [GraphQL Authorization page](neo4j-graphql-js-middleware-authorization.md#hasscope) |

