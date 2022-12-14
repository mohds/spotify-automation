# Spotify Automation

An spotify automation tool using Spotify's official API

# Steps to run
1. Install [NodeJS](https://nodejs.org/en/)
2. Clone the repository:
```
git clone https://github.com/mohds/spotify-automation.git
```
3. Change directory into repository:
```
cd spotify-automation
```
4. Install the required modules:
```
npm install
```
5. Change directory into spotify-automatic-player:
```
cd spotify-automatic-player
```
6. Set your `CLIENT_ID` and `CLIENT_SECRET` environment varaiables. These can be obtained from the developer's [dashboard](https://developer.spotify.com/dashboard)
```
export CLIENT_ID=<client-id-value>
export CLIENT_SECRET=<client-secret-value>
```
7. Run the program:
```
node app.js
```
8. Browse to http://localhost:8888/
9. Enjoy

# Security Disclaimer
This is not meant to be a secure program. There are vulnerabilities associated with NodeJS and npm packages. Use this program on your own risk. Best security practices were not followed. Security best-practices were not followed when writing this code. Never leave your secret tokens in your own code. This code contains dummy tokens.
