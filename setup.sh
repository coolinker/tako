apt-get update
apt-get install nodejs
apt-get install npm
apt-get install git

git clone  https://github.com/teem2/dreem2.git
git clone https://github.com/coolinker/tako.git

cd dreem2/compositions/
ln -sd /root/tako/ /root/dreem2/compositions/tako

cd root/tako
npm install get-pixels
npm install http-proxy
npm install ndarray
npm install node-rsa
npm install path
npm install request
npm install save-pixels
npm install seajs
npm install winston
npm install ws