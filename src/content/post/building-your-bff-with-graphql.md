---
title: "Building your BFF with GraphQL"
description: "Following the microservice architecture, we often have multiple API services and the developers need to ad-hoc integrate with them. This post is about using GraphQL to create a backend for front end as a unified aggregation layer at the edge."
pubDate: "Oct 15 2020"
tags:
  - Database
---

As a front-end developer, I love to focus on UI/UX and what the users see is a single monolithic product and they might not want to know about underlying APIs. Back-end developers often want to decouple the API layer. To achieve the dual goal, we can rely on GraphQL to build up a backend for the front end as an extra layer to consolidate and aggregate data from these API services and delivery to the front end side as a single endpoint.

Following the definition of BFF by Sam Newman and associates, the BFF is tightly coupled to a specific user experience and needs to aggregate multiple downstream calls to deliver user functionalities. Not to say nothing of we often have various clients such as web browser, mobile browser, iOS/Android application.

## Why GraphQL?

GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.

### Query for what you need

Each client has different perspectives about data shape, for example: getting user details (basic information, addresses, contacts…), the mobile version might have options to click to navigate to view the list of addresses or contacts, but in the web version with larger display area, it might display everything.

### Multiple queries at once request

Sometimes we need to make multiple API calls and will choose to fetch the data sequentially or parallelly, more logic and round trips added. With GraphQL you can make many requests at once.

### Static type generation

We can not avoid the benefit of static type when developing the application, that's why TypeScript has been increasing in its popularity for the last couple of years. Some tools offer TypeScript definition code generation from the GraphQL queries [GraphQL Code Generator](https://www.graphql-code-generator.com/ 'GraphQL Code Generator') or [Apollo Codegen](https://github.com/apollographql/apollo-tooling 'Apollo Codegen').

### Single source of truth for clients

We can choose to define all GraphQL schema before developing, the backend side could rely on the schema definition to develop, and the front end side can trust the data shape. Later when something needs to be changed from the other services, we have a less painful choice to patch the update.

### Rapid prototype development

GraphQL has a single endpoint and the client can decide which data to get. We can think it's like using raw queries to access the server database.

### Self-documented

To build up a GraphQL service, we need to create the schema for everything from model definition to resolvers. As the schema is tightly coupled with the development code we will naturally update the docs.

## GraphQL drawbacks

Since GraphQL has only one endpoint, it's nearly impossible to rely on HTTP cache control as well as route-based authorization rules.

Almost all people can point out that using a single endpoint will lead to a bottleneck and we have to spend time to scale and maintain the availability for that. Luckily we can learn from [how Netflix scales its API with GraphQL federation](https://netflixtechblog.com/how-netflix-scales-its-api-with-graphql-federation-part-1-ae3557c187e2 'how Netflix scales its API with GraphQL federation').

When applying GraphQL, people tend to migrate all other Restful APIs to GraphQL because using both of them feels weird for the perfectionist. Consequently, it always takes an extra workload for the development process.

When using GraphQL especially Apollo GraphQL, the client-side often comes with Apollo Client and it makes your client setup is more cumbersome.

A well-known problem when people explore GraphQL is N+1 queries, it's the same as the ORM problem. Of course, we might hear about DataLoader as a data fetching layer to reduce requests by batching and caching but to me, I'd prefer to do an eager query.