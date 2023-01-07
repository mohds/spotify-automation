import json
import base64
import requests

class SpotifyClient(object):
	def __init__(self, username, clientID, clientSecret, redirectURI):
		self.username = username
		self.clientID = clientID
		self.clientSecret = clientSecret
		self.redirectURI = redirectURI

	def get_morning_tracks():

		url = f''
		
		response = requests.get(
				url, 
				headers={
						"Content-Type": "application/json",
						"Authorization": f"Bearer {self.api_key}"
					}
				)
		response_json = response.json()

		tracks = [track for track in response_json['tracks']['items']]

		print(f'Found {len(tracks)} from your serach')
		
		return tracks

	def get_devices():
		pass

	def get_sp(self):
		print(self.clientID)
		print(self.clientSecret)
		client_credentials_manager = SpotifyClientCredentials(client_id=self.clientID, client_secret=self.clientSecret)
		sp = spotipy.Spotify(client_credentials_manager = client_credentials_manager)
		return sp

	def play_morning(self):
		access_token = get_oauth_token()


	def get_oauth_token(self):

		url = f'https://accounts.spotify.com/api/token'
		basic_auth_token = f"{self.clientID}:{self.clientSecret}"
		basic_auth_token = base64.b64encode(basic_auth_token.encode("ascii"))
		basic_auth_token = basic_auth_token.decode('ascii')
		response = requests.post(
			url, 
			headers={
					"Content-Type": "application/x-www-form-urlencoded",
					"Authorization": f"Basic {basic_auth_token}" 
				},
			data={
				"grant_type": "client_credentials"
			}
			)
		response_json = response.json()
		print(response_json["access_token"])
		return response_json["access_token"]


