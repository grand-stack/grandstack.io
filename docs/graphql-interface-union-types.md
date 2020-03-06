---
id: graphql-interface-union-types
title: Using GraphQL Interface And Union Types
sidebar_label: Interface and Union Types
---

## Overview

This page describes how interface and union types can be used with neo4j-graphql.js. 

GraphQL supports two kinds of abstract types: interfaces and unions. Interfaces are abstract types that include a set of fields that all implementing types must include. A union type indicates that a field can return one of several object types, but doesn't specify any fields that must be included in the implementing types of the union. See the GraphQL documentation to learn more about [interface](https://graphql.org/learn/schema/#interfaces) and [union](https://graphql.org/learn/schema/#union-types) types.



When interfaces are useful

When unions are useful

How to define interface in SDL

How interfaces map to property graph model

## Interface Types

### Defining In SDL

### Interface Mutations

```GraphQL
mutation {
  CreateUser(name:"Bob", screenName: "bobbyTables") {
    id
  }
}
```


```GraphQL
{
  "data": {
    "CreateUser": {
      "id": "a60bf1bb-e887-44f6-b1bb-d944ff8c2d3a"
    }
  }
}
```

// TODO: combine into fewer mutations

```GraphQL
mutation {
  CreateActor(name:"Brad Pitt") {
    id
  }
}
```

```GraphQL
mutation {
  CreateMovie(title:"River Runs Through It, A") {
    movieId
  }
}
```

```GraphQL
{
  "data": {
    "CreateMovie": {
      "movieId": "1a5b49e7-b354-4aa7-95a1-431446f5d77b"
    }
  }
}
```

```GraphQL
mutation {
  AddActorMovies(from:{id: "f474e9a4-15e8-4bda-b9f9-0fff45732ee3"}, to: {movieId: "1a5b49e7-b354-4aa7-95a1-431446f5d77b"}) {
    from {
      name
    }
    to {
			title
    }
  }
}
```

### Interface Queries

```GraphQL
query {
  Person {
		name
  }
}
```


```GraphQL
{
  "data": {
    "Person": [
      {
        "name": "Bob"
      },
      {
        "name": "Brad Pitt"
      }
    ]
  }
}
```


Add __typename

```GraphQL
query {
  Person {
		name
    __typename
  }
}
```

```GraphQL
{
  "data": {
    "Person": [
      {
        "name": "Bob",
        "__typename": "User"
      },
      {
        "name": "Brad Pitt",
        "__typename": "Actor"
      }
    ]
  }
}
```

With inline fragments

```GraphQL
query {
  Person {
    name
    __typename
    ... on Actor {
      movies {
        title
      }
    }

    ... on User {
      screenName
    }
  }
}
```


```GraphQL
{
  "data": {
    "Person": [
      {
        "name": "Bob",
        "__typename": "User",
        "screenName": "bobbyTables"
      },
      {
        "name": "Brad Pitt",
        "__typename": "Actor",
        "movies": [
          {
            "title": "River Runs Through It, A"
          }
        ]
      }
    ]
  }
}
```

With filter argument

```GraphQL
query {
  Person(filter: {name_contains:"Brad"}) {
		name
    __typename
    ... on Actor {
      movies {
        title
      }
    }
    
    ... on User {
      screenName
    }
  }
}
```

```GraphQL
{
  "data": {
    "Person": [
      {
        "name": "Brad Pitt",
        "__typename": "Actor",
        "movies": [
          {
            "title": "River Runs Through It, A"
          }
        ]
      }
    ]
  }
}
```

On relationship fields

```GraphQL
  friends: [Person] @relation(name: "FRIEND_OF", direction: OUT)

```

## Union Types

// Find some other schema that isn't built off the previous

### Defining In SDL

### Union Mutations

### Union Queries


Use with @cypher directive field for full text index

### Use Without Specifying Relationship Type

## Using Union and Interface Types Together

Note that we cannot have interfaces in unions, but we can inclue the _implementing_ type in a union.

> NOTE: not yet implmented for relationship types