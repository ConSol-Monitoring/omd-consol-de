#!/usr/bin/make -f

local-docker-server:
	docker build -t consol/omd-consol-de .
	docker run --rm -p 1313:1313 -v `pwd`:/src consol/omd-consol-de server

test:
	docker compose up -d --build --wait
	go install github.com/raviqqe/muffet/v2@latest
	muffet http://localhost:1313 \
		-i 'http://localhost:1313/' \
		--max-connections=50 \
		--max-connections-per-host=50 \
		--timeout=30

clean:
	docker compose down --rmi all
	docker compose kill -s INT
	docker compose kill
	docker compose rm -f
