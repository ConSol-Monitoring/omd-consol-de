# omd-consol-de
Website https://omd.consol.de

```
docker build -t consol/omd-consol-de .
docker run --rm -p 1313:1313 -v `pwd`:/src consol/omd-consol-de server
```
