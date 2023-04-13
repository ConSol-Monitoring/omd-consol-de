### Installation

#### Create a k8s cluster inside docker
``` bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
K3D_FIX_DNS=1 k3d cluster create omd -p "8081:80@loadbalancer"
```

#### Build the container image and import it in the cluster
``` bash
docker build -t consol/omd-consol-de:latest .
# images with tag "latest" can not be imported, it must have a version
docker tag consol/omd-consol-de:latest consol/omd-consol-de:1.1
k3d image import consol/omd-consol-de:1.1 -c omd
```



