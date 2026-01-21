---
author: Johannes Pieringer
date: '2014-11-20T12:01:28+00:00'
slug: goto-conference-berlin-2014
tags:
- conference
title: GoTo Conference Berlin 2014
---

The GoTo Conference Berlin is part of a conference series with stops in Berlin, Chicago, Amsterdam, Aarhus and Copenhagen. The 3 day conference was divided in workshops on the first day and talks on the second and third day.

The talks and the catering were very well organized. The only drawback was, that the WLAN wasn't working most of the time.

Now lets go through the talks:

<!--more-->

## Software Development in the 21st Century by Martin Fowler

Martin Folwer talked in the Keynote about Microservices. He formulated following common characteristics:
<ul>
	<li>Broken to components:
Independently upgradeable and replaceable services</li>
	<li>Organized around business capabilities:
The services are developed by cross-functional teams</li>
	<li>Products not Projects:
The team isn't done when the service is finished, but it should take full responsibility for the software in production</li>
	<li>Smart endpoints and dumb pipes:
Business Logic and routing should only be implemented by the services</li>
	<li>Decentralized Governance:
The teams can use different technologies for their services, depending on the use case</li>
	<li>Decentralized Data Management:
Every service is responsible for its own databases and must ONLY talk to its own database.
Not integration within the DB</li>
	<li>Infrastructure Automation:
Continuous Delivery, Installation, Monitoring..</li>
	<li>Design for Failure:
You have to assume things are going to brake</li>
	<li>Evolutionary Design</li>
</ul>
Fowler stated that every microservice should be understandable by a single person.

Microservices have certain advantages and disadvantages compared to a monolithic applications:
<ul>
	<li>Monolith
<ul>
	<li>Simplicity (Up to a certain size, no remote calls...)</li>
	<li>Consistency (Only a single database)</li>
	<li>Inter-module refactoring (Module boundaries can be changed more easily)</li>
</ul>
</li>
	<li>Microservices
<ul>
	<li>Partial Deployment</li>
	<li>Availability (If one service is down, the others might still be running)</li>
	<li>Preserve Modularity</li>
	<li>Multiple Platforms (Possible but maybe not 20 different languages)</li>
</ul>
</li>
</ul>
The talk was very interesting, a more in-depth article about microservices can be found at <a title="http://martinfowler.com/articles/microservices.html" href="http://martinfowler.com/articles/microservices.html" target="_blank">http://martinfowler.com/articles/microservices.html</a>

## Make sense of your logs by Britta Weber
Britta Weber talked about the ELK software stack consisting of Elastic Search, Logstash and Kibana. The combination of the three open source tools should allow us to gain new insights in our log files.

<strong>Logstash</strong> is used to collect, parse and enrich the existing stored data like log files. Logstash uses three steps to accomplish that:
<ul>
	<li>Input (database, log files, queues...)</li>
	<li>Filter (parse, enrich, tag, drop,..)</li>
	<li>Output (database, email, pager, chat,...)</li>
</ul>
<strong>Elasticsearch</strong> is fed with the preprocessed data from Logstash. The search and analytics engine of elasticsearch is used to execute queries.

<strong>Kibana</strong> is elasticsearch's data visualization engine. It can be used to perform data analysis. The results of the queries can be visualized with different diagrams.

&nbsp;