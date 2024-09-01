---
title: "Client-to-microservice communication strategy in a nutshell"
description: "In recent years, microservice architecture has been becoming popular and being widely adopted by many various companies. The outcome often comes with several API services. In most cases, the client-side should be the one to aggregate data from different API services to deliver a seamless experience to the end-user."
pubDate: "Sep 12 2020"
tags:
  - Architecture
---

In recent years, microservice architecture has been becoming popular and being widely adopted by many various companies. The outcome often comes with several API services. In most cases, the client-side should be the one to aggregate data from different API services to deliver a seamless experience to the end-user.

Before digging in, I would scope the terms using in this post:

- Client — A client may be a SPA website, a server sider rending website, a mobile application, an IoT device, or other integration services… but we will focus on web and mobile applications.
- Web service APIs — There are SOAP, RPC (JSON-RPC, XML RPC, gRPC), REST.
- Realtime APIs techniques — There are HTTP Long polling, Websocket, WebRTC, MQTT…
- Web rendering techniques — Client-side rendering (initialize with HTML and CSS then the content comes from Javascript), Server-side rendering (server responses an HTML string), Universal rendering (combine the best of both client-side rendering and server-side rendering)

Choosing the technique to integrate clients and servers to use depends on the context of the application and these use cases. As a front end developer, we usually concern about:

- Service API endpoint: This will be the first question then are there multiple API endpoints or a single API endpoint?
- Authentication: Cookies or JWT Bearer token?
- Protocol: REST, RPC or do we need to support realtime with WebSocket or Long Polling?
- Response data: What is the data interchange format is using? JSON or XML, gRPC? What about metadata conversion? Is the key field in the camel or snake case? What about data normalization?
- Data synchronization: How we consolidate data from the server with client data?
- Cooking data: when dealing with multiple data sources, we will need to compute derived data, but should that task is in server or client?

In a microservice architecture, the communication between services is also the most important factor, and they may use different effective protocols, data formats and that maybe not friendly with web front end developer (gRPC for example) but to support the client, they might need to expose extra HTTP Restful endpoint. Each microservice exposes a set of fine-grained endpoints and this can impact client-to-microservice communication.

To easier catch up the problem, let’s imagine that we are developing a shopping application (I would get the example from [this blog post](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/#product-details-scenario 'this blog post')) and it’s likely that you need to implement a product details page.

[![Amazon’s Android mobile application.](https://cdn.wp.nginx.com/wp-content/uploads/2016/04/Richardson-microservices-part2-1_amazon-apps.png)](https://cdn.wp.nginx.com/wp-content/uploads/2016/04/Richardson-microservices-part2-1_amazon-apps.png 'Amazon’s Android mobile application.')

This page does not only show the basic information such as name, description, price, but it may also show:

- Shopping cart items
- Order history
- Customer reviews
- Inventory status
- Shipping options
- Promotion information
- Product recommendation
- …

To have data to display this page in the microservice, the client has to communicate with:

- Shopping cart service — to get the information about a user cart, it is not all about the cart items, it may need just a number of items in the cart
- Order service — to display the brief of order information, it may need just the last order time
- Inventory service — to display the inventory status, but it also needs just the number of remaining items or it may ask the policy service to display the buying tag, such as: Out of stock or Contact or Available in different locations…
- Shipping service — to display the information about the shipping option, it is also not everything in the shipping entity response.
- Realtime promotion service — when you see the customer stays in this product too long and you want to encourage her to buy, a promotion may be distributed…
- …

I guess you may think in mind: Oh, just a simple page consumes data from so many data sources (API services) or the number of items in the cart is just a number, does it necessary to get the whole cart data? Will the cart service expose an endpoint just for returning the number of items in the cart? When we want to personalize data by some factors like a user gender, location, or age range…it is so messed up.

Now, it is enough background to get in, let’s look at 2 popular options.

## Direct client-to-microservice communication

A client app can make requests directly to some of the microservices.

[![Using a direct client-to-microservice communication architecture](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication.png)](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication.png 'Using a direct client-to-microservice communication architecture')

This communication architecture could be good enough for a small microservice-based application. However, when you build large and complex applications as the example above, that approach faces a few issues.

Consider the following questions/issues when developing a large application based on microservices:

- How can client apps minimize the number of network requests to the backend and reduce chatty communication to multiple services?
- What do we do when we need data from multiple dependant services?
- How can client apps communicate with services that use non-Internet-friendly protocol?
- The front end developers need to know multiple areas of the application are decomposed in microservices.
- Too many round trips can result in multiple network round trips between the client and the server, adding significant latency.
- Security issues also need to be a concern because all the microservices must be exposed to the ‘external world’, making the attack surface larger.

## API Gateway

### Single API Gateway

This is a service that provides a single-entry point for certain groups of microservices. It’s similar to the [Facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) from object-oriented design, but in this case, it’s part of a distributed system.

Therefore, the API gateway sits between the client and the microservices, it plays as a reverse proxy, routing requests to services and can also provide additional cross-cutting features such as authentication and cache.

[![Using a custom API Gateway service](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication-versus-the-api-gateway-pattern/custom-service-api-gateway.png)](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication-versus-the-api-gateway-pattern/custom-service-api-gateway.png 'Using a custom API Gateway service')

This API gateway will be growing and maybe bloated and could be similar to a monolithic service.

### Multiple API Gateways

API Gateways should be segregated based on business boundaries. Or we can choose to develop a different API Gateway for different clients (mobile or web). In this case, we have a pattern “Backend for Frontend” ([BFF](https://samnewman.io/patterns/architectural/bff/)) where each API Gateway can provide a different API tailored for each client.

[![Using multiple custom API Gateways](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication-versus-the-api-gateway-pattern/multiple-custom-api-gateways.png)](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication-versus-the-api-gateway-pattern/multiple-custom-api-gateways.png 'Using multiple custom API Gateways')

At Netflix, they have also adopted this pattern: the Backend for Frontend pattern per client (Android, iOS, TV, Web).

### API Gateway drawbacks

- Creating an additional possible single point of failure
- If not scaled out properly, the API gateway can become a bottleneck
- Requiring additional development cost and future maintenance
- It will slow down the team development if we do not prepare the adoption plan carefully

Everything comes with pros and cons, especially choosing things not as simple as comparing the number of pros and cons, following the trend, or seeing others do that. To me, I tend to follow the core principle or the concept of how it works. Then I will choose if it matches the spirit or the strategic direction.

**Direct client-to-microservice communication** — front-end developers need to spread tasks for API data integration from multiple services and developing UI/UX. This way is appropriate when the team skill is comprehensive, good in both data manipulation and aesthetic ability.

**API gateway** is centralized management, API gateway has the ability to focus on what it does with a huge of supporting tools, the result is front end developers can focus on developing better UI/UX for end-user without requiring time for the complexity of data integration. This way is appropriate when we have a specialized team.

Next post I will write about using GraphQL to implement the BFF pattern. I choose GraphQL because the concept is very simple: instead of having multiple “dumb” endpoints, have a single “smart” endpoint that can take in complex queries, and then massage the data output into whatever shape the client requires.

## References

[.NET Microservices — Architecture e-book](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/): I use this resource for the concept and the standard term.

[Building Microservices: Using an API Gateway](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/): I follow this series to understand Microservice.

[Processes, Motivations, and Issues for Migrating to Microservices Architectures: An Empirical Investigation](https://www.researchgate.net/publication/319187656_Processes_Motivations_and_Issues_for_Migrating_to_Microservices_Architectures_An_Empirical_Investigation): I refer to this paper for the numbers, statistics, of these researchers to avoid opinionated thinking.

[Building a Decoupled Architecture to Optimize our Mobile Apps](https://medium.com/walmartglobaltech/building-a-decoupled-architecture-to-optimize-our-mobile-apps-7bc4a0d6da37): From
Walmart, I can learn the cost of having a legacy architecture.

[Smart endpoints and dumb pipes design principle](https://simplicable.com/new/smart-endpoints-and-dumb-pipes)