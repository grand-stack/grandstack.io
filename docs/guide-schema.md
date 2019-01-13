---
id: guide-schema
title: Designing Your GraphQL Schema
sidebar_label: Schema Design
---

# GraphQL Schema Design Guide

This guide aims to give some best practices for designing GraphQL schemas for use with GRANDstack.

Unlike other GraphQL implementations where the entire GraphQL schema (including the Query and Mutation types) and defining resolvers, neo4j-graphql.js generates queries, mutations, and resolver implementations from only type definitions.

## What is a GraphQL schema?

A GraphQL schema defines the types and the fields available on each type, including references to other types. A GraphQL schema includes two special types `Query` and `Mutation` the fields of which define the entry points for the schema. In typical GraphQL implementations the Query and Mutation types must be defined by the developer, however in our case neo4j-graphql.js will handle generating CRUD queries and mutations based on our type definitions. We do however have the ability to define custom queries and mutations by either using a `@cypher` directive in our type definitions,effectively annotation the schema with a Cypher query, or implementing the resolver in code. See XXXXX for examples of each of those approaches.

## Graph Thinking

The official guide to GraphQL makes the observation that with GraphQL you model your business domain as a graph, which in the client presents an object-oriented like approach to data where objects reference other types, creating a graph. However, as GraphQL is data layer agnostic, the guide says developers are free to implement the backend however they wish. Well if we use a graph database on the backend, we don't need a mapping and translation layer, instead the type definitions can drive the database data model.

> Thinking in Graphs
It's Graphs All the Way Down * 
With GraphQL, you model your business domain as a graph

https://graphql.org/learn/thinking-in-graphs/#shared-language

### Nodes, relationships, and properties.

// TODO: insert labeled property graph image and how that maps to 
// great opportunity for hand drawn diagram with arrows 

In a graph database nodes are the entities in the graph, relationships connect them. We can store arbitrary key-value pairs as properties, these are the fields of our types in GraphQL.


## SDL

> Intro to SDL

In GraphQL we use the Schema Definition Language (SDL) to define our types in a language agnostic way. The SDL representation of our schema is just a string.

## Type Definitions

### Object Types And Fields

### Arguments

### Directives

`@cypher` -

`@relation` -

> Don't overuse @cypher - 

## Relationship types

## Understanding The Schema Augmentation Process

Perhaps schema generation would have been a better name, but when `makeAugmentedSchema` or `augmentSchema` are called, the type definitions

### Adding types to the schema

### Augmenting Types

The first aspect of the schema augmentation process is adding additional fields to each type. Fields for ordering, pagination, and exposing the internal _id are added to each type. See the documentation [here]() for ordering and [here]() for pagination and here for querying using the Neo4j internal id.

### Auto-Generating Queries and Mutations
 
One of the biggest productivity wins when using neo4j-graphql.js is the auto-generating CRUD operations (queries and mutations).  See the documentation here for examples of the auto-generated queries and mutations.

## Custom queries and mutations

The auto-generated queries and mutations allow us to query using exact matches on field values, but what if we want some more complex logic in how we want to query or create data?

> example using full text index or regular expression

> NOTE: future versions will include filter operations

## Resolvers

Resolvers are functions that define how to actually fetch the data from the data layer. When resolvers are combined with type definitions it can be said to be an executable schema. Because neo4j-graphql.js autogenerates CRUD resolvers for queries and mutations, you don't need to implement resolvers yourself - they are automagically added to the executable schema by calling `makeAugmentedSchema` or `augmentSchema`. However if you have some custom code beyond which can be defined using an `@cypher` directive, you can implement your own resolvers and pass those along. Here's an example:

> So what if I have some custom logic to be defined in my resolver?

// TODO: show how to define custom resolver and not have it overridden when passed to `makeAugmentedSchema`

## FAQ

* How to model properties on relationships?
	- Use `@relationship` 
* How to use date, DateTime, LocalDateTime, etc?
* Are `@cypher` and `@relation` directives specific to neo4j-graphql.js?
