---
linkTitle: Examples
toc_hide: true
tags:
  - plugins
---

### Example 1: Error messages from FCAL-Devices
Usage as nagios-plugin to monitor FCAL-devices on a Solaris system. This is a basic example which scans for patterns in /var/adm/messages.
```text
@searches = (
  {
    tag => 'san',
    logfile => '/var/adm/messages',
    rotation => 'SOLARIS',
    criticalpatterns => [
        'Link Down Event received',
        'Loop OFFLINE',
        'fctl:.*disappeared from fabric',
        '.*Lun.*disappeared.*'
    ],
  });
```

### Example 2: Again, but this time as passive service using send_nsca
Using the following configfile you can run check_logfiles as standalone-script. If error messages are found in the messages file, a summary notification is sent to the NSCA server at the end of the check_logfile run.
```text
$scriptpath = '/usr/bin/nagios/libexec:/usr/local/nagios/contrib';
$MACROS = {
    NAGIOS_HOSTNAME => 'orschgeign.muc',
    CL_NSCA_HOST_ADDRESS => 'nagios1.muc',
    CL_NSCA_PORT => 5778
};
$postscript = 'send_nsca';
$postscriptparams = '-H $CL_NSCA_HOST_ADDRESS$ -p $CL_NSCA_PORT$
     -to $CL_NSCA_TO_SEC$ -c $CL_NSCA_CONFIG_FILE$';
$postscriptstdin = '$CL_HOSTNAME$\t$CL_SERVICEDESC$\t
    $CL_SERVICESTATEID$\t$CL_SERVICEOUTPUT$\n';
@searches = (
  {
    tag => 'san',
    logfile => '/var/adm/messages',
    criticalpatterns => [
        'Link Down Event received',
        'Loop OFFLINE',
        'fctl:.*disappeared from fabric',
        '.*Lun.*disappeared.*'
    ],
  },
);
```

### Example 3: Again, but this time with a notification for each single hit
If you want a notification every time a line matching one of your patterns is found, use the following modified configfile. Be careful: If you expect hundreds of these lines, your server will be flooded.
```text
$scriptpath = '/usr/bin/nagios/libexec:/usr/local/nagios/contrib';
$MACROS = {
    NAGIOS_HOSTNAME => 'orschgeign.muc',
    CL_NSCA_HOST_ADDRESS => 'nagios1.muc',
    CL_NSCA_PORT => 5778
};
@searches = (
  {
    tag => 'san',
    logfile => '/var/adm/messages',
    criticalpatterns => [
        'Link Down Event received',
        'Loop OFFLINE',
        'fctl:.*disappeared from fabric',
        '.*Lun.*disappeared.*'
    ],
    options => 'script',
    script => 'send_nsca',
    scriptparams => '-H $CL_NSCA_HOST_ADDRESS$ -p $CL_NSCA_PORT$
     -to $CL_NSCA_TO_SEC$ -c $CL_NSCA_CONFIG_FILE$',
    scriptstdin => '$CL_HOSTNAME$\t$CL_SERVICEDESC$\t
    $CL_SERVICESTATEID$\t$CL_SERVICEOUTPUT$\n',
  },
);
```

### Example 4: Check the correct function of the syslog service
In the following example a message will be sent to the syslog service imediately after check_logfiles starts up. After a delay of 5 seconds (which should be enough for the message to make it into the logfile) the logfile will be scanned for this message. If it cannot be found, this is counted as a critical error.
```text
$scriptpath = '/usr/bin';
$prescript = 'logger';
$prescriptparams = '-t nagios';
$prescriptstdin = 'braver syslog ($CL_DATE_YYYY$-$CL_DATE_MM$
    -$CL_DATE_DD$ $CL_
DATE_HH$:$CL_DATE_MI$:$CL_DATE_SS$)';
$prescriptsleep = 5;
@searches = (
  {
    tag => 'syslogworks',
    logfile => '/var/adm/syslog/syslog.log',
    rotation => 'bmwhpux',
    criticalpatterns => ['!nagios:\s+braver\s+syslog'],
    options => 'count',
  },
);
```

### Example 5: Monitoring HP Service Guard
Here we look for typical error messages of the cluster software. The value HPUX of the rotation-parameter means, that both syslog.log and maybe OLDsyslog.log are scanned.
```text
$seekfilesdir = '/lfs/opt/nagios/var/tmp';
$protocolsdir = '/lfs/opt/nagios/var/tmp';
$scriptpath = '/lfs/opt/nagios/nrpe/locallibexec';
@searches = (
  {
    tag => 'mcsg',
    logfile => '/var/adm/syslog/syslog.log',
    rotation => 'HPUX',
    criticalpatterns => [
        '.*cmcld: Inbound connection from unconfigured address.*',
        '.*cmclconfd.*Unable to activate keep alive option on
     incomming connection.*',
        '.*inetd.*hacl-cfg/udp: Server failing (looping),
     service terminated.*',
        '.*inetd.*hacl-probe/tcp: accept: Bad file number.*',
        '.*cmcld: Inbound.*message from unconfigured address.*',
        '.*cmcld: Unable to connect to quorum server .*
     It may be down.*',
        '.*cmcld: Failed to receive from quorum server.*',
        '.*cmcld: Connection failure to quorum server.*'
    ],
    warningpatterns => [
        'Cluster Files not in Sync',
    ],
    options => 'protocol,count'
  },
);
```

### Example 6: Monitoring the LVM under HP-UX
In this example we look for typical logical volume manager error messages.
```text
@searches = (
 {
  tag => 'lvm',
  logfile => '/var/adm/syslog/syslog.log',
  rotation => 'HPUX',
  criticalpatterns => [
   '.*vmunix: LVM: vg\[[0-9]*\]: pvnum=.*is POWERFAILED',
   '.*vmunix: SCSI: Read error.*dev:.*errno:.*resid:.*',
   '.*vmunix: LVM:.*PVLink.* Failed! The PV is still accessible.*',
   '.*vmunix: LVM: Restored PV.*',
   '.*vmunix: LVM: Performed a switch for Lun ID.*',
   '.*vmunix: LVM:.*PVLink.*Recovered.*',
   '.*vmunix:.*vxfs:.*vx_metaioerr.*file system meta data read error',
  ],
 },
);
```

### Example 7: Simple monitor for a SUN server's hardware health
If failures or errors exist in the system, prtdiag -l outputs this information to syslogd. If a corresponding error message is found in the messages file, a defect was detected.
```text
#
#  This config file implements a simple method to monitor the
#  hardware health of a solaris machine.
#  From the prtdiag(1M) manpage:
#  -l    Log output. If failures or errors exist in the system,
#        output this information to syslogd(1M) only.
#  This means, if you run prtdiag and you find something
#  prtdiag-related in the messages file, then there must be
#  an error somewhere in the system.
#
$scriptpath = '/usr/platform/sun4u/sbin';
$prescript = 'prtdiag';
$prescriptparams = '-l';
@searches = (
  {
    tag => 'prtdiag',
    logfile => '/var/adm/messages',
    rotation => 'SOLARIS',
    criticalpatterns => 'prtdiag:',
  },
);
```

### Example 8: Monitoring of SUN hardware by sending SNMP-traps
In this example we scan /var/adm/messages for patterns indicating upcoming hardware trouble. In this scenario check_logfiles runs not as a nagios-plugin but as a standalone script, which sends a snmp-trap if matching lines were found. Sending the trap is done by an external script which gets the needed information via environment variables.

Here just one single trap is sent at the end of check_logfile's runtime. If you want a trap for each single matching line, move the $postscript definition as script definition inside the search.
```text
$MACROS = {
  SNMP_TRAP_SINK_HOST => 'nagios.dierichs.de',
  SNMP_TRAP_SINK_VERSION => 'snmpv1',
  SNMP_TRAP_SINK_COMMUNITY => 'public',
  SNMP_TRAP_SINK_PORT => 162,
  SNMP_TRAP_ENTERPRISE_OID => '1.3.6.1.4.1.20006.1.5.1',
};
$seekfilesdir = '/lfs/opt/nagios/var/tmp';
$protocolsdir = '/lfs/opt/nagios/var/tmp';
$scriptpath = '/lfs/opt/nagios/nrpe/locallibexec';
@searches = (
 {
  tag => 'hwmsgs',
  logfile => '/var/adm/kern.log',
  rotation => 'kern\d{4}-\d{2}-\d{2}',
  criticalpatterns => [
  # bit error cannot be repaired by the scrubber.
  # take cover.
  '.*Sticky Softerror encountered.*',
  ],
  warningpatterns => [
   # memory crumbling
   'NOTICE: Previously reported error on page \w+\.\w+ cleared',
   # lan calble was pulled
   'WARNING: \w+: fault detected external to device; service degraded',
  ],
  options => 'noprotocol',
 },
);
$postscript => 'send_snmptrap.pl';
```

Jörg Linge was so kind to contribute the following script:
```text
#! /usr/bin/perl
#
#  send_snmptrap.pl
#
use strict;
use Net::SNMP;
my $hostname = $ENV{CHECK_LOGFILES_SNMP_TRAP_SINK_HOST}
    || 'nagios.dierichs.de';
my $version = $ENV{CHECK_LOGFILES_SNMP_TRAP_SINK_VERSION}
    || 'snmpv1';
my $community = $ENV{CHECK_LOGFILES_SNMP_TRAP_SINK_COMMUNITY}
    || 'public';
my $port = $ENV{CHECK_LOGFILES_SNMP_TRAP_SINK_PORT}
    || 162;
my $oid = $ENV{CHECK_LOGFILES_SNMP_TRAP_ENTERPRISE_OID}
    || '1.3.6.1.4.1.20006.1.5.1';

my ($session, $error) = Net::SNMP->session(
    -hostname     => $hostname,
    -version      => $version,
    -community    => $community,
    -port         => $port      # Need to use port 162
);
if (!defined($session)) {
   printf('ERROR: %s.\n', $error);
   exit 1;
}
my @varbind = ($oid, OCTET_STRING, $ENV{CHECK_LOGFILES_SERVICEOUTPUT});
my $result = $session->trap(
    -enterprise   => $oid,
    -specifictrap => $ENV{CHECK_LOGFILES_SERVICESTATEID},
    -varbindlist  => \@varbind);
$session->close;
exit 0;
```

### Example 9: Monitoring SUN hardware using NSCA
Instead of SNMP-traps one could also report the errors to a nagios server using send_nsca. Here also check_logfiles runs as standalone script.
```text
$scriptpath = '/usr/local/nagios/bin';
$MACROS = {
    NAGIOS_HOSTNAME => 'orschgeign.muc',
    CL_NSCA_HOST_ADDRESS => 'nagios1.muc',
    CL_NSCA_PORT => 5778,
    CL_NSCA_CONFIG_FILE => '/usr/local/etc/send_nsca.cfg',
};
@searches = (
 {
  tag => 'hwmsgs',
  logfile => '/var/adm/kern.log',
  rotation => 'kern\d{4}-\d{2}-\d{2}',
  criticalpatterns => [
  # bit error cannot be repaired by the scrubber.
  # take cover.
  '.*Sticky Softerror encountered.*',
  ],
  warningpatterns => [
   # memory degrading
   'NOTICE: Previously reported error on page \w+\.\w+ cleared',
   # lan cable was pulled
   'WARNING: \w+: fault detected external to device; service degraded',
  ],
  options => 'noprotocol',
 },
);
$postscript = 'send_nsca';
$postscriptparams = '-H $CL_NSCA_HOST_ADDRESS$ -p $CL_NSCA_PORT$
     -to $CL_NSCA_TO_SEC$ -c $CL_NSCA_CONFIG_FILE$';
$postscriptstdin = '$CL_HOSTNAME$\t$CL_SERVICEDESC$\t
    $CL_SERVICESTATEID$\t$CL_SERVICEOUTPUT$\n';
```

### Example 10: Scan Linux logfiles as an unprivileged user
At the startup of check_logfiles the file attributes of the logfile are modified such that the nagios user can read them.

For this you need an entry in /etc/sudoers:
```text
qqnagio ALL = (root) NOPASSWD: /usr/bin/setfacl
```
Should the sudo-command fail, then its exitcode of 1 together with the supersmartprescript-option forces check_logfiles to abort with a warning.

If you find the following line in /etc/sudoers
```text
Defaults requiretty
```
it must be commented out.

```text
$scriptpath = '/usr/bin';
$prescript = 'sudo';
$prescriptparams = 'setfacl -m u:$CL_USERNAME$:r-- /var/log/messages*';
$options = 'supersmartprescript';
@searches = ({
  tag => 'reiserfs',
  logfile => '/var/log/messages',
  rotation => 'SUSE',
  criticalpatterns => [
      'vs-5150: search_by_key:',
      'is_tree_node: node level \d+ does not match to the expected one',
      'vs-500: unknown uniqueness -1',
      'vs-5657: reiserfs_do_truncate: i/o failure',
      'green-16006: Invalid item type observed, run fsck ASAP'],
  ...
});
....
```

### Example 11: Monitoring Apache under Windows for intrusion attempts
Because of the '\' Windows path names have to be set in single quotes.
```text
$MACROS = {
  APACHEDIR => 'C:\Programme\Apache Software Foundation\Apache2.2'
};
@searches = ({
  tag => 'apachebreakin',
  logfile => '$APACHEDIR$\logs\access.log',
  criticalpatterns => [
      'GET.*cmd\.exe.*',
      'SEARCH /\\x90\\x02\\xb1\\x02\\xb1' ]
});
```

### Example 12: Revoke hits with the help of a script
Scripts of type supersmart can help you to take a more accurate look at matching lines and, if necessary, modify them.
```text
@searches =(
  {
    tag => 'heiss',
    logfile => '/var/log/messages',
    criticalpatterns => '.*Thermometer: \d+ Degrees.*',
    options => 'supersmartscript',
    script => sub {
      my $degrees = 0;
      $ENV{CHECK_LOGFILES_SERVICEOUTPUT} =~ /: (\d+) Degrees/;
      $degrees = $1;
      if ($degrees > 86) {
        if (($ENV{CHECK_LOGFILES_DATE_MM} >= 6) &amp;&amp;
            ($ENV{CHECK_LOGFILES_DATE_MM} &lt;= 8)) {
          printf 'OK - after all, it\'s summer\n'; # dummy msg
          return 0; # this match never happened.
        } elsif (($ENV{CHECK_LOGFILES_DATE_MM} >= 11) &amp;&amp;
            ($ENV{CHECK_LOGFILES_DATE_MM} &lt;= 2)) {
          printf 'CRITICAL - fire!\n';
          return 2;
        } else {
          printf 'WARNING - a bit warm in here\n';
          return 1;
        }
      } else {
        printf 'OK - below 86 degrees\n';
        return 0;
      }
    }
  }
);
```

### Example 13: Monitoring of Fibre Channel Links
Using the type "virtual" one can monitor files in the /proc or /sys directory. In the following example the cable is pulled from an Emulex LPe1150 adapter.
```text
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host0/model
ServeRAID 8i
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host1/modeldesc
Emulex LPe1150-F4 4Gb 1port FC: PCIe SFF HBA
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host2/modeldesc
Emulex LPe1150-F4 4Gb 1port FC: PCIe SFF HBA
.
.
.
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host0/state
running
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host1/state
Link Up - Ready:
   Fabric
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host2/state
Link Up - Ready:
   Fabric
.
.
.
@searches = (
  {
    tag => 'host0',
    logfile => '/sys/class/scsi_host/host0/state',
    type => 'virtual',
    criticalpatterns => [
      '^[^running]+'
    ],
    options => 'nologfilenocry,noprotocol',
  },
  {
    tag => 'host1',
    logfile => '/sys/class/scsi_host/host1/state',
    type => 'virtual',
    criticalpatterns => [
      'Link [^Up]+'
    ],
    options => 'nologfilenocry,noprotocol',
  },
  {
    tag => 'host2',
    logfile => '/sys/class/scsi_host/host2/state',
    type => 'virtual',
    criticalpatterns => [
      'Link [^Up]+'
    ],
    options => 'nologfilenocry,noprotocol',
  },
);
.
.
.
nagios@ibmsrv05:/> check_logfiles -f linux_fs_check_fcal.cfg
OK - no errors or warnings |host0=1;0;0;0 host1=2;0;0;0 host2=2;0;0;0
.
.
.
nagios@ibmsrv05:/> cat /sys/class/scsi_host/host2/state
Link Down
.
.
.
nagios@ibmsrv05:/> check_logfiles -f linux_fs_check_fcal.cfg
CRITICAL - (1 errors) - Link Down  |host0_lines=1
     host0_warnings=0 host0_criticals=0
     host0_unknowns=0 host1_lines=2 host1_warnings=0
     host1_criticals=0 host1_unknowns=0 host2_lines=1
     host2_warnings=0 host2_criticals=1 host2_unknowns=0
```

### Example 14: Forwarding of the Windows Eventlogs to a Unix-Syslogserver
If a messages file is composed of multiple servers' events, because you forward the Windows eventlog to a Unix system, using the syslogclient option allows a directed search for messages coming from a specific Windows system.
```text
@searches = ({
  tag => 'exchange1.dom',
  logfile => '/var/log/messages',
  rotation => 'SUSE',
  criticalpatterns => [
     'An MTA database server error was encountered',
  ],
  options => 'syslogclient=exchange1.dom'
},
{
  tag => 'exchange2.dom',
  logfile => '/var/log/messages',
  rotation => 'SUSE',
  criticalpatterns => [
     'An MTA database server error was encountered',
  ],
  options => 'syslogclient=$CL_TAG$'
  });
....
```

### Example 15: Searching the AIX errpt
AIX writes many messages in the so called Error Report which can be readout with the errpt command. With type=errpt you can instruct check_logfiles to scan errpt's output instead of a real logfile.
```text
@searches = (
 {
   tag => 'minor_errors',
   type => 'errpt',
   criticalpatterns => ['ADAPTER ERROR',
       'The largest dump device is too small.',
       'The copy directory is too small.',
       'Kernel heap use exceeds allocation count',
       'Kernel heap use exceeds percentage thres',
       'LINK ERROR',
       'Permanent fatal error',
       'SCSI BUS OR DEVICE ERROR',
       'SCSI DEVICE OR MEDIA ERROR',
       'Possible malfunction on local adapter',
       'ETHERNET DOWN',
       'UNABLE TO ALLOCATE SPACE IN KERNEL HEAP'
    ],
 }
);
```

### Example 16: Windows EventLog forwarding with templates
If there are messages originating from different syslog clients in a logfile, they can be prefiltered with the name of such a client. To avoid definitions for each single client, you can use templates.
```text
define command {
  command_name  check_client_logs
  command_line     $USER2$/check_logfiles --tag=$HOSTNAME$ \
      --logfile='/var/log/messages' \
      --criticalpattern='$ARG1$' --syslogclient='$CL_TAG$'
}
define service {
  service_description dr_watson
  host_name  pc0815.muc
  check_command check_client_logs!4097.*generated an application error
}
```

With templates you can formulate multiple searches in one configfile and pick only specific ones according to the type of the host. Without templates you would have to write a definition for each host.
```text
@searches = (
{
  template => 'drwatson',
  logfile => '/var/log/messages',
  criticalpattern => '4097.*generated an application error',
  options => 'syslogclient=$CL_TAG$'
},
{
  template => 'virus',
  logfile => '/var/log/messages',
  criticalpattern => 'a virus was found',
  options => 'syslogclient=$CL_TAG$'
},
{
  template => 'cluster',
  logfile => '/var/log/messages',
  criticalpatterns => ['5029.*The cluster  log is corrupt',
      '5038.*A cluster resource failed', ],
  options => 'syslogclient=$CL_TAG$'
});
```

For "normal" Windows-Clients you would run:
```text
check_logfiles --config <configdatei> --tag='pc0815' \
    --selectedsearches='drwatson,virus' \
```

And for cluster servers:
```text
check_logfiles --config <configdatei> --tag='clustsrv1.muc'
```

### Example 17: Oracle Alertlog
Oracle databases write their error messages into an alert log. Paying attention to these messages helps you detect potential problems before they cause a production outage. (please also refer to type => "oraclealertlog")
```text
@searches = ({
  tag => 'oraalerts',
  logfile => '......../alert.log',
  criticalpatterns => [
      'ORA\-0*204[^\d]',        # error in reading control file
      'ORA\-0*206[^\d]',        # error in writing control file
      'ORA\-0*210[^\d]',        # cannot open control file
      'ORA\-0*257[^\d]',        # archiver is stuck
      'ORA\-0*333[^\d]',        # redo log read error
      'ORA\-0*345[^\d]',        # redo log write error
      'ORA\-0*4[4-7][0-9][^\d]',# ORA-0440 - ORA-0485 background process failure
      'ORA\-0*48[0-5][^\d]',
      'ORA\-0*6[0-3][0-9][^\d]',# ORA-6000 - ORA-0639 internal errors
      'ORA\-0*1114[^\d]',        # datafile I/O write error
      'ORA\-0*1115[^\d]',        # datafile I/O read error
      'ORA\-0*1116[^\d]',        # cannot open datafile
      'ORA\-0*1118[^\d]',        # cannot add a data file
      'ORA\-0*1122[^\d]',       # database file 16 failed verification check
      'ORA\-0*1171[^\d]',       # datafile 16 going offline due to error advancing checkpoint
      'ORA\-0*1201[^\d]',       # file 16 header failed to write correctly
      'ORA\-0*1208[^\d]',       # data file is an old version - not accessing current version
      'ORA\-0*1578[^\d]',        # data block corruption
      'ORA\-0*1135[^\d]',        # file accessed for query is offline
      'ORA\-0*1547[^\d]',        # tablespace is full
      'ORA\-0*1555[^\d]',        # snapshot too old
      'ORA\-0*1562[^\d]',        # failed to extend rollback segment
      'ORA\-0*162[89][^\d]',     # ORA-1628 - ORA-1632 maximum extents exceeded
      'ORA\-0*163[0-2][^\d]',
      'ORA\-0*165[0-6][^\d]',    # ORA-1650 - ORA-1656 tablespace is full
      'ORA\-16014[^\d]',      # log cannot be archived, no available destinations
      'ORA\-16038[^\d]',      # log cannot be archived
      'ORA\-19502[^\d]',      # write error on datafile
      'ORA\-27063[^\d]',         # number of bytes read/written is incorrect
      'ORA\-0*4031[^\d]',        # out of shared memory.
      'No space left on device',
      'Archival Error',
  ],
  warningpatterns => [
      'ORA\-0*3113[^\d]',        # end of file on communication channel
      'ORA\-0*6501[^\d]',         # PL/SQL internal error
      'ORA\-0*1140[^\d]',         # follows WARNING: datafile #20 was not in online backup mode
      'Archival stopped, error occurred. Will continue retrying',
  ]
});
```

### Example 17a: Oracle RAC Clusterware Alertlog
Daniel Graef sent in this example for the monitoring of an Oracle Clusterware Alertlog. Thanks a lot!
```text
@searches = (
{
  tag => 'racnode01-clusterware',
  logfile => '/oracle/app/crs/product/111_1/log/racnode01/alertracnode01.log',
  criticalpatterns => [
      'CRS\-1006[^\d]', # The OCR location %s is inaccessible. Details in %s.
      'CRS\-1008[^\d]', #  Node %s is not responding to OCR requests. Details in %s.
      'CRS\-1009[^\d]', #  The OCR configuration is invalid. Details in %s.
      'CRS\-1011[^\d]', #  OCR cannot determine that the OCR content contains the latest updates. Details in %s.
      'CRS\-1202[^\d]', #  CRSD aborted on node %s. Error [%s]. Details in %s.
      'CRS\-1203[^\d]', #  Failover failed for the CRS resource %s. Details in %s.
      'CRS\-1205[^\d]', #  Auto-start failed for the CRS resource %s. Details in %s.
      'CRS\-1206[^\d]', #  Resource %s went into an UNKNOWN state. Force stop the resource using the crs_stop -f command and restart %s.
      'CRS\-1207[^\d]', #  There are no more restart attempts left for resource %s. Restart the resource manually using the crs_start command.
      'CRS\-1402[^\d]', #  EVMD aborted on node %s. Error [%s]. Details in %s.
      'CRS\-1602[^\d]', #  CSSD aborted on node %s. Error [%s]. Details in %s.
      'CRS\-1606[^\d]', #  CSSD Insufficient voting files available [%s of %s]. Details in %s.
      'CRS\-1608[^\d]', #  CSSD Evicted by node %s. Details in %s.  [local node eviced, critical for node himself]
      'CRS\-1609[^\d]', #  CSSD detected a network split. Details in %s.
  ],
  warningpatterns => [
      'CRS\-1010[^\d]', #  The OCR mirror location %s was removed.
      'CRS\-1604[^\d]', #  CSSD voting file is offline: %s. Details in %s.
      'CRS\-1607[^\d]', #  CSSD evicting node %s. Details in %s. [local evicted other node, warning for clsuter state]
      'CRS\-2001[^\d]', #  memory allocation error when initiating the connection failed to allocate memory for the connection with the target process
      'CRS\-2003[^\d]', #  error %d encountered when connecting to %s
      'CRS\-2004 [^\d]', # error %d encountered when sending messages to %s
      'CRS\-2005[^\d]', #  timed out when waiting for response from %d
      'CRS\-2006[^\d]', #  failed to get response from %d
  ],
  options => 'sticky=86400'
});
```

### Example 18: IPMI System Event Log
This example shows how to look for power supply problems by reading the IPMI System Event Log with the <strong>ipmitool sel list</strong> command.
```text
@searches = (
  {
    tag => 'powercable',
    type => 'ipmitool',
    ipmitool => { # you don't need this if you are root
      path => 'sudo /usr/bin/ipmitool',
    },
    criticalpatterns => [
        'Power Supply.*Failure detected',
        'Power Supply AC lost',
     ],
  });
nagios@ibmsrv05:/> check_logfiles -f ibm_power.cfg
CRITICAL - (6 errors in test.protocol-2008-02-12-14-19-36) -
      190 ; 02/07/2008 ; 14:28:13 ; Power Supply #0x39 ;
     Failure detected ...|
     powercable_lines=17 powercable_warnings=0
     powercable_criticals=6 powercable_unknowns=0
```

### Example 19: Passive Checkresults which cannot be assigned
Passive Checkresults, which cannot be assigned a host or a service (e.g. because of a typo) are silently dropped (Apart from a notice in nagios.log). With this method, Nagios is able to send out a notification if this occurs. This was Augustinus' idea.
```text
$MACROS = {
  NAGIOS_LOGFILES => '/var/nagios'
};
@searches = {
  tag => 'nagios_unmatched_passive_check_results',
  logfile => '$NAGIOS_LOGFILES$/nagios.log',
  archivedir => '$NAGIOS_LOGFILES$/archives',
  rotation => 'nagios-\d{2}-\d{2}-\d{2}-\d{2}.log',
  criticalpatterns => [
      '^\[\d+\] Warning:  Passive check result was received for service .* on host .* but the service could not be found',
      '^\[\d+\] Warning:  Passive check result was received for service .* on host .* but the host could not be found',
  ],
};
```
### Example 20: Windows Eventlog
The Perl module on which check_logfiles relies on under Windows unfortunately can only be used to read the System, Application, and Security event logs. However, there are countless other event logs; potentially, each application can open its own branch here. To monitor these events, you need the command-line tool **wevtutil**. check_logfiles can then build upon this by specifying *type => 'wevtutil'* in the search. Heiko Wenzig, a long-time user of check_logfiles, has kindly provided his configuration. However, it should be noted that criticalpatterns is just a placeholder and everyone needs to know for themselves what is important to them.

```text
@searches = ({
  tag => 'ms_kernel-evt-tracing',
  type => 'wevtutil',
  eventlog => {
    eventlog => '"Microsoft-Windows-Kernel-EventTracing/Admin"',
    include => {
      eventtype => 'error,warning',
    },
  },
  options => 'winwarncrit,noperfdata,noprotocol,preferredlevel=critical,eventlogformat="%w id:%i so:%s ca:%c msg:%m"',
  # Hier stehen die Events (die im Eventlog vom Typ Warning oder Error sein können) bei deren Auftauchen sofort gehandelt werden muss,
  # die also Nagios-seitig als CRITICAL eingestuft werden sollen.
  criticalpatterns => [
    'id:tbd so:tbd ca:tbd msg:tbd',
  ],
  # Hier kann man ein durch winwarncrit kritisches Event wieder auf Warning zurueckstufen
  criticalexceptions => [
    'id:0003 so:Microsoft-Windows-Kernel-EventTracing.* ca:Microsoft-Windows-Kernel-EventTracing/Admin msg:Die Sitzung "ReadyBoot" .*',
    'id:0002 so:Microsoft-Windows-Kernel-EventTracing\'_Guid=\'{B675EC37-BDB6-4648-BC92-F3FDC74D3CA2} ca:Microsoft-Windows-Kernel-EventTracing/Admin msg:Beim Starten der Sitzung "Circular Kernel Context Logger" .*',
  ],
  # die hier aufgefuehrten Events, sollen nicht weiter beachtet werden.
  warningexceptions => [
    'id:0004 so:Microsoft-Windows-Kernel-EventTracing.* ca:Microsoft-Windows-Kernel-EventTracing/Admin msg:.*',
  ],
  # sämtliche anderen Events (auch solche, die noch niemals vorgekommen sind erscheinen in Nagios als WARNING.
    warningpatterns => [
      '.*'
  ],
}); 

$options = 'report=long';

__END__

Eventlognamen ermitteln
eventlog = In der Computerverwaltung auf das Eventlog gehen und unter Eigenschaften den "Vollstaendigen Namen" ermitteln
    
Beispiele fuer die Filterung/Herabstufung von Events:
id:0003 so:Microsoft-Windows-Kernel-EventTracing.* ca:Microsoft-Windows-Kernel-EventTracing/Admin msg:Die Sitzung "ReadyBoot" .*
id:0002 so:Microsoft-Windows-Kernel-EventTracing'_Guid='{B675EC37....   # Hier beachten \ vor ' sonst gibt es einen Syntax Fehler
    
```

