---
author: Roland Huß
date: '2010-03-29T06:50:54+00:00'
excerpt: This post demonstrates how to remove an attachment from an IMAP mail with
  JavaMail. The post concentrates on a general strategy but shows also the dragons
  waiting on the way. I.e. specially JavaMail's aggressive caching needs to be taken
  into account.
slug: removing-attachments-with-javamail
tags:
- J2EE
title: Removing attachments with JavaMail
---

If you have ever sent or received mail messages via Java, chances are high that you have used [JavaMail](http://java.sun.com/products/javamail/) for this task. Most of the time JavaMail does an excellent job and a lot of use cases are described in the [JavaMail FAQ](http://java.sun.com/products/javamail/FAQ.html). But there are still some additional quirks you should be aware of when doing advanced mail operations like adding or removing attachments (or "Parts") from existing mails retreived from some IMAP or POP3 store. This post gives a showcase for how to remove an attachment from a mail at an arbitrary level which has been obtained from an IMAP store. It points to the pitfalls which are waiting and shows some possible solutions. The principles laid out here are important for adding new attachments to a mail as well, but that's yet another story.

<!--more-->

## JavaMail objects

Before we start manipulating mail messages it is important to understand how these are represented in the JavaMail world.

The starting point is the `Message`. It has a *content* and a *content type*. The content can be any Java object representing the mail content, like a plain text (`String`) or raw image data. But it can also be a `Multipart` object: this is the case when a message's content consists of more than a single item. A `Multipart` object is a container which holds one ore more `BodyPart` objects. These `BodyPart`s, like a `Message`, have a content and a content type (in fact, both `Message` and `BodyPart` implement the same interface `Part` which carries these properties).

Beside plain content, A `BodyPart` can contain another `Multipart` or even another `Message`, a so called *nested message* (e.g. a message forwarded as attachment) with content type `message/rfc822`.

As you can see, the structure of a `Message` can be rather heterogenous, a tree with nodes of different types. The following picture illustrates the tree structure for a sample message.

<div style="margin: 0px 75px; float: none;">
<img src="/assets/2010-03-29-removing-attachments-with-javamail/javamail.png"/>
<p align="center">
<b>Object tree for a sample multipart mail</b>
</div>

This tree can be navigated in both directions:

- *getParent()* on `Multipart` or `BodyPart` returns the parent node, which is of type `BodyPart`. Note that there is no way to get from a nested `Message` to its parent `BodyPart`. If you need to traverse the tree upwards with nested messages on the way, you first have to extract the path to this node from the top down. E.g. while identifying the part to remove you could store the parent `BodyPart`s on a stack.

## First approach

Back to our use case of removing an attachment at an arbitrary level within a mail. First, a `Message` from the IMAP Store needs to be obtained, e.g. by looking it up in an `IMAPFolder` via its UID:

```java
Session session = Session.getDefaultInstance(new Properties());
 Store store = session.getStore("imap");
 store.connect("imap.example.com",-1,"user","password");
 IMAPFolder folder = (IMAPFolder) store.getFolder("INBOX");
 IMAPMessage originalMessage = (IMAPMessage) folder.getMessageByUID(42L);
```

Next, the fetched message is copied over to a fresh `MimeMessage` since the `IMAPMimeMessage` obtained from the store is marked as read-only and can't be modified:

```java
Message message = new MimeMessage(originalMessage);
 // Mark original message for a later expunge
 originalMessage.setFlag(Flags.Flag.DELETED, true);
```

Now the part to be removed needs to be identified. The detailed code is not shown here, but it is straight forward: You need to traverse the cloned `Message` top down to identify the `Part`, e.g. by its part number (a positional index) or by its content id. Be careful, though, not to call `getContent()` except for `BodyPart`s of type `multipart/*` or `message/rfc822`, since this would trigger a lazy fetch of the part's content into memory. Probably not something you want to do while looking up a part. I think, I already said this. ;-)

```java
MimePart partToRemove = partExtractor.getPartByPartNr(message,"2.1");
```

It's time to remove the body part from its parent in the hierarchy and store the changed message back into the store. You can mark the original message as `DELETED` and expunge it on the folder. If you have the *UIDEXTENSION* available on your IMAP store, you can selectively delete this single message, otherwise your only choice is to remove all messages marked as deleted at once ("Empty Trash").

```java
Multipart parent = partToRemove.getParent();
 parent.removeBodyPart(partToRemove);

 // Update headers and append new message to folder
 message.saveChanges();
 folder.appendMessages(new Message[] { message });

 // Mark as deleted and expunge
 originalMessage.setFlag(Flags.Flag.DELETED, true);
 folder.expunge(new Message[]{ originalMessage });
```

We are done now.

## But wait, that's not enough ...

If you try the code above, you will probably be a bit surprised. If you fetch back the newly saved message from the folder, you will find that the attachment has **not** been removed at all. Dragons are waiting here.

The problem is that a JavaMail Part does heavy internal caching: it keeps a so called *content stream* until a new *content* is set for it. So even if you modify the hierarchy of objects as described above, the original content is kept until you update the content of the parents yourself and the cache is thrown away. Our part has not been removed because the cached content stream has not yet been invalidated.

The solution is to get rid of the cached content stream (aka 'refresh the message'). You could set the content directly via `Part.setContent(oldPart.getContent(),oldPart.getContentType())`, but this is dangerous in so far as it will load the part content into memory. (Did I already mention this?) That's really not something you are keen on if you want to remove this Britney Spears Video to save some IMAP space.

The alternative is to work on the wrapped `DataHandler` only. A `DataHandler` (defined in [Java Activation][3]) is not much more than a *reference* to the content stream. Setting the `DataHandler` on a `Part` via `Part.setDataHandler()` also causes it to invalidate its cached content, so a later `Part.writeTo()` will stream out the new content. Unfortunately, this has to be done on every parent up to the root. A brute force solution is to start from the top and refresh every content with

```java
// Recursively go through and save all changes
 if (message.isMimeType("multipart/*")) {
    refreshRecursively((Multipart) message.getContent());
 }
 Multipart part = (Multipart) message.getContent();
 message.setContent(part);
 message.saveChanges();

 ...

 void refreshRecursively(Multipart pPart)
     throws MessagingException, IOException {

   for (int i=0;i<pPart.getCount();i++) {
     MimeBodyPart body = (MimeBodyPart) pPart.getBodyPart(i);
     if (body.isMimeType("message/rfc822")) {
       // Refresh a nested message
       Message nestedMsg = (Message) body.getContent();
       if (nestedMsg.isMimeType("multipart/*")) {
         Multipart mPart = (Multipart) body.getContent();
         refreshRecursively(mPart);
         nestedMsg.setContent(mPart);
       }
       nestedMsg.saveChanges();
     } else if (body.isMimeType("multipart/*")) {
       Multipart mPart = (Multipart) body.getContent();
       refreshRecursively(mPart);
     }
     body.setDataHandler(body.getDataHandler());
   }
 }
```

However, we can be smarter here: Since we already identified the part to remove, we can make our way upwards to the root message via the `getParent()` method on `Multipart` and `BodyPart` (which, by the way are not connected via any interface or inheritance relationship).

```java
BodyPart bodyParent = null;
 Multipart multipart = parent;
 do {
   if (multipart.getParent() instanceof BodyPart) {
     bodyParent = (BodyPart) multipart.getParent();
     bodyParent.setDataHandler(bodyParent.getDataHandler());
     multipart = bodyParent.getParent();
   } else {
     // It's a Message, probably the toplevel message
     // but could be a nested message, too (in which
     // case we have to stop here, too)
     bodyParent = null;
   }
 } while (bodyParent != null);
```

Finally you need to update the uppermost message headers, too with a

```java
MimeMessage.saveChanges()
```

As you might have noticed, this works as long as there is no nested message in the chain of `BodyPart`s up to the root. Since a `Message` doesn't have any parent, we need some other means to get the `BodyPart` which is the parent of an enclosed `Message`. One way is to keep track of the chain of parent `BodyPart`s when identifying the part to remove e.g. by extending the part extractor to support a stack of parent `BodyParts` which will be in:

```java
Stack<MimeBodyPart> parentBodys = new Stack<MimeBodyPart>();
 MimePart partToRemove = partExtractor.getPartByPartNr(message,"2.1",parentBodys);
 ....
```

This example could be extended to remove multipart containers on the fly, if only one part is left after removal and replace the multipart with its then last child or remove an empty multipart altogether when its last child has been removed.

## Summary

Hopefully, I could sketch out that there are several points to take care of when manipulating existing JavaMail `Messages` (it's not that difficult if you build up one from scratch). The code shown above is only a starting point, but it hopefully saves you some time when you start wondering why on earth your nicely trimmed message isn't stored correctly on the IMAP store.

<script type="text/javascript">var dzone_url = 'http://labs.consol.de/java mail/2010/03/29/removing-attachments-with-javamail.html';</script>
<script type="text/javascript">var dzone_style = '2';</script>
<script language="javascript" src="http://widgets.dzone.com/links/widgets/zoneit.js"></script>

 [1]: http://java.sun.com/products/javamail/
 [2]: http://java.sun.com/products/javamail/FAQ.html
 [3]: http://java.sun.com/javase/technologies/desktop/javabeans/glasgow/javadocs/javax/activation/package-summary.html