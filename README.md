# What's this app about?

This application acts as a consultable lyrics database. It consists of a Home page, where the user lands, which displays the most famous top 10 tracks in Italy at the moment, based on their lyrics' popularity
on Musixmatch. There is a 'Search' function in the navbar that lets the user search for specific tracks/albums/artists. Lastly, by clicking on a track card retrieved by the top 10 tracks function or by the 
search function, the user is redirected to the lyrics page for that specific track, which display some additional relevant information.


# Dependencies


This app was bootstrapped with create-react-app, so expect to use the usual npm commands to compile and run the project once downloaded.

There are of course some external JS libraries involved, the most important being "react-redux" (Redux for ReactJS), that manages the entirety of the global application state. It works as usual, aka the UI
components dispatch actions for generated events, that will eventually update the state in the store; Components are subscribed to the store by the use of Selectors and they will be notified for each relevant
change in the state, re-rendering if that's a slice of the state they're subscribed to. The Redux state is not persistent, so all data will be erased from it when the page is refreshed. Future updates are 
going to address this.

Another very important library used is 'react-router-dom' (React Router v6), which handles the entirety of the routing in the app. The landing page (Home.jsx component) is rendered at the URL "/", while the 
SearchResults component at "/search"; when the user makes a specific search, the library manipulates the URL, making the query string visible in the address. The third route involves the component TrackLyrics,
and it's rendered at "/track"; the query string is provided, and it's composed of two identifiers: "mxm_track_id=" and "mxm_commontrack_id". These parameters are necessary because the TrackLyrics component needs to 
fetch the lyrics from mxm API when rendering (and thus the API call needs to know the track ID ib mxm's DB) and the list of tracks of the relative album (the API needs to do a second call using the track's 
commontrackID). This is why the URI of a single TrackLyrics resource of the app is that intricate, while the search only involves one API call at a known URL. The last route is about the 404 NotFound (error).

The application makes the API calls to Spotify mainly to retrieve data regarding the album cover art of the tracks, since it's no more provided by Musixmatch. I chose to use some helper functions included in 
a 3rd party API, 'spotify-web-api-node', an open source-library that acts as a wrapper of the original Spotify API. The calls use the tokenized authentication, the validity of which is pretty short, and thus it seemed
sane to retrieve it through fetch()s each time the Spotify API needs to be called. The spotifyAPI object, core of the library, has a global scope in the Redux slice implementation.

The library 'react-spinners' was included to import ClipLoaders to inform the user visually when the API calls' Promises are in Pending state.




# Screenshots


As said, the landing page is "/"; the component Home.jsx is going to get rendered, and in the mounting phase it's going to retrieve the top 10 tracks in Italy by Musixmatch, as a sequence of TrackPreview track cards;
each card includes data fetched from both Musixmatch (track infos) and Spotify (album details), thanks to the 'external_ids : spotify_album_id' field of the Musixmatch's API response payload:


![Home_1920_1080](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/e607b1fa-3dc9-4b8e-bc39-22def0510426)


![Home_1920_1080_2](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/cbd92ef5-d759-42d6-9f70-231f0c7d5a3e)


In the navbar (actually, a Header) above, the user finds the search form to query Musixmatch's DB with a keyword, usually the desired track name, but the API conducts the search for artist names and album titles aswell.
The SearchResults component, rendered at "/search=q?...", renders TrackPreview cards as the results of the search, as well as a "Load more results" button to extend the search:


![Search_1920_1080](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/5c98e276-0489-4777-8012-5bc8db372533)


![Search_1920_1080_2](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/41d0dc19-ec17-493a-965c-37e5173a54d6)


When the user clicks on a TrackPreview card, either in the Home or in the SearchResults page, it gets routed to the TrackLyrics page, that is going to retrieve the track and album's data from the Redux store, since each
TrackCard dispatchs a Redux Action on the occurring of the onClick event, saving the track's and albums' data of the clicked track card. The data fetching made by the TrackLyrics component is about the selected track's
lyrics and its album tracklist, both of them from Musixmatch:


![Lyrics_full](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/c14110b3-1479-422e-9466-efa2ed65f7a7)


![Lyrics_Stretched](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/4f4f6de5-20c6-4ef8-ba83-074dba1bd73f)




# Responsive layout


Some responsive layout previews for all the pages:


## Home.jsx


![Home_SurfacePro7](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/4ac1d002-07c4-410d-9d37-7e37906fe0af)


![Home_SurfacePro7_2](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/ee988d0f-ce0a-496e-9283-65f68aa38afb)


![Home_370](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/5152333d-af2e-4bfa-9f85-e10f66cc4cab)


## SearchResults.jsx


![Search_NestHubMax](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/4ad4dd6c-5ee3-448e-b622-a9ae2c366603)


![Search_NestHubMax_2](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/126270af-1d65-4ede-b9c4-0c92c8c7baec)


## TrackLyrics.jsx


![Lyrics_more_stretched](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/64604bc9-55ac-47a6-8722-0c540edb23c8)


![Lyrics_iPhoneXR](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/5e9d7c90-56ec-4746-a3f0-9aedb196de8e)


![Lyrics_iPhoneXR_2](https://github.com/GianlucaDore/LyricsFinderApp/assets/51960987/368b6e7f-ca5b-4dbb-b105-f8ace62673e7)






## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
