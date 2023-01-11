/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const schedule = require('node-schedule');


var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

const config = require('config');
var morning_hour = config.get('time-period.morning.hour');
var morning_playlist_name = config.get('time-period.morning.playlist-name');
var evening_hour = config.get('time-period.evening.hour');
var evening_playlist_name = config.get('time-period.evening.playlist-name');
var night_hour = config.get('time-period.night.hour');
var night_playlist_name = config.get('time-period.night.playlist-name');
var player_device_name = config.get('device-name');
var player_device_type = config.get('device-type');

//var redirect_uri = 'http://localhost:8888/autoplay'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state playlist-read-private';
  //var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res, iteration) {
  
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        mainloop(options, access_token);

        // we can also pass the token to the browser to make requests from there
        //res.redirect('/#' +
          //querystring.stringify({
          //  access_token: access_token,
          //  refresh_token: refresh_token
          //}));
      } else {
        res.redirect('/#' +
          querystring.stringify({
           error: 'invalid_token'
          }));
      }
    });
  }
});

function mainloop(options, access_token) {
    setTimeout(() => {
   
        request.get(options, function(error, response, body) {

            var current_time = new Date();
            var current_hour = current_time.getHours();
             
            console.log("Program is running...");
            console.log("Morning hour: " + morning_hour);
            console.log("Evening hour: " + evening_hour);
	        console.log("Night hour: " + night_hour);
            console.log("Current hour: " + current_hour);

            console.log("Device name to play on: " + player_device_name);
            console.log("Device type to play on: " + player_device_type);

            // debugging
            //console.log(body);

            // get player state
            var is_playing = false;
            var playlist_playing = '';
            options = {
              url: 'https://api.spotify.com/v1/me/player',
              headers: { 'Authorization': 'Bearer ' + access_token },
              json: true,
            };
            request.get(options, function(error, response, body) {
                if(body != undefined) {
                    //console.log("Player state:");
                    //console.log(body);
                    is_playing = body.is_playing;
                    console.log("Is playing: " + is_playing);
                    if(is_playing) {
                        playlist_playing = body.context.uri;
                        console.log("Playlist playing: " + playlist_playing);
                    }
                }

                options = {
                  url: 'https://api.spotify.com/v1/me/playlists',
                  headers: { 'Authorization': 'Bearer ' + access_token },
                  json: true,
                };
                //console.log(options)
                // use the access token to access the Spotify Web API

                // get playlists
                request.get(options, function(error, response, body) {

                    // debugging
                    //console.log("Playlists:")
                    //console.log(body);

                    playlists = body.items;
                    var evening_playlist_id = "";
                    var morning_playlist_id = "";
                    var night_playlist_id = "";
                    if(playlists.length > 0) {
                        for(var i = 0 ; i < playlists.length; i++) {
                            if(playlists[i].name == evening_playlist_name) {
                                evening_playlist_id = playlists[i].uri;
                                console.log("Evening playlist: " + evening_playlist_id);
                            }
                            else if(playlists[i].name == night_playlist_name) {
                                night_playlist_id = playlists[i].uri;
                                console.log("Night playlist: " + night_playlist_id);
                            }
                            else if(playlists[i].name == morning_playlist_name){
                                morning_playlist_id = playlists[i].uri;
                                console.log("Morning playlist: " + morning_playlist_id);
                            }
                        }

                        var playlist_to_play = "";
                        if(current_hour >= morning_hour && current_hour < evening_hour) {
                            playlist_to_play = morning_playlist_id;
                            console.log("Current time period: Morning");
                        }
                        else if(current_hour >= evening_hour && current_hour < night_hour){
                            playlist_to_play = evening_playlist_id;
                            console.log("Current time period: Evening");
                        }
                        else {
                            playlist_to_play = night_playlist_id;
                            console.log("Current time period: Night");
                        }

                        // get devices
                        var device_id = ''
                        var options = {
                              url: 'https://api.spotify.com/v1/me/player/devices',
                              headers: { 'Authorization': 'Bearer ' + access_token },
                              json: true
                        };
                        request.get(options, function(error, response, body) {
                            //console.log("Devices:");
                            //console.log(body);

                            if(typeof body.devices === 'undefined') {
                                console.log(body);
                            }
                            else if(body.devices.length > 0) {
                                device_id = ""

                                for(var i = 0; i < body.devices.length; i++) {
                                    if(body.devices[i].name === player_device_name && body.devices[i].type === player_device_type) {
                                        device_id = body.devices[i].id;
                                    }
                                }
                                console.log("Device ID: " + device_id);
                                console.log("Playlist ID: " + playlist_to_play);
                                var options = {
                                      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
                                      headers: { 'Authorization': 'Bearer ' + access_token },
                                      json: true,
                                      body: {
                                          "context_uri": playlist_to_play,
                                          "position_ms": 0
                                      }
                                };

                                if(!is_playing || playlist_playing != playlist_to_play) {
                                    // play music
                                    request.put(options, function(error, response, body) {
                                        console.log("Playing...");
                                        console.log(body);
                                    });
                                }
                            }
                            else {
                                console.log("No device found, make sure that a device is running spotify");
                            }
                        });
                    }
                    else {
                        console.log("No playlists found");
                    }
                });
            });

        });

    console.log("");
    mainloop(options, access_token);
    },10000)
}

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
