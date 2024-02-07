#!/usr/bin/make -f

local-docker-server:
	docker build -t consol/omd-consol-de .
	docker run --rm -p 1313:1313 -v `pwd`:/src consol/omd-consol-de server
