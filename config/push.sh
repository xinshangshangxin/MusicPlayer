#!/usr/bin/env bash
function pushCoding() {
	if test -z $1;
	then
	  suffix="music-player";
	else
	  suffix=$1;
	fi 

	gulp prod
	cp ./package.json ./production
	cp ./Dockerfile ./production
	gsed -i 's/"start": ".*/"start": "NODE_ENV=development pm2 start .\/app.js --no-daemon",/g' ./production/package.json
	cd ./production 
	git add -A 
	git commit -m "auto"  || echo "nothing to commit"
	echo "git push -u production master:${suffix}"
	git push -u production master:${suffix}
}

pushCoding $*