---
title: Migration to 4.x
---

## Migration to OMD-Labs 4.x

OMD-Labs 4.x comes with some changes which might break existing setups.

## Python 3

OMD uses Python 3 now. All internal scripts have been migrated but it might
break other user scripts still using python 2.

The following changes have been made:

  - `~/lib/python`  contains python3 library files
  - `~/lib/python2` contains python2 library files
  - Default environment including `PYTHONPATH` is python 3
  - Python 2 scripts can be used by changing PYTHONPATH and using /usr/bin/python2.
    For example:
    `PYTHONPATH=$OMD_ROOT/lib/python2:$OMD_ROOT/local/lib/python2 /usr/bin/python2 yourscript.py`

The update does not touch your `local/lib/python`. So if it contains python2 libraries, you
should move them to `local/lib/python2`.

## Grafana 7

See [Whats new in Grafana 7](https://grafana.com/docs/grafana/latest/guides/whats-new-in-v7-0/) for more information.
