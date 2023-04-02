---
title: check_hpasm
---
## Description

check_hpasm is a plugin for Nagios which checks the hardware health of Hewlett-Packard Proliant Servers. To accomplish this, you must have installed the hpasm package. The plugin checks the health of

* Processors 
* Power supplies 
* Memory modules 
* Fans 
* CPU- and board-temperatures 
* Raids (ide and sas only when using SNMP) 

and alerts you if one of these components is faulty or operates outside its normal parameters.

## Documentation
The plugin can operate in two modes:

* Local. The plugin runs on the server which is to be checked. The command hpasmcli (from the hpasm.rpm package) must be installed. 
* Remote. The plugin runs on the Nagios server. It finds out the status of the remote hardware by contacting remote server with SNMP. The hpasm package must be installed on the remote server. 

``` bash
nagios$ check_hpasm
OK - hardware working fine
nagios$ check_hpasm -H 10.0.73.30 -C public
OK - hardware working fine
nagios$ check_hpasm -H 10.0.73.30 -C public -P 1
OK - hardware working fine
nagios$ check_hpasm -H 10.0.73.30 -C public --snmpwalk /usr/bin/snmpwalk
OK - hardware working fine
```

### Comparison of the two modes: lokal und remote.
{% asset_image check_hpasm_modes.jpg %}

### Verbosity
For debugging purposes it can be called with the --verbose (or -v) option. It will then output the detailed status of each checked component:

``` bash
nagios$ check_hpasm -v
CRITICAL - dimm module 0:5 (module 5 @ cartridge 0) needs attention (degraded), System: 'proliant dl360 g5', S/N: '3UH841N09K', ROM: 'P58 08/03/2008'
checking cpus
cpu 0 is ok
cpu 1 is ok
checking power supplies
powersupply 1 is ok
powersupply 2 is ok
checking fans
fan 1 is present, speed is normal, pctmax is 50%, location is powerSupply, redundance is redundant, partner is 2
fan 2 is present, speed is normal, pctmax is 50%, location is cpu, redundance is redundant, partner is 3
fan 3 is present, speed is normal, pctmax is 50%, location is cpu, redundance is redundant, partner is 1
checking temperatures
1 ioBoard temperature is 42C (65 max)
2 ambient temperature is 18C (40 max)
3 cpu temperature is 30C (95 max)
4 cpu temperature is 30C (95 max)
5 powerSupply temperature is 29C (60 max)
checking memory
dimm module 0:1 (module 1 @ cartridge 0) is ok
dimm module 0:2 (module 2 @ cartridge 0) is ok
dimm module 0:3 (module 3 @ cartridge 0) is ok
dimm module 0:4 (module 4 @ cartridge 0) is ok
dimm module 0:5 (module 5 @ cartridge 0) needs attention (degraded)
dimm module 0:6 (module 6 @ cartridge 0) is ok
dimm module 0:7 (module 7 @ cartridge 0) is ok
dimm module 0:8 (module 8 @ cartridge 0) is ok
checking disk subsystem
da controller 0 in slot 0 is ok
controller accelerator is ok
controller accelerator battery is ok
logical drive 0:1 is ok (distribDataGuard)
physical drive 0:0 is ok
physical drive 0:1 is ok
physical drive 0:2 is ok
physical drive 0:3 is ok
physical drive 0:4 is ok
physical drive 0:5 is ok | fan_1=50% fan_2=50% fan_3=50% temp_1_ioBoard=42;65;65 temp_2_ambient=18;40;40 temp_3_cpu=30;95;95 temp_4_cpu=30;95;95 temp_5_powerSupply=29;60;60
```

--verbose (or -v) can be repeated several times or given a numerical argument. The maximum level is -vvv. Using this level you will see a complete dump of all detected hardware components with all details.

``` bash
nagios$ check_hpasm -vvv
...
[CPU_0]
cpqSeCpuSlot: 0
cpqSeCpuUnitIndex: 0
cpqSeCpuName: Intel Xeon
cpqSeCpuStatus: ok
info: cpu 0 is ok

[PS_1]
cpqHeFltTolPowerSupplyBay: 1
cpqHeFltTolPowerSupplyChassis: 0
cpqHeFltTolPowerSupplyPresent: present
cpqHeFltTolPowerSupplyCondition: ok
cpqHeFltTolPowerSupplyRedundant: redundant
info: powersupply 1 is ok
...
[FAN_1]
cpqHeFltTolFanChassis: 1
cpqHeFltTolFanIndex: 1
cpqHeFltTolFanLocale: powerSupply
cpqHeFltTolFanPresent: present
cpqHeFltTolFanType: spinDetect
cpqHeFltTolFanSpeed: normal
cpqHeFltTolFanRedundant: redundant
cpqHeFltTolFanRedundantPartner: 2
cpqHeFltTolFanCondition: ok
cpqHeFltTolFanHotPlug: nonHotPluggable
info: fan 1 is present, speed is normal, pctmax is 50%, location is powerSupply, redundance is redundant, partner is 2
...
[PHYSICAL_DRIVE]
cpqDaPhyDrvCntlrIndex: 0
cpqDaPhyDrvIndex: 4
cpqDaPhyDrvBay: 5
cpqDaPhyDrvBusNumber: 1
cpqDaPhyDrvSize: 1864
cpqDaPhyDrvStatus: ok
cpqDaPhyDrvCondition: ok
...
```

### Blacklisting
If you want checks of failed/missing components to be skipped, so alerts caused by these are suppressed, then use the option --blacklist to blacklist them. With this option you give the plugin a list of items separated by / having the following format:

\<typ>:\<nr>[,\<nr>...][/\<typ>:\<nr>[,\<nr>...]]...

where \<type> can take one of the following values:

| type | abbrev. value|
|-----|---|
| cpu | c |
| powersupply | p |
| fan | f |
| overall fan status | ofs |
| temperature | t |
| dimm | d |
| da controller | daco |
| da controller accelerator | daac |
| da controller accelerator battery | daacb |
| da logical drive | dald |
| da physical drive | dapd |
| scsi controller | scco |
| scsi logical drive | scld |
| scsi physical drive | scpd |
| fcal controller | fcaco |
| fcal accelerator | fcaac |
| fcal host controller | fcahc |
| fcal host controller overall condition | fcahco |
| fcal logical drive | fcald |
| fcal physical drive | fcapd |
| fuse | fu |
| enclosure manager | em |
| iml-event | evt |

The \<nr> of a component can be found in the output of check_hpasm -v.

| output | blacklist with |
|--------|----------------|
| checking cpus|
| cpu 0 is ok                                                             | c:0|
| cpu 1 is ok                                                             | c:1|
| checking power supplies|
| powersupply 1 is ok                                                     | p:1|
| powersupply 2 is ok                                                     | p:2|
| checking fans|
| fan 1 is present, speed is normal, ....                                 | f:1|
| fan 2 is present, speed is normal, ....                                 | f:2|
| fan 3 is present, speed is normal, ....                                 | f:3|
| overall fan status: fan=ok, cpu=ok|
| checking temperatures|
| 1 ioBoard temperature is 42C (65 max)                                   | t:1|
| 2 ambient temperature is 18C (40 max)                                   | t:2|
| 3 cpu temperature is 30C (95 max)                                       | t:3|
| 4 cpu temperature is 30C (95 max)                                       | t:4|
| 5 powerSupply temperature is 29C (60 max)                               | t:5|
| checking memory|
| dimm module 0:1 (module 1 @ cartridge 0) is ok                          | d:0:1|
| dimm module 0:2 (module 2 @ cartridge 0) is ok                          | d:0:2|
| dimm module 0:3 (module 3 @ cartridge 0) is ok                          | d:0:3|
| dimm module 0:4 (module 4 @ cartridge 0) is ok                          | d:0:4|
| dimm module 0:5 (module 5 @ cartridge 0) needs attention (degraded)     | d:0:5|
| dimm module 0:6 (module 6 @ cartridge 0) is ok                          | d:0:6|
| dimm module 0:7 (module 7 @ cartridge 0) is ok                          | d:0:7|
| dimm module 0:8 (module 8 @ cartridge 0) is ok                          | d:0:8|
| checking disk subsystem|
| da controller 3 in slot 0 is ok                                         | daco:3|
| controller accelerator is ok                                            | daac:3|
| controller accelerator battery is ok                                    | daacb:3|
| logical drive 3:1 is ok (mirroring)                                     | dald:3:1|
| logical drive 3:2 is ok (mirroring)                                     | dald:3:2|
| physical drive 3:0 is ok                                                | dapd:3:0|
| physical drive 3:1 is ok                                                | dapd:3:1|
| physical drive 3:2 is ok                                                | dapd:3:2|
| physical drive 3:3 is ok                                                | dapd:3:3|
| ide controller 0 in slot -1 is ok and unused                            | ideco:0|
| fcal controller 1:0 in box 1/slot 0 needs attention (degraded)          | fcaco:1:0|
| fcal accelerator in box 1/slot 0 is temp disabled                       | fcac:1:0|
| logical drive 1:1 is failed (advancedDataGuard)                         | fcald:1:1|
| physical drive 1:128 is failed                                          | fcapd:1:128|
| physical drive 1:129 is ok                                              | fcapd:1:129|
| physical drive 1:130 is failed                                          | fcapd:1:130|
| physical drive 1:131 is ok                                              | fcapd:1:131|
| physical drive 1:132 is failed                                          | fcapd:1:132|
| physical drive 1:133 is ok                                              | fcapd:1:133|
| physical drive 1:134 is ok                                              | fcapd:1:134|
| physical drive 1:135 is ok                                              | fcapd:1:135|
| physical drive 1:144 is ok                                              | fcapd:1:144|
| physical drive 1:145 is ok                                              | fcapd:1:145|
| physical drive 1:147 is unconfigured                                    | fcapd:1:147|
| fcal host controller 0 in slot 1 is ok                                  | fcahc:0|
| fcal host controller 1 in slot 1 is ok                                  | fcahc:1|

Assumed that you want to blacklist the failed memory module and the three failed hard disks (including the logical drive they belong to), you would write

``` text
d:0:5/fcapd:1:128,1:130,1:132/fcald:1:1
```

As an alternative you can write this string into the first line of a file and give the filename as an argument to --blacklist.

### Custom temperature thresholds
If the system-default temperature thresholds should be overridden, use the --customthresholds option.

``` bash
nagios$ check_hpasm
...
1 cpu temperature is 45C (62 max)
2 cpu temperature is 56C (80 max)
3 ioBoard temperature is 38C (60 max)
4 cpu temperature is 59C (80 max)
5 powerSupply temperature is 31C (53 max)
...

nagios$ check_hpasm --customthresholds 1:70/5:65
...
1 cpu temperature is 45C (70 max)
2 cpu temperature is 56C (80 max)
3 ioBoard temperature is 38C (60 max)
4 cpu temperature is 59C (80 max)
5 powerSupply temperature is 31C (65 max)
...
```

### Performance data
With the option --perfdata you can switch on the output of performance data, if not already set as the default during installation. Should the perfdata string become too long, then use --perfdata=short which outputs a short form of the temperature tags (the location part will not be shown)

``` bash
nagios$ check_hpasm
OK - hardware working fine| fan_1=8%;0;0 fan_2=8%;0;0  fan_3=15%;0;0 fan_4=15%;0;0 fan_5=8%;0;0 fan_6=8%;0;0 fan_7=20%;0;0 fan_8=20%;0;0 'temp_1_processor_zone'=38;62;62 'temp_2_cpu#1'=37;73;73 'temp_3_i/o_zone'=49;68;68 'temp_4_cpu#2'=40;73;73 'temp_5_power_supply_bay'=36;44;44

nagios$ check_hpasm --perfdata short
OK - hardware working fine| fan_1=8%;0;0 fan_2=8%;0;0  fan_3=15%;0;0 fan_4=15%;0;0 fan_5=8%;0;0 fan_6=8%;0;0 fan_7=20%;0;0 fan_8=20%;0;0 'temp_1'=38;62;62 'temp_2'=37;73;73 'temp_3'=49;68;68 'temp_4'=40;73;73 'temp_5'=36;44;44
```

### Unknown memory status
With some Bios releases hpasmcli doesn't display the memory modules correctly. The command SHOW DIMM shows only a list of modules with status n/a which is counted as a Warning. Using the --ignore-dimms you can skip memory checking without using a blacklist to avoid this warning.

### Non-redundant fans
If you see a warning because all of the fans are not redundant, then this might be because ther are only single fans instead of pairs of fans on purpose. With --ignore-fan-redundancy you can suppress this warning. (See README).

Unfortunately it is not possible to show fan speed (or percent of max. speed) in SNMP mode. Therefore it is shown substituded by 50%.

## Installation

* After unpacking the Archive, call the ./configure command. Attention should be paid to the --with-noinst-level option which defines the exit code of the plugin if no hpasm rpm was installed. With the option --with-degrees you tell the plugin whether you want temperature values displayed in celsius or fahrenheit. With the option --enable-perfdata you tell check_hpasm to add performance data to it's output by default. If you don't want to see type, serial number and biosrelease in the output, you can switch this off by using --disable-hwinfo. With --enable-hpacucli you activate checking of raid controllers. 
* Grab the hpasm package suitable for your Linux distribution and install it. See the list of links below where to find it. 
* If you run check_hpasm (in local mode) as a non-root user you will need sudo-privileges which allow you to call /sbin/hpasmcli as root without providing a password. 
* Note: if you want to run check_hpasm under Debian with SNMP v3, you must install some additional packages: aptitude install libtie-encryptedhash-perl libdigest-hmac-perl (Thanks Tony Wolf) 

## Examples
More examples for different error conditions:

### memory module failed:

``` bash
nagios$ check_hpasm
CRITICAL - dimm module 2 @ cartridge 2 needs attention (dimm is degraded)

nagios$ check_hpasm -v
checking hpasmd process
System        :proliant dl580 g3
Serial No.    :GB8632FB7V
ROM version   :P38 04/28/2006
checking cpus
 cpu 0 is ok
 cpu 1 is ok
 cpu 2 is ok
 cpu 3 is ok
checking power supplies
 powersupply 1 is ok
 powersupply 2 is ok
checking fans
checking temperatures
 1 cpu#1 temparature is 36 (80 max)
 2 cpu#2 temparature is 34 (80 max)
 3 cpu#3 temparature is 33 (80 max)
 4 cpu#4 temparature is 37 (80 max)
 5 i/o_zone temparature is 32 (60 max)
 6 ambient temparature is 23 (40 max)
 7 system_bd temparature is 34 (60 max)
checking memory modules
 dimm 1@1 is ok
 dimm 2@1 is ok
 dimm 3@1 is ok
 dimm 4@1 is ok
 dimm 1@2 is ok
 dimm 2@2 is dimm is degraded
 dimm 3@2 is ok
 dimm 4@2 is ok
CRITICAL - dimm module 2 @ cartridge 2 needs attention (dimm is degraded)
```

### power supply module failed:

``` bash
nagios$ ./check_hpasm
CRITICAL - powersuply #2 needs attention (failed), powersuply #1 is not redundant
nagios$ ./check_hpasm -v
checking hpasmd process
System        :proliant dl580 g4
Serial No.    :GB8637M8TH
ROM version   :P59 09/08/2006
checking cpus
 cpu 0 is ok
 cpu 1 is ok
 cpu 2 is ok
 cpu 3 is ok
checking power supplies
 powersupply 1 is ok
 powersupply 2 is failed
checking fans
checking temperatures
 1 cpu#1 temparature is 42 (85 max)
 2 cpu#2 temparature is 46 (85 max)
 3 cpu#3 temparature is 44 (85 max)
 4 cpu#4 temparature is 44 (85 max)
 5 i/o_zone temparature is 39 (60 max)
 6 ambient temparature is 27 (40 max)
 7 system_bd temparature is 41 (60 max)
checking memory modules
 dimm 1@1 is ok
 dimm 2@1 is ok
 dimm 3@1 is ok
 dimm 4@1 is ok
 dimm 1@2 is ok
 dimm 2@2 is ok
 dimm 3@2 is ok
 dimm 4@2 is ok
 dimm 1@3 is ok
 dimm 2@3 is ok
 dimm 3@3 is ok
 dimm 4@3 is ok
 dimm 1@4 is ok
 dimm 2@4 is ok
CRITICAL - powersuply #2 needs attention (failed),  powersuply #1 is not redundant
```

### power supply module pulled:

``` bash
nagios$ ./check_hpasm
CRITICAL - powersuply #2 is missing, powersuply #1 is not redundant
nagios$ ./check_hpasm -v
checking hpasmd process
System        :proliant dl580 g4
Serial No.    :GB8637M8TH
ROM version   :P59 09/08/2006
checking cpus
 cpu 0 is ok
 cpu 1 is ok
 cpu 2 is ok
 cpu 3 is ok
checking power supplies
 powersupply 1 is ok
 powersupply 2 is n/a
checking fans
checking temperatures
 1 cpu#1 temparature is 42 (85 max)
 2 cpu#2 temparature is 46 (85 max)
 3 cpu#3 temparature is 44 (85 max)
 4 cpu#4 temparature is 44 (85 max)
 5 i/o_zone temparature is 39 (60 max)
 6 ambient temparature is 27 (40 max)
 7 system_bd temparature is 41 (60 max)
checking memory modules
 dimm 1@1 is ok
 dimm 2@1 is ok
 dimm 3@1 is ok
 dimm 4@1 is ok
 dimm 1@2 is ok
 dimm 2@2 is ok
 dimm 3@2 is ok
 dimm 4@2 is ok
 dimm 1@3 is ok
 dimm 2@3 is ok
 dimm 3@3 is ok
 dimm 4@3 is ok
 dimm 1@4 is ok
 dimm 2@4 is ok
CRITICAL - powersuply #2 is missing, powersuply #1 is not redundant
```

### Hpasm daemon is not running:

``` bash
nagios$ check_hpasm
CRITICAL - hpasmd needs to be started
```

### Hpasm software is not installed:

``` bash
nagios$ check_hpasm
OK - hardware working fine, at least i hope so because hpasm is not installed
```

### Call to participate
Please run check_hpasm -v on as many as possible different platforms. Chances are you have a rare Proliant model whose components are not detected completely. You will then see instructions on how to report this to the author.

The following line appears frequently but can be considered harmless:

``` text
#0 SYSTEM_BD - -
```

I am always interested in test data. If you want to do me a favour, send me the output of

``` bash
snmpwalk ... <ip-adress> 1.3.6.1.4.1.232
```

or if you are using the local variant, i'd like to see the output of the following script:

``` bash
hpasmcli=$(which hpasmcli)
hpacucli=$(which hpacucli)
for i in server powersupply fans temp dimm iml
do
  $hpasmcli -s &quot;show $i&quot; | while read line
  do
    printf '%s %s\n' $i &quot;$line&quot;
  done
done
if [ -x &quot;$hpacucli&quot; ]; then
  for i in config status
  do
    $hpacucli ctrl all show $i | while read line
    do
      printf '%s %s' $i &quot;$line&quot;
    done
  done
fi
```

## Download
{% asset_download check_hpasm-4.8.0.2.tar.gz category:nagios %}

## Externe Links

* [hpasm RPM-Pakete](ftp://ftp.compaq.com/pub/products/servers/supportsoftware/linux)
* [hpacucli RPM-Pakete](ftp://ftp.compaq.com/pub/products/servers/supportsoftware/linux)
* [Win2003 System Management Driver](http://h20000.www2.hp.com/bizsupport/TechSupport/SoftwareDescription.jsp?swItem=MTX-3bbefa4d3f0547c3b81acbddb8&amp;lang=en&amp;cc=us&amp;mode=3&amp;)
* [Win2003 Insight Management Agents](http://h20000.www2.hp.com/bizsupport/TechSupport/SoftwareDescription.jsp?lang=en&amp;cc=US&amp;swItem=MTX-ed4b332887f945a383fe2b06e7)
* [Managing Proliant Servers with Linux](http://h20000.www2.hp.com/bc/docs/support/SupportManual/c00223285/c00223285.pdf)
* [HPASM for Debian](http://gentoo-wiki.com/HOWTO_Use_Hpasm)
* [Nagios Homepage](http://www.nagios.org/)
* [Nagios Plugins Exchange](http://exchange.nagios.org/)
* [German Nagios Portal](http://www.nagios-portal.de/)
* [German Nagios Wiki](http://www.nagios-wiki.de/)
* [EBuild for Gentoo](http://bugs.gentoo.org/show_bug.cgi?id=202867)

## Changelog
{% embedurl url:https://raw.githubusercontent.com/lausser/check_hpasm/master/ChangeLog %}

## Copyright
Gerhard Lausser

Check_hpasm is released under the [GNU General Public License](http://www.gnu.de/documents/gpl.de.html).

## Author
Gerhard Lausser (gerhard.lausser@consol.de) will gladly answer your questions.

