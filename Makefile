all: build

deps:
	npm install

build: deps
	npm run build

install:
	@echo "#!/usr/bin/env bash\n$(realpath ./dist/ampbar-linux-x64/ampbar)" > /usr/sbin/ampbar
	@chmod +x /usr/sbin/ampbar
	@echo "Done!"

clean:
	rm -rf dist/
	rm -rf node_modules/

.PHONY: all
.PHONY: deps
.PHONY: build
.PHONY: install
.PHONY: clean
