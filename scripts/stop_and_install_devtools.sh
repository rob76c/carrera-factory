#!/bin/bash

set -e
export INSTANCE_ID="`wget -qO- http://instance-data/latest/meta-data/instance-id`"
export FACTORY=/home/ec2-user/factory-factory
export STAGING=/tmp/devtools-staging

echo `date`: Deploying Devtool on Instance "$INSTANCE_ID" >>/appspecInstall

echo `date`: Stopping Devtools Service >>/appspecInstall
service devtools stop 2>&1 >>/appspecInstall

echo `date`: Switch to run as ec2-user >>/appspecInstall
su ec2-user
cd $FACTORY

echo `date`: Copying staging files to factory >>/appspecInstall
cp -rf $STAGING/* $FACTORY >>/appspecInstall

echo `date`: Running npm install >>/appspecInstall
npm install 2>&1 >>/appspecInstall

echo `date`: Running npm install >>/appspecInstall
npm install nx 2>&1 >>/appspecInstall

echo `date`: Running npm build >>/appspecInstall
npm run build 2>&1 >>/appspecInstall

echo `date`: Starting devtools >>/appspecInstall
sudo service devtools start 2>&1 >>/appspecInstall
echo ----------------------------------------------------------------------------------------- >>/appspecInstall