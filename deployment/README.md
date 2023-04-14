### Installation

#### Create a k8s cluster inside docker
``` bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
K3D_FIX_DNS=1 k3d cluster create omd -p "8081:80@loadbalancer"
```

#### Build the container image and import it in the cluster
``` bash
docker build -t consol/omd-consol-de/ocd:latest .
docker tag consol/omd-consol-de/ocd:latest ghcr.io/consol/omd-consol-de/ocd:latest
docker push ghcr.io/consol/omd-consol-de/ocd:latest
# images with tag "latest" can not be imported, it must have a version
docker tag consol/omd-consol-de/ocd:latest consol/omd-consol-de/ocd:1.1
k3d image import consol/omd-consol-de/ocd:1.1 -c omd
```



