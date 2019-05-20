#!/usr/bin/env bash
cd ..
sudo npm install
sudo npm i nyc
sudo npm run bootstrap
sudo npm run build
sudo npm run test

#npm run clean // removes all the node_modules folders in all modules
#npm run bootstrap // install all dependencies and symlinks the internal modules for all modules
#npm run test // runs all tests
#npm run build // runs rollup
#npm run dev // runs rollup with a watcher
