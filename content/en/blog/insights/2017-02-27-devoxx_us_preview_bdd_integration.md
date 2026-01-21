---
author: Christoph Deppisch
date: '2017-02-27'
tags:
- Citrus
title: Devoxx US - Behavior driven integration with Cucumber and Citrus
---

## DevoxxUS

In about three weeks [DevoxxUS] will take place in San Jose, California on March 21-23. After having visited Devoxx Belgium six 
consecutive times this will be my first Devoxx conference outside of Europe. Once again I am honored 
to be a speaker at that conference! After my Devoxx BE talk in 2015 ([Testing Microservices with a Citrus twist]) this is my second time speaking 
in front of Devoxxians from all around the world. Fantastic!

This time I am going to talk about [behavior driven integration](http://cfp.devoxx.us/2017/talk/XZI-2824/Behavior_driven_integration_with_Cucumber_and_Citrus) with [Cucumber] and [Citrus].
  
<!--more-->
  
## Behavior driven development
  
In general BDD is a great way to create a common understanding of how a software should behave in different
scenarios. The features as well as the acceptance criteria are described in [Gherkin] syntax which is easy to understand for both 
domain experts and technical development staff.

The BDD concept helps to prevent misunderstandings and unclear requirements from the very beginning. All participating parties in particular managers, domain experts, testers and developers communicate 
in a common tongue in order to describe and verify the application behavior. The Cucumber framework implements these concepts and gives outstanding integration for developing automated acceptance tests with BDD.

A typical feature scenario could look like this:

```bash
Feature: Voting App

  Background:
    Given user creates the voting "Do you like chocolate?"
    And voting options are "yes:no"

  Scenario: Get voting details
    When user gets the list of votings
    Then the list of votings should contain "Do you like chocolate?"
    And user should be able to get the voting details

  Scenario: Add votes
    When user votes for "yes"
    Then votes should be
      | yes | 1 |
      | no  | 0 |

  Scenario: Top vote
    When user votes for "yes"
    And user votes for "no" 3 times
    Then votes should be
      | yes | 1 |
      | no  | 3 |
    And top vote should be "no"
```

The feature describes several scenarios for creating a new voting in combination with adding votes for different options. The feature description uses Gherkin syntax with keywords like *Background*, *Given*, *When* and *Then*.
Cucumber reads these feature specifications as part of a normal JUnit test class and maps all steps to methods implemented in Java for instance.
  
```java
@Given("^user creates the voting \"([^\"]*)\"$")
public void createVoting(String title) {
    // TODO: create new voting with title
}
```  

The method is annotated with *@Given* and uses a regular expression that matches the feature step. We are able to use regexp capture groups for dynamic parameters such as the voting **title**. The
method is automatically loaded and called by Cucumber. The method should now create the new voting within the voting application. This way Cucumber translates BDD feature scenarios to executable unit testing methods.

The readable feature scenarios make sure that every team member understands how the application should behave. With integration in your favorite Java IDE the feature specification is directly executable as a unit test. During my talk
we will see more examples in detail in order to get used to working with Cucumber as a framework.
 
## Messaging integration testing
 
BDD has been around for a while and most of the time BDD is used to describe acceptance criteria for user interface testing. We can also adapt these concepts for testing the messaging interfaces
of our applications, can we? Nowadays almost every software provides service APIs for clients. Also our software consumes data from foreign services. The integration
of different services with data exchanged via REST or JMS is a common task in software development and needs to enjoy constant testing.

Lets use BDD concepts for calling the voting application via REST and JMS services. Lets write acceptance tests for integrating with these services as a client and server using BDD.

When dealing with messaging interfaces of different kind in one single test the Citrus test framework is very helpful as it provides
interface connectivity as client and server for REST, SOAP, JMS, Mail, RMI, File and many more. For instance Citrus is able to call the voting application via REST or JMS as client. In addition to that
Citrus is able to simulate a mail server for receiving automated reporting mails sent by the voting application when a voting is closed.

The framework provides ready-to-use components for exchanging messages via different message transports. With Citrus we are able to use the full messaging and data validation power with formats like Json or XML in a Cucumber test.

```bash
Feature: Voting Http REST API

  Scenario: Close voting
    Given New voting "Do you like chocolate?"
    And voting options are "yes:no"
    And reporting is enabled
    When client creates the voting
    And client votes for "yes" 3 times
    And client votes for "no" 1 times
    And client closes the voting
    Then votes should be
      | yes | 3 |
      | no  | 1 |
    And participants should receive reporting mail
"""
Dear participants,

the voting '${title}' came to an end.

The top answer is 'yes'!

Have a nice day!
Your Voting-App Team
"""
```

As usual we code the testing logic in Cucumber step methods using annotations. This time we also inject Citrus components and the Citrus Java DSL designer class
for exchanging messages as client and server.

```java
public class VotingIntegrationSteps {

    @Autowired
    private HttpClient votingClient;
    
    @Autowired
    private MailServer mailServer;

    @CitrusResource
    private TestDesigner designer;

    @Given("^New voting \"([^\"]*)\"$")
    public void newVoting(String title) {
        designer.variable("id", "citrus:randomUUID()");
        designer.variable("title", title);
    }

    @Given("^voting options are \"([^\"]*)\"$")
    public void votingOptions(String options) {
        designer.variable("options", buildOptionsAsJsonArray(options));
    }

    @Given("^reporting is enabled$")
    public void reportingIsEnabled() {
        designer.variable("report", true);
    }

    @When("^client creates the voting$")
    public void createVoting() {
        designer.http()
            .client(votingClient)
            .post("/voting")
            .contentType("application/json")
            .payload("{ \"id\": \"${id}\", \"title\": \"${title}\", \"options\": ${options}, \"report\": ${report} }");

        designer.http().client(votingClient)
            .response(HttpStatus.OK)
            .messageType(MessageType.JSON);
    }

    @When("^client votes for \"([^\"]*)\"$")
    public void voteFor(String option) {
        designer.http().client(votingClient)
                .send()
                .put("voting/${id}/" + option);

        designer.http().client(votingClient)
                .receive()
                .response(HttpStatus.OK);
    }
    
    @When("^client closes the voting$")
    public void closeVoting() {
        designer.http()
            .client(votingClient)
            .send()
            .put("/voting/${id}/close");

        designer.http()
            .client(votingClient)
            .receive()
            .response(HttpStatus.OK);
    }
    
    @Then("^participants should receive reporting mail$")
    public void shouldReceiveReportingMail(String text) {
        designer.createVariable("mailBody", text);

        designer.receive(mailServer)
                .payload(new ClassPathResource("templates/mail.xml"))
                .header(CitrusMailMessageHeaders.MAIL_SUBJECT, "Voting results")
                .header(CitrusMailMessageHeaders.MAIL_FROM, "voting@example.org")
                .header(CitrusMailMessageHeaders.MAIL_TO, "participants@example.org");
    }

    [...]
}
```

Citrus provides a Java  DSL for writing messaging actions like sending requests or receiving response messages. All messages exchanged via Citrus are validated on syntax and semantics with an expected
message content. Test variables help us to create a common test state for operating on a single voting instance. The **id** test variable is created at the very beginning of the test and identifies 
the voting throughout the steps using the **${id}** variable expression.

We have used Http client actions and Mail server simulation in our integration test in order to access the REST API and in order to verify the mail communication when a
voting is closed.

In case you want to see more of that in action please come to my talk [Behavior driven integration with Cucumber and Citrus](http://cfp.devoxx.us/2017/talk/XZI-2824/Behavior_driven_integration_with_Cucumber_and_Citrus) scheduled at Devoxx US in San Jose, California on March 22nd 5:30 PM til 6:00 PM.

I am looking forward to seeing you in California and maybe we can exchange thoughts on automated integration testing with Cucumber and Citrus.
  
[DevoxxUS]: https://devoxx.us
[Cucumber]: https://cucumber.io/
[Citrus]: http://citrusframework.org/
[Gherkin]: https://github.com/cucumber/cucumber/wiki/Gherkin
[Testing Microservices with a Citrus twist]: https://www.youtube.com/watch?v=FPgXJveaLTo