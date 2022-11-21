import os
import SpotifyClient

def run():
	#morning_playlist = spotify_client.get_morning_tracks()
	#tracks_ids = [track['id'] for track in random_tracks]
	spotify_client = SpotifyClient.SpotifyClient(os.getenv('username'), os.getenv('clientid'), os.getenv('clientsecret'), os.getenv('redirect_uri'))
	spotify_client.get_oauth_token()
	

if __name__ == '__main__':
	run()
