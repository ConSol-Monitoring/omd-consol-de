---
title: check_sap_health
tags:
  - plugins
  - sap
  - ccms
  - rfc
  - bapi
  - check_sap_health
---

## Description
check_sap_health was developed with the goal of having an easily extensible tool that can monitor both technical parameters from CCMS and business facts via RFC/BAPI.

## Motivation
Previously available plugins are written in C, which makes it difficult to quickly implement and test new features. Furthermore, the possibilities of these plugins are limited to querying CCMS metrics. When the previously used check_sap started causing core dumps in mid-2013 (irreparable, occurring after the exit() call) and compatibility with newer Netweaver versions was apparently no longer guaranteed, I looked for alternatives.

At the same time, there was a requirement to include RFC and BAPI calls in monitoring. These calls mainly related to company-specific extensions and were intended to ultimately cover the monitoring of all SAP-based insurance and banking business processes. Such functionality is not possible with a rigidly compiled plugin, at least not if you want to publish the result as open source.

Therefore, check_sap_health was developed as a new plugin based on Perl. It offers the extensibility known from other check_*_health plugins through small self-written Perl snippets. In this way, the plugin can be published with its basic functions while simultaneously being adapted to the special requirements of a company.

## Documentation

### Command line parameters
* *\-\-ashost \<hostname>* The hostname or IP address of the application server
* *\-\-sysnr \<nr>* The system number
* *\-\-username \<username>* The monitoring user
* *\-\-password \<password>* The user's password
* *\-\-client \<nr>* The client number, default is 001
* *\-\-lang \<lang>* The language, default is EN
* *\-\-mode \<mode>* The mode parameter tells the plugin what to do. See list of possible values below
* *\-\-name \<objectname>* Limits the check to a single object or category (see examples, as meaning depends on the mode used)
* *\-\-name2 \<objectname>* For more precise specification
* *\-\-name3 \<objectname>* For more precise specification
* *\-\-regexp* A flag indicating whether \-\-name[2,3] should be interpreted as a regular expression
* *\-\-lookback \<seconds>* Specifies how far back in time to look (e.g., to count certain events)
* *\-\-report \<short\|long\|html>* Some modes output more than one line. With the html option, a colored popup appears in the Thruk GUI
* *\-\-separator \<character>* MTE names in their long form are specified like a path, with backslash as the default separator. With \-\-separator you can specify a different character, e.g., #
* *\-\-mtelong* A flag indicating that the complete path of an MTE should be output (also in the performance data label)
* *\-\-criticalx \<label=threshold>* Override SAP-provided thresholds (for performance MTEs)
* *\-\-warningx \<label=threshold>* Same as above for warnings
* *\-\-negate \<level=level>* Instead of the wrapper plugin negate, this parameter can modify the exit code
* *\-\-with-mymodules-dyn-dir \<directory>* Search this directory for self-written extensions (filename CheckSapHealth*.pm)

### Modes

| Keyword| Meaning| Thresholds|
| -------------| ---------| ------------|
| connection-time | Measures how long connection establishment and login take | 0..n seconds (Default: 1, 5) |
| list-ccms-monitor-sets | Shows the monitor sets available in CCMS | |
| list-ccms-monitors | Shows the monitors available in a monitor set (\-\-name determines the monitor set) | |
| list-ccms-mtes | Shows the MTEs available in a monitor (\-\-name determines the monitor set, \-\-name2 the monitor) | |
| ccms-mte-check | Checks the MTEs available in a monitor. A subset can be selected with \-\-name3 and optionally \-\-regexp | (Default: predefined by CCMS) |
| shortdumps-list | Lists all short dumps found in the SNAP table. With \-\-lookback you can limit how far in the past the events may be | |
| shortdumps-count | Counts the short dumps. Filter by username with \-\-name, by program with \-\-name2. Age limit can also be specified with \-\-lookback | |
| shortdumps-recurrence | Counts short dumps, this time showing the occurrence of individual events | |
| failed-updates | Counts entries in the VHDR table that have been added since the last plugin run | |
| list-jobs| Lists existing jobs or jobs that ran in the lookback interval | |
| failed-jobs| Checks if jobs ended with errors | |
| exceeded-failed-jobs| Checks if jobs ended with errors or if runtime exceeded a threshold | |
| count-processes | Counts processes of types DIA, UPD, UP2, BGD, ENQ and SPO. Alerts if none (or fewer than desired number specified via warningx/criticalx) are running | 1:,1: |
| list-processes | Lists currently running processes with their PIDs | |
| failed-idocs | Searches the EDIDS table for status messages with STATYP E or W | |
| list-idocs | Lists status messages from the EDIDS table | |
| workload-overview | Checks average response time of task types analogous to ST03 workload of recent minutes | |

## Prerequisites
check_sap_health is based on the Perl module [sapnwrfc] and this in turn on the [NW RFC SDK].

First, download the SDK from SAP. The filename is approximately: *NWRFC_20-20004565-Linux-x86_64.SAR* (please use the latest version).

To unpack this file, you need the SAPCAR command, also available for download from SAP or obtainable from a SAP admin.

Unpack the SDK to a temporary directory:
``` bash
$ cd /tmp
$ SAPCAR -xf NWRFC_20-20004565-Linux-x86_64.SAR
```

The extracted files are then in /tmp/nwrfcsdk.
Then install (as site user) the Perl module sapnwrfc:
``` bash
$ perl -MCPAN -e "install sapnwrfc"
```

During installation, you'll be asked where the SAP SDK can be found. Enter */tmp/nwrfcsdk*.
Finally, copy the shared libs of the SDK from the temporary directory to the *local/lib* directory of the OMD site:
``` bash
$ cd /tmp/nwrfcsdk
$ cp libicudata.so.34 libicudecnumber.so libicui18n.so.34 libicuuc.so.34 libsapnwrfc.so libsapucum.so $OMD_ROOT/local/lib
```

## Installation
``` bash
tar zxf check_sap_health...tar.gz; cd check_sap_health...; ./configure; make
cp plugins-scripts/check_sap_health /destination/path
```

In [OMD] check_sap_health is already included. No extra installation of the plugin is needed (SDK and nwrfcsdk are still required though - we cannot include SAP software with OMD).

## Examples
``` bash
$ check_sap_health --mode connection-time \
    --warning 10 --critical 20
OK - 0.07 seconds to connect as NAGIOS@NPL | 'connection_time'=0.07;10;20;;

$ check_sap_health --mode list-ccms-mtes \
    --name "SAP CCMS Monitor Templates" --name2 Enqueue
NPL\Enqueue\Enqueue 50
NPL\Enqueue\Enqueue Server\ 70
NPL\Enqueue\Enqueue Server\Backup Requests 100
NPL\Enqueue\Enqueue Server\CleanUp Requests 100
...

$ check_sap_health --mode ccms-mte-check \
    --name "SAP CCMS Monitor Templates" --name2 Enqueue \
    --name3 "NPL#Enqueue#Enqueue Server#Granule Arguments Actual Utilisation" \
    --separator '#'
OK - Enqueue Server Granule Arguments Actual Utilisation = 0% | 'Enqueue Server_Granule Arguments Actual Utilisation'=0%;50;80;0;100

$ check_sap_health --mode shortdumps-recurrence \
    --report html --lookback $((3600*24*2))  \
    --warningx shortdumps=1000 --criticalx shortdumps=1000 \
    --warningx max_unique_shortdumps=15 --criticalx max_unique_shortdumps=150
WARNING - the most frequent error appeared 95 times | 'shortdumps'=108;1000;1000;; 'max_unique_shortdumps'=95;15;150;;

$ check_sap_health --mode count-processes
OK - 4 DIA processes, 1 UPD process, 1 UP2 process, 2 BGD processes, 1 ENQ process, 1 SPO process | 'num_dia'=4;1:;1:;; 'num_upd'=1;1:;1:;; 'num_up2'=1;1:;1:;; 'num_bgd'=2;1:;1:;; 'num_enq'=1;1:;1:;; 'num_spo'=1;1:;1:;;

$ check_sap_health --mode failed-idocs
OK - idoc 0000000000143130 has status "Data passed to port OK" (Information) at Tue Jun  7 05:02:42 2016
```

## Extensions
In the directory $HOME/etc/check_sap_health, place Perl files containing self-written code. Example: CheckSapHealthTest.pm

``` perl
package MyTest;
our @ISA = qw(Classes::SAP::Netweaver::Item);
use Time::HiRes;

sub init {
  my $self = shift;
  my $bapi_tic = Time::HiRes::time();
  if ($self->mode =~ /my::test::rfcping/) {
    my $ping = $self->session->function_lookup("RFC_PING");
    my $fc = $ping->create_function_call;
    my $frc = $fc->invoke();
    $self->add_ok("pong");
    # $fc can now be evaluated
  }
  my $bapi_tac = Time::HiRes::time();
  my $bapi_duration = $bapi_tac - $bapi_tic;
  $self->set_thresholds(warning => 5, critical => 10);
  $self->add_message($self->check_thresholds($bapi_duration),
       sprintf "runtime was %.2fs", $bapi_duration);
  $self->add_perfdata(
      label => 'runtime',
      value => $bapi_duration,
  );
}
```

Important: The filename must start with *CheckSapHealth* and have the extension *.pm*.

The class contained therein must begin with *My*. The plugin is then called with **\-\-mode my-test-mode**, where the argument is split using the hyphen as separator and reassembled with double colons. (From *my-test-mode* becomes the internal representation *my::test::mode*).

``` bash
check_sap_health --mode my-test-rfcping \
    --with-mymodules-dyn-dir $HOME/etc/check_sap_health
OK - pong, runtime was 0.03s | 'runtime'=0.03;5;10;;
```

**ATTENTION!!!** Since version 2.0, this My package must inherit from Classes::SAP::Netweaver or preferably from Classes::SAP::Netweaver::Item. See example above.

## Download

Go to [Github](https://github.com/lausser/check_sap_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_sap_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser
Check_sap_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)