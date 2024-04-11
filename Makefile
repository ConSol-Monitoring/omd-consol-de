#!/usr/bin/make -f

local-docker-server:
	docker build -t consol/omd-consol-de .
	docker run --rm -p 1313:1313 -v `pwd`:/src consol/omd-consol-de server

test: .bin/muffet
	docker compose --progress=quiet --ansi=never up -d --build --wait --no-color --no-recreate --quiet-pull
	./.bin/muffet http://localhost:1313 \
		-i 'http://localhost:1313/' \
		--max-connections=50 \
		--max-connections-per-host=50 \
		--timeout=30
	@echo "OK - All links are fine"

preparetest: .bin/muffet
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
