---
draft: false
date: 2026-03-24T10:31:49.000Z
title: "Reliable RKE2 Certificate Expiry Alerts for Clusters Managed by SUSE Rancher"
linkTitle: "alert-rke2-certificate-expiry"
author: Ulrike Klusik
tags:
  - Loki
  - Prometheus
  - RKE2
  - Kubernetes Events
---


This shows how to combine Kubernetes Events and Rancher Metadata for precise, actionable alerting.

---
## Alert ManagedClusterRKE2ExpiringCertificates
SUSE Rancher provides an RKE2 cluster management platform for application teams. As an infrastructure team operating a SUSE Rancher instance, we want to notify teams about expiring RKE2 certificates, as their rotation requires manual intervention. Unfortunately, the information about expiring certificates is only available in the Kubernetes Events of the Rancher-managed RKE2 clusters. Hence, we need to automatically install Kubernetes Event log collection via Fleet on the managed clusters.

For notification purposes, we need additional information about the cluster owner. This cannot be easily propagated down to managed clusters, so the event logs contain no reference to the Rancher project they belong to nor to the owning application. Therefore, we need to enrich the alert with the **application** label that we added to the Rancher **Project** object. This enables routing of the alert to the correct team via Alertmanager.

---
## Setting the Stage: Rancher, Projects and Managed Clusters  
1. **Rancher deployment** – A single RKE2 cluster hosts the Rancher application.  
2. **Rancher Project management** – The infrastructure team creates *Rancher Projects* (e.g., `proj1`, `proj2`), grants permission to the Application team and adds a custom label `application=<app>` that denotes the owning product. 
3. **Managed Cluster** – Application teams operate their own RKE2 clusters **inside** those projects. These clusters are managed by Rancher.  
The monitoring stack (Loki + Prometheus) runs in the Rancher host cluster, while the managed clusters need to forward their Kubernetes events as logs to the central Loki instance. These logs must include the cluster name.

---
### Deploy Loki in the Rancher Cluster  
Loki can be easily deployed via Helm chart. For the recording rules, we need additional
**Ruler configuration** - configuration of rules via ConfigMap
**Remote write** – Configure Loki to forward its streams to the Prometheus installed via Helm rancher-monitoring in RKE2 clusters
This is achieved by the following values.
```yaml
# values.yaml snippet for Loki Helm
loki:
  # requirement: 
  # storage.bucketNames.rules is not set!
  
  # Remote write configuration
  config:
    ...
    # Remote write to Prometheus
    remote_write:
      - url: http://prometheus-operated.cattle-monitoring-system.svc:9090/api/v1/write
        timeout: 30s
   # configuration of rules taken from configmaps:
    rulerConfig:
      storage:
        type: local
        local:
          directory: /rules
      rule_path: /var/loki/rules-temp
  # configuration of rules taken from configmaps supporting different tenants:
  sidecar:
    rules:
      folderAnnotation: tenant
```

### Deploy the Loki recording rule 
The following ConfigMap specifies the recording rules for logs from tenant "managed-cluster", where the Kubernetes events should be written to.
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: loki-recording-rules
  namespace: monitoring
  annotations:
    tenant: managed-cluster
  labels:
    # marks config map to be used by the ruler:
    loki_rule: "true"
data:
  rke2-recording-rules.yaml: |
    groups:
      - name: rke2-recording-rules
        interval: 10m
        rules:
          - record: loki:recorded:rke2_cert_expiration_timestamp
            expr: |
              max by (rancher_cluster,managed_cluster,cert) (max_over_time(
               {source="kubernetes_events"} | json | reason = "CertificateExpirationWarning"
               | line_format "{{ .msg }}"
               | regexp "(?P<pair>[^,:]+\\.crt:.*?(expire within .+ days|expired) at [^,]+)"
               | label_format cert=`{{ regexReplaceAll "(?P<cert>[^:]+\\.crt):.*" .pair "${cert}" }}`
               | label_format expire=`{{ regexReplaceAll ".*(expire within .+ days|expired) at (?P<date>[^,]+)" .pair "${date}" }}`
               | label_format managed_cluster=cluster
               | label_format expires_ts=`{{ unixEpoch (toDate "2006-01-02T15:04:05Z07:00" .expire) }}s`
               | unwrap duration_seconds(expires_ts)
              [30m]))
```
This log query does the heavy lifting by creating one metric point per mentioned certificate from a single log line, as
```
{
  "count": 638,
  "eventRV": "496410095",
  "kind": "Node",
  "msg": "Node certificates require attention - restart rke2 on this node to trigger automatic rotation: controller-manager/kube-controller-manager.crt: certificate CN=kube-controller-manager will expire within 120 days at 2026-06-08T07:38:41Z, scheduler/kube-scheduler.crt: certificate CN=kube-scheduler will expire within 120 days at 2026-06-08T07:38:41Z",
  "name": "rke2-eu-cluster1-controlplane-976f6b69-lt7lj",
  "reason": "CertificateExpirationWarning",
  "reportingcontroller": "rke2-cert-monitor",
  "reportinginstance": "rke2-eu-cluster1-controlplane-976f6b69-lt7lj",
  "sourcecomponent": "rke2-cert-monitor",
  "sourcehost": "rke2-eu-cluster1-controlplane-976f6b69-lt7lj",
  "type": "Warning"
}
```
with the following labels
```
cluster=rke2-eu-cluster1
rancher_cluster=rancher-eu-prod
service_name=kubernetes_events
source=kubernetes_events
```
Let's examine the steps of the query:
- `{source="kubernetes_events"} | json | reason = "CertificateExpirationWarning"` selects the log lines for Kubernetes events with the reason "CertificateExpirationWarning" and converts them to JSON format
- `| line_format "{{ .msg }}"` keeps only the "msg" value from the JSON structure, i.e., the event message
- `| regexp "(?P<pair>[^,:]+\\.crt:.*?(expire within .+ days|expired) at [^,]+)"`: 
    `(?P<pair> … )` captures the part "certname … expire … at DATE" until the last date into a temporary label called pair
- `| label_format cert= ... | label_format expire= ...`: `regexReplaceAll` creates a new line for each occurrence of the patterns in `pair` and metadata labels `cert` and `expire`
- `| label_format managed_cluster=cluster`: simply renames the label to `managed_cluster`
- `| label_format expires_ts=`{{ unixEpoch (toDate "2006-01-02T15:04:05Z07:00" .expire) }}s`: 
  - `toDate` parses the ISO string using Go's layout format.  
  - `unixEpoch` converts the `time.Time` into seconds since epoch.  
  - The trailing `s` is required because Loki expects the value to be a float representing seconds; we keep the `s` suffix for readability (it is stripped later).
  Now we have a numeric label `expires_ts = 1713168000` (for the example above).
- `| unwrap duration_seconds(expires_ts)`: 
   creates a sample with:
   - value – the result of `duration_seconds(expires_ts)`, i.e., the timestamp expressed as a float number of seconds.  
   - labels – everything that exists at this point (`rancher_cluster`, `managed_cluster`, `cert`, etc.).
- Outer `max by (… (max_over_time(....[30m]))`
  The inner `max_over_time` still returns a series per unique set of labels that existed for each inner log line. The outer `max` by collapses any residual duplication (e.g., if the same cert appears on two nodes) into a single series per certificate. The result is a canonical, monotonic timestamp series that can be safely joined with other metrics.
  The longer duration 30m is used to avoid missing logs due to transmission latencies from the managed cluster.
- `interval: 10m`: To limit processing effort and handle delayed log ingestion, the rule is executed only every 10 minutes, analyzing logs from the last 30 minutes.
  
The resulting metric points are:
```
loki:recorded:rke2_cert_expiration_timestamp{cert="controller-manager/kube-controller-manager.crt", managed_cluster="rke2-eu-cluster1", rancher_cluster="rancher-eu-prod"} 1780904321
loki:recorded:rke2_cert_expiration_timestamp{cert="scheduler/kube-scheduler.crt", managed_cluster="rke2-eu-cluster1", rancher_cluster="rancher-eu-prod"} 1780904236
```

---
### Collect Kubernetes Events from Managed Clusters
For collecting and forwarding Kubernetes Events from the managed cluster to the central Loki, we can use Grafana Alloy deployed via Helm chart.
We need to add the managed cluster name and Rancher cluster as external labels, e.g., via environment variables:
```
# extract from alloy values.yaml
alloy:
  configMap:
    content: |-
      loki.source.kubernetes_events "cluster_events" {
        log_format = "json"
        forward_to = [ loki.process.cluster_events.receiver ]
      }
      ...
      loki.write "default" {
        endpoint {
          url = <ingress to loki write endpoint in Rancher RKE2 cluster>
        }
        external_labels = {
          cluster         = sys.env("CLUSTER_NAME"),
          rancher_cluster = sys.env("RANCHER_CLUSTER"),
        }
      }        
```
To ensure we get Kubernetes events automatically from all managed clusters, we can use a Fleet GitRepo within the Rancher cluster. Here we can have the managed cluster name in Fleet variables and the Rancher cluster set in the repo file.

---
### Export Rancher-derived Labels as Metrics  

For alerting routing, we need metrics that show the associated project and its application label for each managed cluster.
However, the connection between managed clusters and projects is not trivial, as it involves several intermediate objects - such as cloud credentials and namespaces - between them.
Since SUSE Rancher does not provide these relationships as metrics, we had to write a customer-specific Prometheus metrics exporter. However, it would be too complex to include here.

So let's assume for now we have the combined metrics available as a single series per managed cluster:
```text
rancher_managed_cluster_owner_info{managed_cluster="rke2-eu-cluster1",project_id="proj1",application="app1"} 1
rancher_managed_cluster_owner_info{managed_cluster="rke2-eu-cluster2",project_id="proj2",application="app1"} 1
rancher_managed_cluster_owner_info{managed_cluster="rke2-eu-cluster3",project_id="proj3",application="app2"} 1
```
This is an info metric – the value is always `1`. This design allows us to use `group_left` to attach the `application` label to any rule that joins on `managed_cluster`.

This exporter is deployed in the Rancher RKE2 cluster and scraped by the operator-managed Prometheus via a ServiceMonitor. For example:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: custom-rancher-exporter
  namespace: monitoring
spec:
  endpoints:
  - port: http
  jobLabel: app
  selector:
    matchLabels:
      app.kubernetes.io/instance: custom-rancher-exporter
      app.kubernetes.io/name: custom-rancher-exporter
```

### Defining The Alert Rule  
Now we can combine the log-derived timestamp with the Rancher label metric in the following Alert rule.
This is deployed via CR PrometheusRule in the Rancher cluster, to be added to the Prometheus from SUSE Rancher-monitoring Helm chart.
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: customer-alerts
  namespace: customer-monitoring
spec:
  groups:
  - name: rke2-alerts
    rules:
      - alert: ManagedClusterRKE2ExpiringCertificates
        annotations:
          action: |
            The certificate rotation needs to be triggered manually. Follow the
            instructions in https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/manage-clusters/rotate-certificates
          description: |
            The certificate {{ $labels.cert }} on cluster {{ $labels.managed_cluster }}
            expires on {{ $value | humanizeTimestamp }}
          impact: |
            When the certificate is not renewed, some Kubernetes services will
            no longer be accessible.
        expr: |
          (max_over_time(loki:recorded:rke2_cert_expiration_timestamp[30m])
            * on(managed_cluster) group_left(application) rancher_managed_cluster_owner_info
          ) < (time() + 5 * 60 * 60 * 24)
        for: 5m
        labels:
          severity: critical
```
**Explanation**
- `max_over_time(...[30m])`: Pull the most recent expiry timestamp for each certificate. A 30-minute look-back is needed since we evaluate logs only every 10 minutes. 
- `* on(managed_cluster) group_left(application) rancher_managed_cluster_owner_info`: Join the timestamp series with the Rancher label metric, copying the `application` label onto the result. 
- `< (time() + 5*60*60*24)`: Trigger when the stored expiry is *earlier* than "now + 5 days". 

With the `application` label present, Alertmanager can now route the alert to the appropriate receiver (e.g., Slack channel `#app1-ops`).

---
## Conclusion  
We have shown a rather complex setup needed to reliably alert customers about expiring RKE2 certificates in their managed clusters.
This required specifically:
1. **Gathering Events from the managed clusters** (Alloy Kubernetes Event collection deployed via Fleet from Rancher Cluster)
2. **Parsing logs into a recorded time series** (Loki recording rules),  
3. **Exporting business metadata as informational metrics** (custom Rancher Exporter), and  
4. **Joining both metrics in a Prometheus alert rule**,
to obtain alerts that are both *precise* (exact expiry timestamps) and *actionable* (routed to the correct owners). The approach scales across any number of managed clusters.

*Happy monitoring!*