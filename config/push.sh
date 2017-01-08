#!/usr/bin/env bash

projectName="music-player";
nodeEnv="leancloud"

function pushCoding() {
	if test -z $1;
	then
	  projectName="music-player";
	else
	  projectName=$1;
	fi

	if test -z $2;
	then
	  nodeEnv="leancloud";
	else
	  nodeEnv=$2;
	fi

	gulp prod
	cp ./package.json ./production
	cp ./Dockerfile ./production
	gsed -i "s/\"start\": \".*/\"start\": \"NODE_ENV=${nodeEnv} pm2 start .\/app.js --no-daemon\",/g" ./production/package.json
	cd ./production 
	git add -A 
	git commit -m "auto"  || echo "nothing to commit"
	echo "git push -u production master:${projectName}"
	git push -u production master:${projectName} -f
}

pushCoding $*