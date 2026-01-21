---
author: Gerhard Laußer
date: '2012-01-29T22:28:22+00:00'
slug: using-the-shinken-livestatus-module-with-mongodb
tags:
- livestatus
title: Using the Shinken livestatus module with MongoDB
---

In my last post i was explaining why it became necessary to have an alternative to the sqlite-based storing of log data. One of the many new features of the upcoming release 1.0 "Heroic Hedgehog" of the <a href="http://www.shinken-monitoring.org" title="Shinken monitoring" target="_blank">Shinken</a> monitoring software will be a <a href="http://www.mongodb.org" title="MongoDB" target="_blank">MongoDB</a> backend used by the livestatus module.<br/>
In this post i will show how to configure the livestatus module with a MongoDB cluster.

<!--more-->
First of all we setup a MongoDB cluster. When talking about a cluster, i mean a "replica set", which is a very cool concept. It is a master-slave-replication cluster (with as many slaves you want), which automatically promotes a slave if the master becomes unavailable. From a client's perspective, very few knowledge about the cluster's internals is required. Failover is handled nearly transparent.<br/>
As an example we have two database servers, mdb1 and mdb2, running with CentOS6.0. Their ip addresses are 10.2.12.50 and 10.2.12.51, we'll need them later.
First we have to edit the file <i>/etc/mongodb.conf</i>

```text
# Replication Options

# in replicated mongo databases, specify here whether this is a slave or master
#slave = true
#source = master.example.com
# Slave only: specify a single database to replicate
#only = master.example.com
# or
#master = true
#source = slave.example.com

replSet = livestatus
```

All we have to do here is to add the last line with the replSet statement.<br/>
Then, start the databases on both nodes:
<pre>[root@mdb1 ]&#35; service mongod start
Starting mongod: forked process: 4268
all output going to: /var/log/mongo/mongod.log
</pre>

In the logfiles you should now see something like
<pre>Sat Jan 28 22:03:00 [initandlisten] waiting for connections on port 27017
Sat Jan 28 22:03:00 [initandlisten] connection accepted from 127.0.0.1:36756 #1
Sat Jan 28 22:03:00 [rsStart] replSet can't get local.system.replset config from self or any seed (EMPTYCONFIG)
Sat Jan 28 22:03:00 [rsStart] replSet info you may need to run replSetInitiate -- rs.initiate() in the shell -- if that is not already done
...
</pre>

Now on one of the servers connect to the local mongodb and init the replica set
<pre>[root@localhost ~]&#35; mongo
MongoDB shell version: 2.0.2
connecting to: test
&gt; config = {_id: 'livestatus', members: [
      {_id: 0, host: '10.2.12.50:27017'},
      {_id: 1, host: '10.2.12.51:27017'}
]}
&gt; rs.initiate(config);
</pre>

If you are watching the logfiles, you will see output like:
<pre>Sat Jan 28 22:17:10 [rsSync] replSet initial sync pending
Sat Jan 28 22:17:10 [rsSync] replSet initial sync need a member to be primary or secondary to do our initial sync
Sat Jan 28 22:17:12 [rsHealthPoll] replSet member 10.2.12.51:27017 is up
Sat Jan 28 22:17:12 [rsHealthPoll] replSet member 10.2.12.51:27017 is now in state SECONDARY
Sat Jan 28 22:17:17 [conn3] replSet RECOVERING
Sat Jan 28 22:17:17 [conn3] replSet info voting yea for 10.2.12.51:27017 (1)
Sat Jan 28 22:17:18 [rsHealthPoll] replSet member 10.2.12.51:27017 is now in state PRIMARY
.....
Sat Jan 28 22:17:30 [rsSync] replSet initial sync done
Sat Jan 28 22:17:31 [rsSync] replSet syncing to: 10.2.12.51:27017
Sat Jan 28 22:17:31 [rsSync] replSet SECONDARY
Sat Jan 28 22:17:35 [conn3] end connection 10.2.12.51:59667
</pre>

One of the nodes is now PRIMARY, the other SECONDARY. <br/>
<b>In a production environment it is strongly recommended to add a third node.</b> Please refer to the <a href="http://www.mongodb.org/display/DOCS/Adding+an+Arbiter" title="mongodb arbiter" target="_blank">MongoDB documentation</a>.

As the database cluster is now up and running, the next step is to configure the livestatus section in <i>shinken-specific.cfg</i>.
<pre>define module{
    module_name      Livestatus
    module_type      livestatus
    host             *       ; * = listen on all configured ip addresses
    port             6557   ; port to listen
    socket           /usr/local/shinken/var/rw/live
    modules          logmongo
}
define module{
    module_name      logmongo
    module_type      logstore_mongodb
    mongodb_uri      mongodb://10.2.12.50:27017,10.2.12.51:27017
    replica_set      livestatus
}
</pre>

It is not necessary to specify both ip-addresses here. One of them would be sufficient. (The logstore_mongodb module gets the list of cluster partners during the connection phase). But with more than one ip address the client is able to connect to the cluster even if one of the nodes is not available.

If you are making your first steps with MongoDB on a single-node Shinken installation, do not edit the /etc/mongodb.conf file, simply start the local database and configure:
<pre>define module{
    module_name      logmongo
    module_type      logstore_mongodb
    mongodb_uri      mongodb://127.0.0.1:27017
}
</pre>
<br/>

<b>If you use the replica feature, you need pymongo > 2.1<br/>
I also recommend, you download mongodb (> 2.x) from http://www.mongodb.org/downloads. </b>