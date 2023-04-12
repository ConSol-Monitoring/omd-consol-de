### Installation

#### Create a k8s cluster inside docker
``` bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
K3D_FIX_DNS=1 k3d cluster create omd
```

#### Build the container image and import it in the cluster
``` bash
docker build -t consol/omd-consol-de:latest .
k3d image import omd-consol-de:latest -c omd
```



