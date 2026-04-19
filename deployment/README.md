# omd.consol.de — Kubernetes Deployment

This folder holds the Kubernetes manifests that run the **omd.consol.de**
website inside a single-node KIND cluster on the production VM.

The **authoritative manifests are `ocd-10-*.yml` … `ocd-19-*.yml`**. Files
`ocd-01-*.yml` … `ocd-09-*.yml` are the previous monolithic deployment,
kept for reference / rollback only. Do not edit the legacy files unless
you are rolling back.

A detailed change log and design rationale lives in [REDESIGN.md](REDESIGN.md);
this file is the operator's guide.

---

## 1. What's running

Three small Deployments, each with a focused job:

| Deployment | Replicas | Job |
|---|---|---|
| `ocd-builder` | 1 (`Recreate`) | Pulls the GitHub repo and rebuilds the Hugo site on every commit. |
| `ocd-web` | 2 (`RollingUpdate`, `maxUnavailable: 0`, PDB `minAvailable: 1`) | Serves the static site with nginx. Stateless. |
| `ocd-telemetry` | 1 (`Recreate`) | Runs GoAccess over the shared nginx logs and serves the HTML report. |

Two Services expose the public surface via NodePorts on the single KIND
node:

| Service | NodePort | Backend |
|---|---|---|
| `ocd-web` | **30008** | website (nginx :80) |
| `ocd-telemetry` | **30009** | GoAccess report (python http.server :8000) |

The NodePorts are unchanged from the legacy deployment — the system-level
nginx on the VM forwards `omd.consol.de` to `localhost:30008` and does
**not** need to be reconfigured.

---

## 2. Why it was redesigned

The legacy `ocd-05-deployment.yml` ran everything in one Pod with a
single replica: `git-sync` + `hugo --watch` + `nginx` + `goaccess`. In
production this deployment had two recurring failure modes that
compounded:

1. **Runaway Hugo rebuild.** `hugo --watch` reacted to git-sync's symlink
   swap and re-ran the full production render pipeline (minify, image
   processing). Because it shared the Pod's cgroup with nginx, it could
   pin the CPU at 100 % and starve nginx of page cache, dragging down
   unrelated sites on the same VM.
2. **No recovery story.** One replica, no liveness or readiness probe,
   so Kubernetes could not detect a wedged pod and could not route
   around it. Every incident required manual intervention.

The redesign separates **build** from **serve** and gives the serving
tier a real recovery story. Nothing about the contract with the outside
world changes — same NodePorts, same host, same Docker container
running KIND.

### Fix 1 — Build and serve run in different pods

`hugo` is no longer `--watch`. It is a one-shot build, triggered by
git-sync's `--exechook-command` after every successful sync, and lives
in its own Deployment (`ocd-builder`) with its own cgroup
(`limits: cpu 1000m, memory 1024Mi`). If Hugo blows up, Kubernetes
OOM-kills and restarts just the builder pod — nginx is untouched.

### Fix 2 — Atomic content publication

Hugo builds into `/srv/omd/html-<timestamp>/` on the node hostPath,
then publishes with:

```
ln -sfn html-<ts> /srv/omd/current.new
mv -Tf /srv/omd/current.new /srv/omd/current
```

The serving symlink `/srv/omd/current` always points at a complete
tree — either the previous build or the new one, never a half-written
one. `ocd-web` mounts it read-only, so nginx cannot observe a
partially-rendered site.

### Fix 3 — The serving tier is boring

`ocd-web` runs **two** nginx replicas of `nginx:1.29-alpine` with:

- `readinessProbe` and `livenessProbe` on `/healthz`
- **Guaranteed QoS** (`requests == limits` = 200m CPU / 128 Mi memory)
  so it's the last thing evicted under node pressure
- `RollingUpdate maxSurge: 1, maxUnavailable: 0` plus a
  `PodDisruptionBudget minAvailable: 1` — during rollouts or voluntary
  disruptions the Service always has at least one Ready endpoint
- A per-pod access log file `access-$hostname.log` on the shared node
  hostPath `/var/log/ocd-nginx`, so multiple replicas do not contend on
  one file and `ocd-telemetry` can aggregate across replicas

nginx has no code path that reacts to upstream events. The only
realistic failure is a process crash, which the liveness probe catches
in ≤10 s.

### Fix 4 — Telemetry is isolated

`goaccess` and its Python webserver move out to `ocd-telemetry`. A
GoAccess CPU spike now hits its own pod, never the serving tier.
History survives pod restarts via the `goaccess-db-pvc`
PersistentVolumeClaim.

---

## 3. Robustness properties at a glance

| Failure mode | What happens now |
|---|---|
| Bad commit causes Hugo crash / OOM | `ocd-builder` restarts; `current` still points at the last good build; site keeps serving. |
| nginx process crash | Liveness probe fails → kubelet restarts the container; the other replica keeps serving. |
| Rolling nginx update | `maxUnavailable: 0` + PDB guarantee one Ready replica at all times. |
| Node pressure (memory/CPU) | Guaranteed-QoS `ocd-web` evicted last; `ocd-builder` / `ocd-telemetry` absorb the pressure first. |
| Long build | No effect on serving (separate cgroup); content publication is atomic. |
| git-sync transient failure | Retries every 30 s; last-good content remains published. |

Residual risks are enumerated in REDESIGN.md §10 (single-node KIND,
`hostPath` ties builder+web to the same node, etc.).

---

## 4. File layout

```
deployment/
├── ocd-10-namespace.yml      # Namespace: ocd
├── ocd-11-configmaps.yml     # git-repo, git-config, git-sync-hooks,
│                             #   nginx-conf, goaccess-config
├── ocd-14-volumes.yml        # goaccess-db-pvc (5 Gi)
├── ocd-15-builder.yml        # Deployment: ocd-builder  (git-sync + hugo)
├── ocd-16-web.yml            # Deployment: ocd-web      (nginx × 2 + PDB)
├── ocd-17-telemetry.yml      # Deployment: ocd-telemetry (goaccess + web)
├── ocd-19-service.yml        # Services: ocd-web (30008), ocd-telemetry (30009)
├── omdconsolde.conf          # example system-nginx config on the VM
├── goaccess_exclude.txt      # reference; active copy is in ocd-11 ConfigMap
├── REDESIGN.md               # full change log and design rationale
└── README.md                 # this file
```

Node-level directories shared between pods on the KIND node:

| Path (inside the KIND node container) | Writer | Reader(s) |
|---|---|---|
| `/srv/omd` | `ocd-builder` / `hugo` | `ocd-web` / `nginx` (read-only) |
| `/var/log/ocd-nginx` | `ocd-web` per replica | `ocd-telemetry` / `goaccess` (read-only) |

These are created with `hostPath: DirectoryOrCreate`. They survive pod
restarts but **not** `kind delete cluster`. To make them persist across
cluster recreation, mount them from the VM with `extraMounts` in the
KIND config (see REDESIGN.md §7).

---

## 5. Installation

The cluster runs inside a Docker container managed by **kind**:

```
root:~# kind create cluster --name ocd
 ✓ Ensuring node image (kindest/node:v1.35.0)
 ✓ Preparing nodes
 ✓ Writing configuration
 ✓ Starting control-plane
 ✓ Installing CNI
 ✓ Installing StorageClass
Set kubectl context to "kind-ocd"

root:~# kubectl get ns
NAME                 STATUS   AGE
default              Active   69s
kube-node-lease      Active   69s
kube-public          Active   69s
kube-system          Active   69s
local-path-storage   Active   65s
```

### First-time deploy

Apply in two phases so `ocd-builder` can publish `current` before the
web replicas come up:

```
# 1. namespace, config, storage
kubectl apply -f ocd-10-namespace.yml \
              -f ocd-11-configmaps.yml \
              -f ocd-14-volumes.yml

# 2. builder — wait until /srv/omd/current exists
kubectl apply -f ocd-15-builder.yml
kubectl -n ocd logs deploy/ocd-builder -c hugo -f
# watch for: "[hugo] published rev=<sha> as <ts>"

# 3. serving tier + services
kubectl apply -f ocd-16-web.yml \
              -f ocd-17-telemetry.yml \
              -f ocd-19-service.yml
```

After the second apply:

```
kubectl -n ocd get deploy,pods,svc
```

should show `ocd-builder 1/1`, `ocd-web 2/2`, `ocd-telemetry 1/1` and
two `NodePort` Services exposing 30008 / 30009.

### Re-applying after a change

For subsequent changes, a single

```
kubectl apply -f .
```

in this directory is safe — it is idempotent for all existing objects.

### Migrating from the legacy deployment

See REDESIGN.md §8 for the cut-over order. The short version:

1. Apply `ocd-10`–`ocd-17` (all three new Deployments come up).
2. `kubectl delete -f ocd-05-deployment.yml -f ocd-09-service.yml` to
   release NodePorts 30008 / 30009.
3. `kubectl apply -f ocd-19-service.yml`.

Rollback is the reverse: delete `ocd-19`, re-apply `ocd-09` and
`ocd-05`. The `goaccess-db-pvc` is shared across both deployments, so
history is preserved in either direction.

---

## 6. Updating the Hugo image

The builder uses the upstream `docker.io/floryn90/hugo:<version>-ext-alpine`
image directly — no custom wrapper is needed. `enableGitInfo = false` in
`config.toml` means Hugo never invokes git, so the old
`ghcr.io/consol-monitoring/ocd` image (which only added `git` on top of
the upstream) is obsolete.

To upgrade Hugo, edit the `image:` line in `ocd-15-builder.yml`:

```yaml
image: docker.io/floryn90/hugo:<new-version>-ext-alpine
```

Then copy the deployment folder to the VM and `kubectl apply -f .`.
`ocd-builder` restarts with the new image; no impact on serving.

---

## 7. Operational checks

```
# overall
kubectl -n ocd get deploy,pods,svc,pdb

# builder progress (most recent Hugo build)
kubectl -n ocd logs deploy/ocd-builder -c hugo --tail=50

# current published build
kubectl -n ocd exec deploy/ocd-builder -c hugo -- ls -l /srv/omd/current

# web readiness (should always be 2)
kubectl -n ocd get endpoints ocd-web

# per-replica access log
kubectl -n ocd logs deploy/ocd-web -c logger --tail=50

# test NodePorts from the VM
curl -sI http://127.0.0.1:30008/healthz
curl -sI http://127.0.0.1:30008/
curl -sI http://127.0.0.1:30009/
```

The system nginx on the VM is what the outside world talks to; its
config is in `/etc/nginx/sites-enabled/omdconsolde.conf` (see
`omdconsolde.conf` in this folder for a reference copy). It forwards
`/` → `localhost:30008` and `/goaccess` → `localhost:30009`, and it
serves `/repo/stable` and `/repo/testing` directly from the VM's
filesystem (those paths are not inside Kubernetes).

---

## 8. Disaster recovery

If the KIND cluster becomes unresponsive:

### 1. Check if the kind container is running

```
root:~# docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED       STATUS         PORTS                       NAMES
da8d04f66d48   kindest/node:v1.35.0   "/usr/local/bin/entr…"   2 years ago   Up 5 minutes   127.0.0.1:46325->6443/tcp   ocd-control-plane
```

### 2. Back up the persistent volume (GoAccess history)

```
root:~# mkdir ~/backup
root:~# rsync -av /var/lib/docker/volumes/<hash>/_data/local-path-provisioner ~/backup
```

Note: the Hugo-built site (`/srv/omd/html-*`) does **not** need a
backup — `ocd-builder` regenerates it from GitHub on startup. The only
state worth saving is the GoAccess DB.

### 3. Delete the hung cluster

```
root:~# kind delete cluster --name ocd
Deleting cluster "ocd" ...
Deleted nodes: ["ocd-control-plane"]
```

### 4. Remove leftover Docker containers (if any)

```
docker rm -f <container-id>
```

### 5. Recreate the cluster

Follow the **Installation** section above.

### 6. Restore the GoAccess PVC

```
root:~/backup# docker stop ocd-control-plane
root:~/backup# docker volume ls

root:~/backup# docker run --rm -it \
  -v $HOME/backup:/backup:ro \
  -v <volume-name>:/data \
  alpine

/ # cp -r \
  /backup/local-path-provisioner/pvc-<old-uid>_ocd_goaccess-db-pvc/* \
  /data/local-path-provisioner/pvc-<new-uid>_ocd_goaccess-db-pvc

/ # exit
```

### 7. Restart the kind container

```
root:~/backup# docker start ocd-control-plane
```

`ocd-builder` will re-clone and rebuild the site automatically.

---

## 9. Architecture diagram

```mermaid
flowchart TB
    GH[📦 GitHub<br/>consol-monitoring/omd-consol-de]
    SysNginx[🌐 System nginx on VM<br/>omd.consol.de → :30008<br/>/goaccess → :30009]

    subgraph Docker["🐳 KIND node container (single-node)"]

        subgraph Builder["☸️ Deployment: ocd-builder (replicas:1, Recreate)"]
            direction LR
            GS["git-sync v4.6.0<br/>--period=30s<br/>--exechook"]
            TRIG[["/var/run/trigger/go<br/>(emptyDir)"]]
            HUGO["hugo (one-shot loop)<br/>--minify --gc"]
            GS -->|exechook writes<br/>GITSYNC_HASH| TRIG
            TRIG -->|poll 5s| HUGO
        end

        subgraph HP1[["🗂 hostPath /srv/omd<br/>html-ts₁/  html-ts₂/  current → html-ts₂"]]
        end

        subgraph Web["☸️ Deployment: ocd-web (replicas:2, RollingUpdate maxUnavailable:0, PDB minAvailable:1)"]
            direction LR
            NGX1[nginx pod A<br/>Guaranteed QoS<br/>/healthz probes]
            NGX2[nginx pod B<br/>Guaranteed QoS<br/>/healthz probes]
        end

        subgraph HP2[["🗂 hostPath /var/log/ocd-nginx<br/>access-pod-A.log  access-pod-B.log"]]
        end

        subgraph Tele["☸️ Deployment: ocd-telemetry (replicas:1, Recreate)"]
            direction LR
            GA[goaccess<br/>--persist --restore]
            GAW[goaccess-web<br/>python http.server :8000]
            PVC[(goaccess-db-pvc<br/>5Gi PVC)]
            GA --> GAW
            GA --- PVC
        end

        subgraph Svcs["🔌 Services (NodePort)"]
            SVCW[ocd-web :80 → :30008]
            SVCT[ocd-telemetry :8000 → :30009]
        end

        HUGO -->|atomic symlink<br/>html-ts + ln -sfn + mv -Tf| HP1
        HP1 -->|read-only mount<br/>subPath: current| NGX1
        HP1 -->|read-only mount<br/>subPath: current| NGX2
        NGX1 -->|access-hostname.log| HP2
        NGX2 -->|access-hostname.log| HP2
        HP2 -->|read-only| GA
        NGX1 --- SVCW
        NGX2 --- SVCW
        GAW  --- SVCT
    end

    GH -->|poll every 30s| GS
    SysNginx -->|:30008| SVCW
    SysNginx -->|:30009| SVCT

    classDef dep fill:#326ce5,stroke:#fff,stroke-width:2px,color:#fff
    classDef host fill:#ff9900,stroke:#fff,stroke-width:2px,color:#000
    classDef ext fill:#28a745,stroke:#fff,stroke-width:2px,color:#fff
    classDef svc fill:#6f42c1,stroke:#fff,stroke-width:2px,color:#fff

    class Builder,Web,Tele dep
    class HP1,HP2 host
    class GH,SysNginx ext
    class Svcs,SVCW,SVCT svc
```

### Update flow

```
GitHub commit
    ↓
git-sync polls (30s interval), pulls to /tmp/git/ocd
    ↓
--exechook-command writes GITSYNC_HASH → /var/run/trigger/go
    ↓
hugo loop notices new hash, builds into /srv/omd/html-<ts>
    ↓
ln -sfn html-<ts> current.new  &&  mv -Tf current.new current       (atomic swap)
    ↓
nginx (both replicas) now serve the new tree on the next request
    ↓
system nginx on the VM forwards omd.consol.de → :30008
```

Read-side and build-side never share a cgroup. The only shared state
is the `/srv/omd/current` symlink, which flips atomically.
