---
id: graphql-schema-generation-augmentation
title: GraphQL Schema Generation And Augmentation
sidebar_label: Schema Generation And Augmentation
---


`neo4j-graphql.js` can create an executable GraphQL schema from GraphQL type definitions or augment an existing GraphQL schema, adding

- auto-generated mutations and queries (including resolvers)
- ordering and pagination fields
- filter fields

## Usage

To add these augmentations to the schema use either the [`augmentSchema`](neo4j-graphql-js-api.md#augmentschemaschema-graphqlschema) or [`makeAugmentedSchema`](neo4j-graphql-js-api.md#makeaugmentedschemaoptions-graphqlschema) functions exported from `neo4j-graphql-js`.

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

## Generated Queries

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

## Generated Mutations

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

## Ordering

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

## Pagination

`neo4j-graphql-js` support pagination through the use of `first` and `offset` parameters. These parameters are added to the appropriate fields as part of the schema augmentation process.

## Complex GraphQL Filtering

A `filter` argument is added to field arguments, as well as input types used to support them.

> Filtering is currently supported for scalar types, enums, and `@relation` fields. Filtering on `@cypher` directive fields, temporal fields and `@relation` types are not yet supported.

### `filter` Argument

The auto-generated `filter` argument is used to support complex filtering in queries. For example, to filter for Movies released before 1920:

```GraphQL
{
  Movie(filter: { year_lt: 1920 }) {
    title
  }
}
```

### Nested Filter

To filter based on the results of nested fields applied to the root, simply nest the filters used. For example, to search for movies whose title starts with "River" and has at least one actor whose name starts with "Brad":

```GraphQL
{
  Movie(
    filter: {
      title_starts_with: "River"
      actors_some: { name_contains: "Brad" }
    }
  ) {
    title
  }
}
```

### Logical Operators: `AND`, `OR`

Filters can be wrapped in logical operations `AND` and `OR`. For example, to find movies that were released before 1920 or have a title that contains "River Runs":

```GraphQL
{
  Movie(filter: { OR: [{ year_lt: 1920 }, { title_contains: "River Runs" }] }) {
    title
  }
}
```

These logical operators can be nested as well. For example, find movies that there were released before 1920 or have a title that contains "River" and belong to the genre "Drama":

```GraphQL
{
  Movie(
    filter: {
      OR: [
        { year_lt: 1920 }
        {
          AND: [{ title_contains: "River" }, { genres_some: { name: "Drama" } }]
        }
      ]
    }
  ) {
    title
  }
}
```

### Filtering In Selections

Filters can be used in not only the root query argument, but also throughout the selection set. For example, search for all movies that contain the string "River", and when returning the genres of the these movies only return genres with the name "Drama":


```GraphQL
{
  Movie(filter: { title_contains: "River" }) {
    title
    genres(filter: { name: "Drama" }) {
      name
    }
  }
}
```

### Filter Criteria

The filter criteria available depends on the type of the field and are added to the generated input type prefixed by the name of the field and suffixed with the criteria. For example, given the following type definitions:

```GraphQL
type Movie {
  movieId: ID!
  title: String
  year: Int
  rating: RATING
  available: Boolean
  actors: [Actor] @relation(name: "ACTED_IN", direction:"IN")
}
```

the following filtering criteria is available, through the generated `_MovieFilter` input type. 

*This table shows the fields available on the generated `_MovieFilter` input type, and a brief explanation of each filter criteria.*
|  | Field | Type            | Explanation                                  |
| ------------------|-------|-----------------|-----------------------------|
| **Logical operators**|    |                 |                             | 
|  | `AND`   | `[_MovieFilter]` | Use to apply logical AND to a list of filters, typically used when nested with OR operators |
|  | `OR`    | `[_MovieFilter]` | Use to apply logical OR to a list of filters.|
| **ID fields** | |||
|  | `movieId`        | `ID`   | Matches nodes when value is an exact match   |  
|  | `movieId_not`    | `ID`   | Matches nodes when value is not an exact match |   
|  | `movieId_in`     | `[ID!]`| Matches nodes based on equality of at least one value in list of values | 
|  | `movieId_not_in` | `[ID!]`| Matches nodes based on inequality of all values in list of values       |
| **String fields**|  |        |                                                                         |      
|  | `title`                 | `String`    | Matches nodes based on equality of value |
|  | `title_not`             | `String`    | Matches nodes based on inequality of value|
|  | `title_in`              | `[String!]` | Matches nodes based on equality of at least one value in list |
|  | `title_not_in`          | `[String!]` | Matches nodes based on inequality of all values in list |
|  | `title_contains`        | `String`    | Matches nodes when value contains given substring |
|  | `title_not_contains`    | `String`    | Matches nodes when value does not contain given substring      |
|  | `title_starts_with`     | `String`    | Matches nodes when value starts with given substring         |
|  | `title_not_starts_with` | `String`    | Matches nodes when value does not start with given substring        |
|  | `title_ends_with`       | `String`    | Matches nodes when value ends with given substring |
|  | `title_not_ends_with`   | `String`    | Matches nodes when value does not end with given substring |
| **Numeric fields**  |      |             | *Similar behavior for float fields*        |
|  | `year`                  | `Int`       | Matches nodes when value is an exact match |
|  | `year_not`              | `Int`       | Matches nodes based on inequality of value   |
|  | `year_in`               | `[Int!]`    | Matches nodes based on equality of at least one value in list |
|  | `year_not_in`           | `[Int!]`    | Matches nodes based on inequality of all values in list |
|  | `year_lt`               |  `Int`      | Matches nodes when value is less than given integer |
|  | `year_lte`              |  `Int`      | Matches nodes when value is less than or equal to given integer |
|  | `year_gt`               |  `Int`      | Matches nodes when value is greater than given integer |
|  | `year_gte`              |  `Int`      | Matches nodes when value is greater than or equal to given integer |
| **Enum fields**    |       |                  |         |
|  | `rating`                | `RATING_ENUM`    | Matches nodes based on enum value |
|  | `rating_not`            | `RATING_ENUM`    | Matches nodes based on inequality of enum value |
|  | `rating_in`             | `[RATING_ENUM!]` | Matches nodes based on equality of at least one enum value in list |
|  | `rating_not_in`         | `[RATING_ENUM!]` | Matches nodes based on inequality of all values in list |
| **Boolean fields**         |            |          |
|  | `available`             | `Boolean`         | Matches nodes based on value |
|  | `available_not`         | `Boolean`         | Matches nodes base on inequality of value |
| **Relationship fields**|   |                   | *Use a relationship field filter to apply a nested filter to matches at the root level* |
|  | `actors`                | `_ActorFilter`    | Matches nodes based on a filter of the related node |
|  | `actors_not`            | `_ActorFilter`    | Matches nodes when a filter of the related node is not a match |
|  | `actors_in`             | `[_ActorFilter!]` | Matches nodes when the filter matches at least one of the related nodes |
|  | `actors_not_in`         | `[_ActorFilter!]` | Matches nodes when the filter matches none of the related nodes |
|  | `actors_some`           | `_ActorFilter`    | Matches nodes when at least one of the related nodes is a match |
|  | `actors_none`           | `_ActorFilter`    | Matches nodes when none of the related nodes are a match |
|  | `actors_single`         | `_ActorFilter`    | Matches nodes when exactly one of the related nodes is a match |
|  | `actors_every`          | `_ActorFilter`    | Matches nodes when all related nodes are a match|

See the [filtering tests](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/test/tck/filterTck.md) for more examples of the use of filters.

## Configuring Schema Augmentation

You may not want to generate Query and Mutation fields for all types included in your type definitions, or you may not want to generate a Mutation type at all. Both `augmentSchema` and `makeAugmentedSchema` can be passed an optional configuration object to specify which types should be included in queries and mutations.

### Disabling Auto-generated Queries and Mutations

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

### Excluding Types

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