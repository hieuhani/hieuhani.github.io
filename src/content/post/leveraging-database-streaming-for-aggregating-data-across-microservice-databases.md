---
title: "Leveraging Database Streaming for aggregating data across microservice databases"
description: "Use database streaming to capture changes across all source databases, ensuring that our view remains up to date. Database streaming bridges the gap between OLTP and OLAP systems, enabling near-real-time reporting, analytics, and data aggregation without impacting the performance of our transactional systems"
pubDate: "November 08 2024"
tags:
  - Software Engineer
---

I'm working on an asset management product that is based on multiple independent underlying financial assets, such as cash, stocks, and certificates of deposit. The product requires an overview of all assets, which are aggregated from the independent databases of each product microservice.
Initially, the MVP version was implemented on the client side, but as the dataset grew, this became inefficient, particularly when handling pagination. We also have an ETL pipeline for batch processing, which works well for analytical purposes but is not suitable when customers need to see updated asset information immediately after each transaction.
We also handle cases where the accrual value increases due to special events, such as receiving bond coupons or the start of a new savings period. This means the data is sourced not only from the microservice databases but also from external events, which are captured and processed through a materialized view. This view aggregates data from multiple PostgreSQL sources and reacts to external events, such as those from Kafka, triggering a refresh.
To achieve this, we use database streaming to capture changes across all source databases, ensuring that our view remains up to date. Database streaming bridges the gap between OLTP and OLAP systems, enabling near-real-time reporting, analytics, and data aggregation without impacting the performance of our transactional systems. Change data capture (CDC) is implemented using techniques like WAL listening, snapshot comparisons, or comparing update timestamps.

While listening to the WAL for change data capture (CDC) is promising, setting up the necessary permissions can be complex. I spent hours configuring fine-grained grants for logical replication on specific tables, as most tutorials recommend using superuser roles or full table access, which is not ideal for my use case. Additionally, using WAL for CDC can lead to potential issues like runaway WAL growth, which needs to be carefully managed.

Using a CDC strategy that periodically streams query results is easier to set up, but it comes with certain limitations. It often requires changes to the data model, such as adding a timestamp or a cursor version column to track updates. Additionally, this approach cannot capture data deletions, which can be a significant drawback in some cases.

Initially, I tried implementing logical replication using Go, but I soon realized that managing WAL growth and building a reliable, scalable storage solution for LSN cursor offsets were significant challenges. Replicating the functionality of a mature solution like Debezium would take months, if not years, to achieve.

I had investigated some existing database streaming solutions, most of them were deployed to my local Kubernetes cluster therefore I can have some architecture insights to share.

1. PeerDB: Fast, simple, and cost effective Postgres replication
  PeerDB supports different modes of streaming - Log based (CDC),​ Cursor based (timestamp or integer)​ and XMIN based​.
  PeerDB's focus on peer-to-peer replication aligns well with its architecture for ensuring data consistency between different databases, but it may not be ideal for serving as a data source for online services that require low-latency, real-time access. Temporal helps PeerDB by orchestrating workflows such as schema synchronization, snapshotting, and heartbeats, providing resilience and scalability for these background processes.
  However, for online services where speed and availability are critical, you might face challenges with PeerDB, as its primary goal is robust data replication rather than acting as a high-throughput data source. The real-time demands of an OLTP system (such as handling immediate requests from web or mobile applications) require very low-latency access to the database, which might not be PeerDB's strength.

2. Materialize.com: Create and query strongly consistent, always up-to-date views on operational data without the complexity
  Continuous computation of updates to materialized views for fresh results, and with strong consistency. Define and query views using Postgres-compatible SQL.
  I appreciate the product introduction on the official website; it provides a clear overview of the methodologies also the characteristics for implementing cloud operational data ingestion from multiple data sources

* Analytical Data Warehouse: Excellent performance for complex, read-heavy queries but fundamentally built for batch updates of historical data. The time between an event happening in the real world to being available in a data warehouse is often measured in minutes to hours.
* Caches: Enable very fast access to stale data. It is extremely difficult to keep these reliably up to date and consistent. Cache misses can impact database availability.
* Stream Processors: Lower-level tools that require specialized expertise. Interactive and flexible access to data joined from new sources is difficult to achieve.
* Operational Databases: Built for high performance transaction processing, but not designed for complex read queries. Materialized views and summary tables can mitigate this, but at the cost of data freshness.
  To be honest, I've invested a lot in this project. I pulled the source code, reviewed the architecture, and examined the implementation because the API documentation wasn't comprehensive. This complex product offers a wide range of functionalities, with particular attention needed for non-functional aspects like data consistency, reliability, and performance. For example, I learned that ephemeral volumes on LVM Local PV perform better on network-attached storage. I spent a few days revising the Helm chart to deploy it on my cluster, but it wasn't usable due to missing components that I believe are essential.

  One more consideration is about licensing and support.
  > However, we're big believers in advancing the frontier of human knowledge. To that end, the source code of the standalone database engine is publicly available, in this repository, and licensed under the BSL 1.1, converting to the open-source Apache 2.0 license after 4 years. As stated in the BSL, use of the standalone database engine on a single node is free forever. Please be warned that this deployment model is not suitable for production use and we cannot offer support for it.

3. RisingWave is a Postgres-compatible SQL database engineered to provide the simplest and most cost-efficient approach for processing, analyzing, and managing real-time event streaming data.
  RisingWave has a clear page about the Premium Edition that helps me understand the differences between the versions. I’m, of course, willing to pay for the Premium Edition if necessary, but at the very least, the basic version should work.

  After experimenting with RisingWave for a few days, what I really appreciate is the documentation. It allowed me to set up my own installation seamlessly, both on my local cluster using Helm and on my development server using the Operator -- it was very straightforward.
  Exploring RisingWave’s GitHub repository, I noticed there are over 1,000 issues at first glance, but it seems they effectively manage tasks and milestones there. Reading through some of their enhancement issues gave me deeper insights into advanced aspects that need attention when running a database streaming system.
  I’ve completed my feature implementation using RisingWave. Now, I’ll focus on stress testing and setting up a monitoring system. Hopefully, everything will go smoothly.
