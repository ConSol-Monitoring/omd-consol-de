---
author: Fabian Stäber
date: '2018-05-25T00:00:00+00:00'
featured_image: kubernetes-logo.png
tags:
- Kubernetes
title: Backup and Restore a Kubernetes Master with Kubeadm
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="kubernetes-logo.png" alt=""></div>

[Kubeadm][kubeadm] is a basic toolkit that helps you bootstrap a simple [Kubernetes][kubernetes] cluster. It is intended as a [basis for higher-level deployment tools][kubeadm-scope], like [Ansible][ansible] playbooks. A typical Kubernetes cluster set-up with `kubeadm` consists of a single _Kubernetes master_, which is the machine coordinating the cluster, and multiple _Kubernetes nodes_, which are the machines running the actual workload.

Dealing with node failure is simple: When a node fails, the master will detect the failure and re-schedule the workload to other nodes. To get back to the desired number of nodes, you can simply create a new node and add it to the cluster. In order to add a new node to an existing cluster, you first create a token on the master with `kubeadm token create`, then you use that token on the new node to join the cluster with `kubeadm join`.

Dealing with master failure is more complicated. Good news is: Master failure is not as bad as it sounds. The cluster and all workloads will continue running with exactly the same configuration as before the failure. Applications running in the Kubernetes cluster will still be usable. However, it will not be possible to create new deployments or to recover from node failures without the master.

This post shows how to backup and restore a Kubernetes master in a `kubeadm` cluster.

<!--more-->

HA Cluster vs. Backup/Restore
-----------------------------

One way to deal with master failures is to set up a high availability cluster, as described in [creating HA clusters with kubeadm][ha]. The idea is to set up a replicated [etcd][etcd] cluster, and to run an etcd instance along with each master instance. That way, no data will be lost if a single master instance fails.

The HA approach is not always better than a single-master setup:

* Monitoring a single master is much simpler than monitoring a replicated etcd cluster. Running a replicated etcd cluster does not save you from the necessity to set up monitoring.
* Recovery time is not necessarily faster when comparing an HA setup with a single-master setup. In a single-master setup, the monitoring tool will detect master failures and trigger an automated restore script. This is not necessarily slower than etcd's failover mechanism. 
* The HA setup does not save you from implementing backup/restore for the master, because it is still possible that you accidentally destroy the data in a replicated etcd cluster.

The main drawback of the backup/restore approach is that there is no real-time backup of the cluster state. As shown below, we use a Kubernetes [CronJob][cronjob] to create backups of the etcd cluster. When the master fails, all changes in the cluster configuration after the last CronJob run are lost. The cluster will be restored in exactly the same state (deployments, services, etc) as it had when the latest CronJob was run. While you can run the CronJob every few minutes, you will not get the real-time backup a replicated etcd cluster provides.

Whether an HA deployment makes sense or not depends on how you use the cluster. If you change the cluster configuration very frequently (deploy applications so often that you need real-time backup of the cluster state), you might benefit from etcd's data duplication in a HA setup. If your cluster changes at a slower pace, the backup/restore approach might be the better option because it simplifies operations.

What Data should be in the Backup
---------------------------------

There are two data items to be backed up:

* The root certificate files `/etc/kubernetes/pki/ca.crt` and `/etc/kubernetes/pki/ca.key`.
* The etcd data.

Backing up the root certificate is a one-time operation that you do manually after creating the master with `kubeadm init`. The rest of this blog post deals with how to back up the etcd data.

A Kubernetes CronJob to Back Up the etcd Data
--------------------------------------------

As shown in the [etcd documentation][etcdctl], you create a backup of the etcd data with `ETCDCTL_API=3 etcdctl --endpoints $ENDPOINT snapshot save snapshot.db`. We will create Kubernetes [CronJob][cronjob] to run that command periodically. There is no need to install `etcdctl` on the host system or to configure a cron job on the host system.

The following is a step-by-step walk through the CronJob definition. At the end of the blog post, we provide the complete YAML.

The header is straightforward, except that we want to run the CronJob in the `kube-system` namespace:

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: backup
  namespace: kube-system
```

We configure the job to run every three minutes, which is probably too much for production but good for testing:

```yaml
spec:
  schedule: "*/3 * * * *"
  jobTemplate:
    spec:
```

The Kubernetes master uses a [static pod][staticpod] to run etcd. We re-use the etcd Docker image from that pod for our CronJob. The pod definition is found in `/etc/kubernetes/manifests/etcd.yaml`.

```yaml
      template:
        spec:
          containers:
          - name: backup
            # Same image as in /etc/kubernetes/manifests/etcd.yaml
            image: k8s.gcr.io/etcd-amd64:3.1.12
```

The `etcdctl snapshot save` command below will create backup files like `/backup/etcd-snapshot-2018-05-24_21:54:03_UTC.db`. The additional parameters to `etcdctl` specify the certificates and the URL to access etcd.

```yaml
            env:
            - name: ETCDCTL_API
              value: "3"
            command: ["/bin/sh"]
            args: ["-c", "etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt --key=/etc/kubernetes/pki/etcd/healthcheck-client.key snapshot save /backup/etcd-snapshot-$(date +%Y-%m-%d_%H:%M:%S_%Z).db"]
```

The `etctctl` command above assumes that the following volumes mapped into the Docker container:

* `/etc/kubernetes/pki/etcd`: The path on the host system where the etcd credentials are stored.
* `/backup`: The persistent volume where the backups are created.

We need to mount these volumes:

```yaml
            volumeMounts:
            - mountPath: /etc/kubernetes/pki/etcd
              name: etcd-certs
              readOnly: true
            - mountPath: /backup
              name: backup
```

The etcd API is available on port 2379 on the host system. We must run the CronJob in the [host network namespace][hostNetwork] so that it can access etcd using the loopback IP address 127.0.0.1.

```yaml
          hostNetwork: true
```

Normally, Kubernetes prevents workloads from being scheduled on the master. All workloads are run on the nodes. In order to force the CronJob to run on the master, we specify a `nodeSelector` (see [node affinity][nodeaffinity]), and we specify that the CronJob should "tolerate" the `NoSchedule` effect that prevents workloads from running on the master (see [taints and tolerations][tolerations]).

```yaml
          nodeSelector:
            kubernetes.io/hostname: kube-master
          tolerations:
          - effect: NoSchedule
            operator: Exists
          restartPolicy: OnFailure
```

Finally, we need to define the volumes used in the `volumeMounts` above. The first volume is the path on the host system where the etcd credentials are stored. These credentials are created when the cluster is set up with `kubeadm init`.

```yaml
          volumes:
          - name: etcd-certs
            hostPath:
              path: /etc/kubernetes/pki/etcd
              type: DirectoryOrCreate
```

The second volume is the persistent volume where the backup is stored. In my environment, I want to mount a CIFS share so I am using the [fstab/cifs][fstab/cifs] plugin. However, you might use another persistent volume type, depending on where you want to store the backup.

```yaml
          - name: backup
            flexVolume:
              driver: "fstab/cifs"
              fsType: "cifs"
              secretRef:
                name: "backup-volume-credentials"
              options:
                networkPath: "//my-server.com/backup"
                mountOptions: "dir_mode=0755,file_mode=0644,noperm"
```

In order to create the CronJob, store the YAML in a file `backup-cron-job.yml` and run `kubectl apply -f backup-cron-job.yml`.

The [fstab/cifs][fstab/cifs] plugin requires a secret, i.e. the username and password for mounting the CIFS volume. You don't need this if you use another type of persistent volume. The secret is defined as follows (username and password are base64 encoded):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backup-volume-credentials
  namespace: kube-system
type: fstab/cifs
data:
  username: 'ZXhhbXBsZQ=='
  password: 'bXktc2VjcmV0LXBhc3N3b3Jk'
```

In order to create the secret, store the YAML in a file `backup-volume-secret.yml` and run `kubectl apply -f backup-volume-secret.yml`. As said above, this secret is specific to the [fstab/cifs][fstab/cifs] volume plugin, and you will not need it when you use another type of persistent volume.

Recovery from Master Failure
----------------------------

When the master fails, we create a new master and initialize it with the data from the backup. Before running `kubeadm init` on the new master, we need to restore the data from the backup.

First, we restore the root certificate files `/etc/kubernetes/pki/ca.crt` and `/etc/kubernetes/pki/ca.key`. Expected permissions are 0644 for `ca.crt` and 0600 for `ca.key`.

Second, we run `etcdctl` to restore the etcd backup. We don't need to install `etcdctl` on the host system, as we can use the Docker image. Assuming the latest backup is stored in `/mnt/etcd-snapshot-2018-05-24_21:54:03_UTC.db`, we can restore it with the following commands:

```bash
mkdir -p /var/lib/etcd
docker run --rm \
    -v '/mnt:/backup' \
    -v '/var/lib/etcd:/var/lib/etcd' \
    --env ETCDCTL_API=3 \
    'k8s.gcr.io/etcd-amd64:3.1.12' \
    /bin/sh -c "etcdctl snapshot restore '/backup/etcd-snapshot-2018-05-24_21:54:03_UTC.db' ; mv /default.etcd/member/ /var/lib/etcd/"
```

The command above should create a directory `/var/lib/etcd/member/` with permissions 0700.

Finally, we can run `kubeadm init` to create the new master. However, we need an extra parameters to make it accept the existing etcd data:

```bash
kubeadm init --ignore-preflight-errors=DirAvailable--var-lib-etcd
```

Assuming the new master is reachable under the same IP or hostname as the old master, the nodes will reconnect and the cluster is up and running again.

Source Code
-----------

For reference, here's the complete YAML with the CronJob definition:

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: backup
  namespace: kube-system
spec:
  # activeDeadlineSeconds: 100
  schedule: "*/3 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            # Same image as in /etc/kubernetes/manifests/etcd.yaml
            image: k8s.gcr.io/etcd-amd64:3.1.12
            env:
            - name: ETCDCTL_API
              value: "3"
            command: ["/bin/sh"]
            args: ["-c", "etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt --key=/etc/kubernetes/pki/etcd/healthcheck-client.key snapshot save /backup/etcd-snapshot-$(date +%Y-%m-%d_%H:%M:%S_%Z).db"]
            volumeMounts:
            - mountPath: /etc/kubernetes/pki/etcd
              name: etcd-certs
              readOnly: true
            - mountPath: /backup
              name: backup
          restartPolicy: OnFailure
          nodeSelector:
            kubernetes.io/hostname: kube-master
          tolerations:
          - effect: NoSchedule
            operator: Exists
          hostNetwork: true
          volumes:
          - name: etcd-certs
            hostPath:
              path: /etc/kubernetes/pki/etcd
              type: DirectoryOrCreate
          - name: backup
            flexVolume:
              driver: "fstab/cifs"
              fsType: "cifs"
              secretRef:
                name: "backup-volume-credentials"
              options:
                networkPath: "//my-server.com/backup"
                mountOptions: "dir_mode=0755,file_mode=0644,noperm"
```

As we use the [fstab/cifs][fstab/cifs] plugin to mount the persistent volue, we also need the following secret to specify the username and password. If you use any other type of persistent volue, you will not need this.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backup-volume-credentials
  namespace: kube-system
type: fstab/cifs
data:
  username: 'ZXhhbXBsZQ=='
  password: 'bXktc2VjcmV0LXBhc3N3b3Jk'
```

[kubeadm]: https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/
[kubeadm-scope]: https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/
[kubernetes]: https://kubernetes.io
[ansible]: https://www.ansible.com/
[ha]: https://kubernetes.io/docs/setup/independent/high-availability/
[etcd]: https://coreos.com/etcd/
[cronjob]: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
[fstab/cifs]: https://labs.consol.de/kubernetes/2018/05/11/cifs-flexvolume-kubernetes.html
[nodeaffinity]: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity
[tolerations]: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/
[etcdctl]: https://github.com/coreos/etcd/blob/master/Documentation/op-guide/recovery.md
[hostNetwork]: https://kubernetes.io/docs/concepts/policy/pod-security-policy/#host-namespaces
[staticpod]: https://kubernetes.io/docs/tasks/administer-cluster/static-pod/