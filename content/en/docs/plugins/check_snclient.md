---
title: check_snclient
tags:
  - plugins
  - snclient
  - nsclient
  - check_snclient
  - check_nsc_web
---

## Description

check_snclient collects check results from NSClient++ and [SNClient](/docs/snclient/) agents using their REST API. It is an alternative to check_nrpe and can be used with any monitoring tool that supports Naemon/Nagios compatible plugins.

The plugin is written in Go for portability. It was previously named `check_nsc_web` and remains fully compatible with that name.

## Documentation

### Usage

```text
check_snclient [options] [query parameters]
```

Without a query, check_snclient checks whether the agent's REST API is reachable. To run a check, append its query name and parameters after the connection options.

### Command line parameters

| Parameter | Description |
| --- | --- |
| `-u <url>` | Agent URL, for example `https://10.1.2.3:8443`. |
| `-t <seconds>[:<STATE>]` | Connection timeout in seconds (default: `10`). Optionally set the timeout state to `0`–`3` or `OK`, `WARNING`, `CRITICAL`, `UNKNOWN` (default: `UNKNOWN`). |
| `-e <STATE>` | Exit code for connection errors (default: `UNKNOWN`). |
| `-a <api version>` | API version: `legacy` or `1` (default: `legacy`). |
| `-l <username>` | REST webserver login (default: `admin`). |
| `-p <password>` | REST webserver password. |
| `-config <file>` | Path to a configuration file. |

### TLS/SSL options

| Parameter | Description |
| --- | --- |
| `-C <pem file>` | Client certificate in PEM format. Requires `-K`. |
| `-K <key file>` | Client certificate key file. |
| `-ca <pem file>` | CA certificate used to verify the server certificate. |
| `-tlsmax <string>` | Maximum TLS version used to connect. |
| `-tlsmin <string>` | Minimum TLS version used to connect (default: `tls1.0`). |
| `-tlshostname <string>` | Server name used when verifying the TLS server name. |
| `-k` | Skip TLS certificate verification. |

### Output options

| Parameter | Description |
| --- | --- |
| `-h` | Print help. |
| `-v` | Enable verbose output. |
| `-vv` | Enable very verbose output and log directly to standard output. |
| `-V` | Print the program version. |
| `-f <integer>` | Round performance data float values to this number of digits (default: `-1`). |
| `-j` | Print the JSON response body. |
| `-r` | Print the raw result without pre/post processing. |
| `-query <string>` | Placeholder for the query string from a configuration file. |

## Examples

The following examples use `-k` to skip TLS certificate verification and the password configured in `snclient.ini`.

### Alive check

```bash
check_snclient -k -p "password from snclient.ini" -u "https://<SERVER_RUNNING_SNCLIENT>:8443"
OK: SNClient API reachable on https://<SERVER_RUNNING_SNCLIENT>:8443
```

### CPU usage

```bash
check_snclient -k -p "password from snclient.ini" -u "https://<SERVER_RUNNING_SNCLIENT>:8443" check_cpu
OK: CPU load is ok.|'total 5m'=16%;80;90 'total 1m'=8%;80;90 'total 5s'=8%;80;90
```

### CPU usage with thresholds

```bash
check_snclient -k -p "password from snclient.ini" -u "https://<SERVER_RUNNING_SNCLIENT>:8443" check_cpu show-all "warning=load > 75" "critical=load > 90"
OK: 5m: 1%, 1m: 0%, 5s: 0%|'total 5m'=1%;75;90 'total 1m'=0%;75;90 'total 5s'=0%;75;90
```

### Service status

```bash
check_snclient -k -p "password from snclient.ini" -u "https://<SERVER_RUNNING_SNCLIENT>:8443" check_service "service=BvSshServer"
OK: All 1 service(s) are ok.|'BvSshServer'=4;0;0
```

### Event log check

```bash
check_snclient -k -p "password from snclient.ini" -u "https://<SERVER_RUNNING_SNCLIENT>:8443" check_eventlog "file=system" "filter=id=8000" "crit=count>0" 'detail-syntax=${message}' show-all "scan-range=-900m"
OK: No entries found|'count'=0;0;0 'problem_count'=0;0;0
```

### Reading parameters and queries from a file

```bash
check_snclient -config ./sample.conf
OK: 5m: 0%, 1m: 0%, 5s: 0% |'total 5m'=0%;80;90;; 'total 1m'=0%;80;90;; 'total 5s'=0%;80;90;;
```

Contents of `sample.conf`:

```text
u https://127.0.0.1:28443
p password
k true
query check_cpu show-all
```

Everything after `query` is appended to existing query arguments.

## Installation

Build the binaries with Docker from the plugin's source directory:

```bash
make docker
```

To select a specific Makefile target:

```bash
make docker target=citest
```

## Download

Go to [GitHub](https://github.com/ConSol-Monitoring/check_snclient), clone and build.

## Changelog

You can find the changelog [here](https://github.com/ConSol-Monitoring/check_snclient/blob/master/Changes).

## Copyright

check_snclient is released under the [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.html).
