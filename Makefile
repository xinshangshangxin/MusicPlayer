.PHONY: all test clean static
dev:
	node config/dev_start.js
node-dev:
	node-dev app/app.js
supervisor:
	supervisor -n error -i 'app/public/,app/views/,config/tasks/' app/app.js
push:
	git push origin master
test:
	@ if [ -n "$(g)" ]; \
	then \
		echo 'mocha --recursive --timeout 10000 --require chai --harmony --bail -g $(g) test'; \
		mocha --recursive --timeout 10000 --require chai --harmony --bail -g $(g) test; \
	else \
		echo 'mocha --recursive --timeout 10000 --require chai --harmony --bail test'; \
		mocha --recursive --timeout 10000 --require chai --harmony --bail test; \
	fi
prod:
	gulp prod
	node production/app.js
static:
	gulp static
	cd static && hs