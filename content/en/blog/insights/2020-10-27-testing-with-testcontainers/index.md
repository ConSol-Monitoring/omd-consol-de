---
author: Martin Kurz
date: '2020-10-27'
featured_image: testcontainers-logo.png
meta_description: When to use Testcontainers
tags:
- integration-tests
title: Integration testing with Testcontainers
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

Automatic integration tests as part of the development life cycle can save a lot of time and money. Not only when dealing with other service APIs or offering some, also if the application uses a database or other infrastructure services.

We at Consol made a lot of good experience to develop the integration tests as part of the life cycle from the beginning of a project. Therefor the [Citrus framework](https://citrusframework.org) is often a good choice to do it automated.

But there are other frameworks and libraries which can be useful. In this article, we'll have a look at [Testcontainers](https://testcontainers.org). By using a sample microservice, we will show how Testcontainers can be used and what chances it provides.
<!--more-->

## About Citrus

The Citrus framework was started to develop in the year 2006 and it still meets the main purpose to do automated integration testing. It offers a lot of possibilities to connect with third party systems, send or receive messages and act as a server or client. Like in a sequence diagram it allows to define and test the complete flow of a message through the systems. Additionally it can generate random data and do the validation of received messages as fine granular as desired.

If you would like to get some detailed information about what exactly Citrus is and what can be tested take a look at the [documentation](http://citrusframework.org/citrus/reference/html/index.html) or directly try out some [samples](http://citrusframework.org/samples/).

## About Testcontainers
Testcontainers is a Java library that:

> supports JUnit tests, providing lightweight, throwaway instances of common databases, Selenium web browsers, or anything else that can run in a Docker container.

The main purpose of it is to set up the required infrastructure (services) for unit tests. But it also supports to run frontend tests in containerized web browsers. With the approach of a `GenericContainer` it allows the usage of every available docker image. For further information you can visit: [https://www.testcontainers.org/](https://www.testcontainers.org/)

## The sample application

In this article we will use a Java 11 Maven project with Spring Boot and Apache Camel. The application subscribes to a queue and stores each message to a database while it also publishes it to a topic. As a special challenge we will add a transactional behaviour: if something went wrong after storing the message to the database, the database entry should be reverted. This means we expect to have no entry in the database and no message on the topic if an error occurs. This behavior should be covered with tests.

![](sequence_use_case.png)

As infrastructure services we will use Active MQ Artemis and PostgreSQL.

## Testing it with Testcontainers

Basically testcontainers definitions are unit tests. This means that the required dependencies should be only in `<scope>test</scope>` while the test classes are placed in `src/test/java`. For our microservice we only need the following dependencies:

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <version>${testcontainers-version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>${testcontainers-version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>${testcontainers-version}</version>
    <scope>test</scope>
</dependency>
```

The next step is the definition of the test class, which needs a `@Testcontainers` annotation additionally to the Spring ones, to activate the active profile etc.

For our scenario we need now to define the containers for the database as well as for the message broker. There is a special `PostgreSQLContainer` offered by Testcontainers which ships with some useful functionality. The message broker will be a `GenericContainer` which is also enough for us. As I personally prefer small and clean setups I decided to use the [Alpine Linux](https://alpinelinux.org) images of PostgreSQL and Active MQ Artemis.

In order to prevent from race conditions the containers should wait until the necessary service has been started.

{% highlight java hl_lines="3 9" %}
@Container
static PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:alpine")
        .waitingFor(Wait.forLogMessage(".*database system is ready to accept connections.*\\s", 1));

@Container
static GenericContainer<?> activeMQContainer = new GenericContainer<>("vromero/activemq-artemis:latest-alpine")
        .withExposedPorts(61616)
        .withEnv("DISABLE_SECURITY", "true")
        .waitingFor(Wait.forLogMessage(".*AMQ221007: Server is now live.*\n", 1));;
{% endhighlight %}

At this point both containers will boot up. As soon as they are ready, the spring application will be started as well. It is important to configure the Spring application to use random allocated ports of the test containers:

```java
@DynamicPropertySource
static void registerDynamicProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgreSQLContainer::getJdbcUrl);
    registry.add("spring.datasource.username", postgreSQLContainer::getUsername);
    registry.add("spring.datasource.password", postgreSQLContainer::getPassword);

    registry.add("spring.artemis.port", activeMQContainer::getFirstMappedPort);
}
```

We are now ready to test the setup and ensure that the containers started correctly as well as our system under test. This can be easily seen in the log output:

```text
[...]
org.testcontainers.dockerclient.DockerClientProviderStrategy - Loaded org.testcontainers.dockerclient.UnixSocketClientProviderStrategy from ~/.testcontainers.properties, will try it first
org.testcontainers.dockerclient.DockerClientProviderStrategy - Found Docker environment with local Unix socket (unix:///var/run/docker.sock)
org.testcontainers.DockerClientFactory - Docker host IP address is localhost
org.testcontainers.DockerClientFactory - Connected to docker: 
  Server Version: 19.03.13
  API Version: 1.40
  Operating System: Docker Desktop
  Total Memory: 3940 MB
org.testcontainers.DockerClientFactory - Ryuk started - will monitor and terminate Testcontainers containers on JVM exit
org.testcontainers.DockerClientFactory - Checking the system...
org.testcontainers.DockerClientFactory - ✔︎ Docker server version should be at least 1.6.0
org.testcontainers.DockerClientFactory - ✔︎ Docker environment should have more than 2GB free disk space
🐳 [vromero/activemq-artemis:latest-alpine] - Creating container for image: vromero/activemq-artemis:latest-alpine
🐳 [vromero/activemq-artemis:latest-alpine] - Starting container with ID: d454b28985ee5654287a72ac1700d53c3fd15b331b704132ad822037da7770b7
🐳 [vromero/activemq-artemis:latest-alpine] - Container vromero/activemq-artemis:latest-alpine is starting: d454b28985ee5654287a72ac1700d53c3fd15b331b704132ad822037da7770b7
🐳 [vromero/activemq-artemis:latest-alpine] - Container vromero/activemq-artemis:latest-alpine started in PT14.199709S
🐳 [postgres:alpine] - Creating container for image: postgres:alpine
🐳 [postgres:alpine] - Starting container with ID: 8ca61a20b7fc2e089a838e4e673d7fe10cdbc6c27ee2cadd49855823b8821c23
🐳 [postgres:alpine] - Container postgres:alpine is starting: 8ca61a20b7fc2e089a838e4e673d7fe10cdbc6c27ee2cadd49855823b8821c23
🐳 [postgres:alpine] - Container postgres:alpine started in PT3.230064S

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.3.2.RELEASE)

com.consol.testcontainers.transaction.ApplicationTest - Starting ApplicationTest on marts.local with PID 35942 (started by martin)
com.consol.testcontainers.transaction.ApplicationTest - Running with Spring Boot v2.3.2.RELEASE, Spring v5.2.8.RELEASE
com.consol.testcontainers.transaction.ApplicationTest - The following profiles are active: test
org.springframework.context.support.PostProcessorRegistrationDelegate$BeanPostProcessorChecker - Bean 'org.apache.camel.spring.boot.CamelAutoConfiguration' of type [org.apache.camel.spring.boot.CamelAutoConfiguration] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
org.apache.camel.support.LRUCacheFactory - Detected and using LRUCacheFactory: camel-caffeine-lrucache
org.apache.camel.impl.engine.DefaultCamelBeanPostProcessor - No CamelContext defined yet so cannot inject into bean: org.apache.camel.impl.health.DefaultHealthCheckRegistry
org.apache.camel.impl.engine.BaseExecutorServiceManager - Using custom DefaultThreadPoolProfile: ThreadPoolProfile[default (true) size:20-20, keepAlive:60 SECONDS, maxQueue:1000, allowCoreThreadTimeOut:true, rejectedPolicy:CallerRuns]
org.apache.camel.spring.boot.SpringBootRoutesCollector - Loading additional Camel XML routes from: classpath:camel/*.xml
org.apache.camel.spring.boot.SpringBootRoutesCollector - Loading additional Camel XML rests from: classpath:camel-rest/*.xml
org.apache.camel.impl.engine.AbstractCamelContext - Apache Camel 3.4.2 (camel-1) is starting
org.apache.camel.impl.engine.AbstractCamelContext - MDC logging is enabled on CamelContext: camel-1
org.apache.camel.impl.engine.AbstractCamelContext - StreamCaching is not in use. If using streams then its recommended to enable stream caching. See more details at http://camel.apache.org/stream-caching.html
org.apache.camel.impl.engine.AbstractCamelContext - Using HealthCheck: camel-spring-boot
org.apache.camel.spring.boot.CamelSpringBootApplicationListener - Starting CamelMainRunController to ensure the main thread keeps running
org.apache.camel.impl.engine.InternalRouteStartupManager - Route: UC started and consuming from: jms://queue:sourceQueue
org.apache.camel.impl.engine.AbstractCamelContext - Total 1 routes, of which 1 are started
org.apache.camel.impl.engine.AbstractCamelContext - Apache Camel 3.4.2 (camel-1) started in 6.053 seconds
com.consol.testcontainers.transaction.ApplicationTest - Started ApplicationTest in 16.737 seconds (JVM running for 38.764)
```

Now let's write some useful tests :-)

First of all we need to initialize the database. Therefore, we simply add a setup script to the resources and configure it in the container definition `.withInitScript("db_init.sql")`.

As we need to interact with the database as well as with the message broker, we will use JdbcTemplate and JmsTemplate which can easily be added with `@Autowired`.

The test itself must take care of a clean environment on every run. Testing a good case scenario could look like this:

```java
// clear database
jdbcTemplate.execute("TRUNCATE t_testcontainers");

// the send and expected message
String message = "{\"id\": 42, \"name\": \"Just a simple test\"}";

// subscribe to topic
ActiveMQTopic topic = new ActiveMQTopic("destinationTopic?consumer.retroactive=true");

// trigger the use case
jmsTemplate.convertAndSend("sourceQueue", message);

// get the message from the database and topic
jmsTemplate.setReceiveTimeout(5000);
String receivedJmsMessage = (String)jmsTemplate.receiveAndConvert(topic);
String storedDbEntry = jdbcTemplate.queryForObject("SELECT * FROM t_testcontainers", String.class);

//check it
assertEquals(message, receivedJmsMessage);
assertEquals(message, storedDbEntry);
```

It is even more important to test the bad case scenarios. I have added a processor on the route of the service to throw a RuntimeException on a special message. The test should then check that the database is empty. The complete test class (without comments) is now:

```java
package com.consol.testcontainers.transaction;

import org.apache.activemq.artemis.jms.client.ActiveMQTopic;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@ActiveProfiles("test")
@SpringBootTest
@Testcontainers
public class UC_Test {

    @Container
    static PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:alpine")
            .withInitScript("db_init.sql")
            .waitingFor(Wait.forLogMessage(".*database system is ready to accept connections.*\\s", 1));

    @Container
    static GenericContainer<?> activeMQContainer = new GenericContainer<>("vromero/activemq-artemis:latest-alpine")
            .withExposedPorts(61616)
            .withEnv("DISABLE_SECURITY", "true")
            .waitingFor(Wait.forLogMessage(".*AMQ221007: Server is now live.*\n", 1));;

    @Autowired
    JmsTemplate jmsTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @DynamicPropertySource
    static void registerDynamicProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgreSQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgreSQLContainer::getUsername);
        registry.add("spring.datasource.password", postgreSQLContainer::getPassword);

        registry.add("spring.artemis.port", activeMQContainer::getFirstMappedPort);
    }

    @Test
    void testOk() {
        jdbcTemplate.execute("TRUNCATE t_testcontainers");

        String message = "{\"id\": 42, \"name\": \"Just a simple test\"}";

        ActiveMQTopic topic = new ActiveMQTopic("destinationTopic?consumer.retroactive=true");

        jmsTemplate.convertAndSend("sourceQueue", message);

        jmsTemplate.setReceiveTimeout(5000);
        String receivedJmsMessage = (String)jmsTemplate.receiveAndConvert(topic);
        String storedDbEntry = jdbcTemplate.queryForObject("SELECT * FROM t_testcontainers", String.class);

        assertEquals(message, receivedJmsMessage);
        assertEquals(message, storedDbEntry);
    }

    @Test
    void testRollback() {
        jdbcTemplate.execute("TRUNCATE t_testcontainers");

        String message = "{\"id\": 42, \"name\": \"I will throw an Exception\"}";

        ActiveMQTopic topic = new ActiveMQTopic("destinationTopic?consumer.retroactive=true");

        jmsTemplate.convertAndSend("sourceQueue", message);

        jmsTemplate.setReceiveTimeout(5000);

        String receivedJmsMessage = (String)jmsTemplate.receiveAndConvert(topic);
        int storedDbEntries = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM t_testcontainers", Integer.class);

        assertNull(receivedJmsMessage);
        assertEquals(0, storedDbEntries);
    }
}
```

## Testing it with Citrus (just a summary)

The same tests implemented with Citrus could look like the following. It is split into a configuration and a test class:

```java
package com.consol.testcontainers.transaction.config;

import com.consol.citrus.container.SequenceBeforeTest;
import com.consol.citrus.dsl.endpoint.CitrusEndpoints;
import com.consol.citrus.dsl.runner.TestRunner;
import com.consol.citrus.dsl.runner.TestRunnerBeforeTestSupport;
import com.consol.citrus.jms.endpoint.JmsEndpoint;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.commons.dbcp.BasicDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.jms.ConnectionFactory;

@Configuration
public class CitrusConfiguration {

    @Value("${jms.broker.url}")
    private String jmsBrokerUrl;

    @Value("${jms.endpoint.out.uc}")
    private String jmsEndpointOutUc;

    @Value("${jms.endpoint.in}")
    private String jmsEndpointIn;

    @Value("${jms.receive.timeout}")
    private long jmsReceiveTimeout;

    @Value("${db.url}")
    private String dbUrl;

    @Value("${db.driver}")
    private String dbDriver;

    @Value("${db.user}")
    private String dbUser;

    @Value("${db.password}")
    private String dbPassword;

    @Bean
    public JmsEndpoint jmsEndpointOutUc() {
        return CitrusEndpoints.jms()
            .asynchronous()
            .connectionFactory(connectionFactory())
            .destination(jmsEndpointOutUc)
            .build();
    }

    @Bean
    public JmsEndpoint jmsEndpointIn() {
        return CitrusEndpoints.jms()
            .asynchronous()
            .connectionFactory(connectionFactory())
            .destination(jmsEndpointIn)
            .pubSubDomain(true)
            .autoStart(true)
            .timeout(jmsReceiveTimeout)
            .build();
    }

    @Bean
    public ConnectionFactory connectionFactory() {
        return new ActiveMQConnectionFactory(jmsBrokerUrl);
    }

    @Bean(destroyMethod = "close")
    public BasicDataSource datasource() {
        final BasicDataSource dataSource = new BasicDataSource();
        dataSource.setDriverClassName(dbDriver);
        dataSource.setUrl(dbUrl);
        dataSource.setUsername(dbUser);
        dataSource.setPassword(dbPassword);
        return dataSource;
    }

    @Bean
    public SequenceBeforeTest beforeTest() {
        return new TestRunnerBeforeTestSupport() {
            @Override
            public void beforeTest(TestRunner runner) {
                runner.purgeQueues(purgeJmsQueueBuilder -> purgeJmsQueueBuilder
                    .connectionFactory(connectionFactory())
                    .queueNames(jmsEndpointOutUc1));
                runner.purgeQueues(purgeJmsQueueBuilder -> purgeJmsQueueBuilder
                    .connectionFactory(connectionFactory())
                    .queue(jmsEndpointIn));
            }
        };
    }
}
```

```java
package com.consol.testcontainers.transaction.test;

import com.consol.citrus.annotations.CitrusTest;
import com.consol.citrus.dsl.testng.TestNGCitrusTestRunner;
import com.consol.citrus.jms.endpoint.JmsEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.testng.annotations.Test;

import javax.sql.DataSource;

@Test
public class UC_Test extends TestNGCitrusTestRunner {

    @Autowired
    JmsEndpoint jmsEndpointOutUc;

    @Autowired
    JmsEndpoint jmsEndpointIn;

    @Autowired
    DataSource dataSource;

    @Test
    @CitrusTest
    public void ok() {
        createVariable("message", "{\"id\": {citrus:randomNumber(10)}, \"name\": \"Just a simple test\"}");

        send(action -> action.endpoint(jmsEndpointOutUc).payload("${message}"));

        repeatOnError().until("i = 5").index("i").autoSleep(100).actions(
            echo("check database: ${i} from max 5 tries"),
            query(action -> action.dataSource(dataSource)
                .statement("select count(*) as entry_found from t_testcontainers where message='${message}';")
                .validate("entry_found", "1"))
        );

        receive(action -> action.endpoint(jmsEndpointIn).payload("${message}"));
    }

    @Test
    @CitrusTest
    public void rollback() {
        createVariable("message", "{\"id\": {citrus:randomNumber(10)}, \"name\": \"I will throw an Exception\"}");

        send(action -> action.endpoint(jmsEndpointOutUc).payload("${message}"));

        receiveTimeout(action -> action.endpoint(jmsEndpointIn));

        query(action -> action.dataSource(dataSource)
            .statement("select count(*) as entry_found from t_testcontainers where message='${message}';")
            .validate("entry_found", "0"));
    }
}
```

## Citrus and Testcontainers compared

As described in the beginning, we usually use the [Citrus framework](https://citrusframework.org) for integration testing. Therefore, I would now like to discuss the differences to Testcontainers I noticed.

First of all the concept of Citrus with the **test sources** as part of an independently project or module offers opportunities like a normal service deployment (on another machine). The service and the tests can therefore be individually delivered and started.

To **write tests** Citrus offers a huge support for different use cases (see [documentation](https://citrusframework.org/citrus/reference/html/index.html)) and Testcontainer allows to use nearly every docker image available. For some special images there are also own container classes to use like in our example the database.

A big advantage of Citrus is the **validation** (of every detail). In contrast to this has Testcontainers at the moment no special support for that and you have to write this parts for your own or even use other libraries for that.

The **delivery** can be done with Citrus separately which allows a **execution** ot the tests against a normal deployed application even on another machine. On the other side Testcontainers can run nearly everywhere (a docker installation is required) since the needed services are set up as part of the tests.

## Conclusion

Testcontainers is a good choice for a fast provisioning of the infrastructure. But it need support by other frameworks when it has to use the provided services. The advantages of Citrus are more likely the other wise with the validation and usage of third party systems.

A combination of Testcontainers with other testing tools (for example Citrus, Wiremock, Rest-Assured, ...) to control specific protocols or allowing a validation of data structures would be a technology stack which raises integration testing to the next level.