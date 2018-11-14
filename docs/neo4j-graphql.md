---
id: neo4j-graphql
title: Neo4j-GraphQL
sidebar_label: Neo4j-GraphQL Overview
---

Neo4j-GraphQL is an integration that translates GraphQL to Cypher and allows for inclusion of Cypher in GraphQL through the use of `@cypher` GraphQL schema directives. There are two versions of the integration available depending on the architecture of your application.

![Neo4j-GraphQL Logo](/docs/assets/img/neo4j-graphql-logo.png)

## Overview

The primary goal of the Neo4j-GraphQL integrations are to make it easy to build powerful GraphQL APIs that leverage the Neo4j graph database.

### Goals

- Improve developer productivity for building GraphQL APIs
- "Auto-generate" resolvers by translating GraphQL to Cypher
- Exposing Cypher through GraphQL to enhance the functionality of GraphQL

<iframe width="560" height="315" src="https://www.youtube.com/embed/YC0HIaby_zA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

There are two versions of the Neo4j-GraphQL integrations: [`neo4j-graphql-js`](neo4j-graphql-js.md) and the [Neo4j-GraphQL database plugin](neo4j-graphql-plugin.md):

## `neo4j-graphql-js`

Neo4j-graphql-js is a JavaScript library available on NPM that is designed to work with any of the JavaScript GraphQL server implementations (such as Apollo Server, GraphQL Yoga, etc).

It works by inspecting the `resolveInfo` object passed to each GraphQL resolver to translate GraphQL to Cypher and handle the database call through an `neo4j-javascript-driver` instance that is injected into the context.

## Neo4j-GraphQL Plugin

The Neo4j-GraphQL plugin is a database plugin for Neo4j. It extends Neo4j by serving a GraphQL endpoint directly from Neo4j.

Using the Neo4j-GraphQL plugin makes sense if you don't have other data sources for your GraphQL API, if you don't need to implement custom resolvers (beyond the custom logic of a `@cypher` schema directive), and if your clients querying the database directly is acceptable for your architecture.

## Resources

- [Five Common GraphQL problems and how Neo4j-GraphQL aims to solve them.](https://blog.grandstack.io/five-common-graphql-problems-and-how-neo4j-graphql-aims-to-solve-them-e9a8999c8d43) [Blog post].
- [Neo4j-GraphQL Developer page.](https://neo4j.com/developer/graphql/)
- [Query Graphs with GraphQL Youtube video](https://www.youtube.com/watch?v=0EmZjheYv-U) (Neo4j online meetup recording)
