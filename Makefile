#!/usr/bin/make -f

local-docker-server:
	docker build -t consol/omd-consol-de .
	docker run --rm -p 1313:1313 -v `pwd`:/src consol/omd-consol-de server

test: preparetest .bin/muffet
	./.bin/muffet http://localhost:1313 \
		-i 'http://localhost:1313/' \
		--max-connections=50 \
		--max-connections-per-host=50 \
		--timeout=30

preparetest:
	docker compose up -d --build --wait

.bin/muffet:
	mkdir -p .bin
	GOBIN=$(shell pwd)/.bin go install github.com/raviqqe/muffet/v2@latest

clean:
	docker compose down --rmi all
	docker compose kill -s INT
	docker compose kill
	docker compose rm -f
	rm -rf .bin
