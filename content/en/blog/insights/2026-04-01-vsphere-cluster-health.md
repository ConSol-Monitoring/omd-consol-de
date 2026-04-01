---
title: "Monitoring vSphere cluster health with check_vsphere"
date: 2026-04-01
tags:
- vsphere
---

## What's new?

The [`cluster-health`](/docs/plugins/check_vsphere/cmd/cluster-health/) command in
**[check_vsphere](/docs/plugins/check_vsphere/)** looks at the members of a
vSphere cluster, checks their state and decides whether the whole cluster is
healthy. By default it treats nodes that are *disconnected* or *in maintenance*
as faulty, but you can tweak that list. Use `--faulty` to customize what counts
as a failure.

## How the threshold works

You tell the command when to raise a warning or a critical alert with the
`--cluster-threshold` flag:

```
[max_members:]warn_threshold:crit_threshold
```

* `max_members` (optional) - Apply the rule to clusters with up to this many members.
* `warn_threshold` – Number or percent of faulty nodes that triggers a **WARN**.
* `crit_threshold` – Number or percent that triggers a **CRIT**.

You can give several `--cluster-threshold` flags for different cluster sizes.
Rules apply to clusters up to their `max_members`; if multiple rules match, the
smallest `max_members` wins. One rule must omit `max_members`; that one is the
fallback.

## Quick examples

* `3:1:1` - For clusters up to 3 nodes: a single fault triggers a critical state (warning and critical equal).
* `5:1:3` - For clusters up to 5 nodes: warn at >=1 faulty node, critical at >=3.
* `10:2:5` - For clusters up to 10 nodes: warn at 2 faulty nodes, critical at 5
* `50:5:15` - For clusters up to 50 nodes: warn at 5 faulty nodes, critical at 15.
* `10%:20%` - Fallback for larger clusters: warning at 10% failures, critical at 20%.

## Usage snippet

```bash
check_vsphere cluster-health \
  --host vcenter.example.com \
  -u naemon@vsphere.local \
  --cluster-threshold 3:1:1 \
  --cluster-threshold 5:1:3 \
  --cluster-threshold 10:2:5 \
  --cluster-threshold 50:5:15 \
  --cluster-threshold '10%:20%' \
  --cluster-name MyCluster
```

## Naemon integration

```
define command{
    command_name check_vsphere_cluster_health
    command_line VSPHERE_PASS=$ARG4$ $USER2$/check_vsphere cluster-health \
      -u $ARG3$ \
      --host $ARG1$ \
      --cluster-name $ARG2$ \
      --cluster-threshold 3:1:1 \
      --cluster-threshold 5:1:3 \
      --cluster-threshold 10:2:5 \
      --cluster-threshold 50:5:15 \
      --cluster-threshold '10%:20%'
}

define service{
    use generic-service
    host_name vcenter.example.com
    service_description vSphere Cluster Health
    check_command check_vsphere_cluster_health!vcenter.example.com!MyCluster!user!pw
}
```
