---
author: Gerhard Laußer
date: '2012-06-12T12:22:18+00:00'
slug: arbitrary-ssh-command-for-check_by_ssh
tags:
- check_by_ssh
title: Arbitrary ssh-command for check_by_ssh
---

The well-known plugin check_by_ssh is a wrapper around the ssh client program. Unfortunately the path to ssh is defined at compile-time and remains hard-coded in the check_by_ssh binary. Usually this is /usr/bin/ssh. If you want to use features which are not implemented in your distribution's ssh, but in an alternative ssh binary, you have to recompile check_by_ssh. Here is a patch which makes it easy to switch between multiple ssh binaries using a command line parameter.

<!--more-->
```text
--- nagios-plugins-1.4.15.orig/plugins/check_by_ssh.c   2010-07-27 22:47:16.000000000 +0200
+++ nagios-plugins-1.4.15/plugins/check_by_ssh.c        2012-06-12 14:02:07.000000000 +0200
@@ -177,6 +177,7 @@
                {"identity", required_argument, 0, 'i'},
                {"user", required_argument, 0, 'u'},
                {"logname", required_argument, 0, 'l'},
+               {"ssh-command", required_argument, 0, 'c'},
                {"command", required_argument, 0, 'C'},
                {"skip", optional_argument, 0, 'S'}, /* backwards compatibility */
                {"skip-stdout", optional_argument, 0, 'S'},
@@ -277,6 +278,9 @@
                case 'f':                                                                       /* fork to background */
                        comm_append("-f");
                        break;
+               case 'c':
+                       commargv[0] = strdup(optarg);
+                       break;
                case 'C':                                                                       /* Command for remote machine */
                        commands++;
                        if (commands > 1)
@@ -404,6 +408,8 @@
   printf ("    %s\n", _("Ignore all or (if specified) first n lines on STDERR [optional]"));
   printf (" %s\n", "-f");
   printf ("    %s\n", _("tells ssh to fork rather than create a tty [optional]. This will always return OK if ssh is executed"));
+  printf (" %s\n","-c, --ssh-command=COMMAND");
+  printf ("    %s\n", _("execute an alternative ssh binary"));
   printf (" %s\n","-C, --command='COMMAND STRING'");
   printf ("    %s\n", _("command to execute on the remote machine"));
   printf (" %s\n","-l, --logname=USERNAME");
```

Now you tell check_by_ssh to use a specific ssh client by setting the --ssh-command parameter.
```text
/omd/sites/nagios_selftest/local/lib/nagios/plugins/check_by_ssh \
    --host 10.178.26.19 --port 22 --logname nagios --timeout 60 \
    --ssh-command /omd/sites/nagios_selftest/ssh/local/bin/ssh \
    --ssh-option "ControlPath=/omd/sites/nagios_selftest/tmp/ssh/controlpath/ssh-%r@%h"
    ....
```

(As far as i remember my distribution's ssh did not handle the ControlMaster mechanism correctly, so i compiled my own openssh environment. That's how this patch came into being)