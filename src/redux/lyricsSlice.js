import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { redirect } from 'react-router-dom';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyAPI = new SpotifyWebApi({
    clientId : "f8ff3bd286194f5cb43d8e0399b03fe2",
    clientSecret : "d4bc95700f894de28a78bd3972ea5360"
});

export const fetchAsyncTracks = createAsyncThunk('lyrics/fetchAsyncTracks',
    async () =>
    {
        const htmlquery = "chart.tracks.get?chart_name=top&page=1&page_size=10&country=it&f_has_lyrics=1"
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"

        /* Now we'll fetch the top 10 tracks chart for Italy from Musixmatch. */
        const response = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        });

        if (!response.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        
        const res = await response.json();

        const retrievedTracks = [];
        for (const t of res.message.body.track_list)
        {
            retrievedTracks.push({
                id : t.track.commontrack_id,
                lyrics_id : t.track.track_id,
                name : t.track.track_name,
                rating : t.track.track_rating,
                favorites : t.track.num_favourite,
                artist : t.track.artist_name,
                genre : (t.track.primary_genres.music_genre_list[0] ? (t.track.primary_genres.music_genre_list[0].music_genre.music_genre_name) : ("Unknown"))
            });
        }

        /* As of now, we're lacking the album covers. We have to resort to Spotify's APIs to get them: */
        const spotifyAPIToken = await fetchSpotifyAPIToken(); // Retrieve the needed token to call the Spotify API.
        const albumsArray = await fetchChartAlbumCovers(spotifyAPIToken, retrievedTracks);  // Call the Spotify API that returns a set of albums' infos, as well as their cover arts.

        return { retrievedTracks, albumsArray };
    }
);

/* API call to retrieve a valid Spotify token to make use of their API. */
async function fetchSpotifyAPIToken()
{
        const CLIENT_ID = "f8ff3bd286194f5cb43d8e0399b03fe2";
        const CLIENT_SECRET = "d4bc95700f894de28a78bd3972ea5360";

        const token = await fetch('https://accounts.spotify.com/api/token', {
            "method" : "POST",
            "headers" : {
                            'Content-Type' : 'application/x-www-form-urlencoded'
                        },
            "body" : 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        })
        .then(res => res.json());

        return token.access_token;
}

/* API call to retrieve the album cover for the tracks in homepage */
async function fetchChartAlbumCovers(spotifyAPIToken, tracksArray)
{
        const mXmapikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3";
        spotifyAPI.setAccessToken(spotifyAPIToken);

        const commontrackIDArray = []; // commontrack_id is the mXm payload field universal track identifier in their database.

        tracksArray.forEach(t => {
            commontrackIDArray.push(t.id);
        });

        /* We have quite a lot of Promises to handle. Let's save time and code by using Promise.all().
           We can pass to that function an array of Promises, that we're going to prepare now: */
        const trackPromises = commontrackIDArray.map((trackID) =>
            fetch(`https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=${trackID}&apikey=${mXmapikey}`)
            .then((res) => res.json())
            .then((res) =>
              fetch(`https://api.musixmatch.com/ws/1.1/album.get?album_id=${res.message.body.track.album_id}&apikey=${mXmapikey}`)
                .then((res) => res.json())
                 )   
        );

        // fetch()es above make the network requests, we have to wait for those Promises to resolve/reject before continuing. We await all of them:
        let globalResponse = await Promise.all(trackPromises).catch(err => {console.error("One or more promises when retrieving data from MusixMatch with Promise.all() were rejected: ", err)});  // At this point, we should have all the responses from the album_get API from Musixmatch.

        /* Curiously enough, even though there is no more the "album_cover_art" field, there is a field that returns the Spotify's album_id for that Musixmatch's album_id ! */
        /* We then proceed to fetch the album cover art from Spotify using the field spotify_album_id in the mXm response payload. */

        /* Just a note: we MUST handle the case in which a MusiXmatch track does NOT have a corresponding album ID on Spotify. */ 
        const retrievedAlbumsFromMxmNotFoundOnSpotify = [];
        const retrievedAlbumIdsArray = globalResponse.map((i) => {
                if (i.message.body.album.external_ids.spotify[0] !== undefined)  
                            return i.message.body.album.external_ids.spotify[0];
                else  // If the track fetched from mXm has not a corresponding Spotify album, we'll use the album infos provided by mXm, with a placeholder for the album cover.
                {
                    retrievedAlbumsFromMxmNotFoundOnSpotify.push({
                        album_name: i.message.body.album.album_name,
                        album_year: i.message.body.album.album_release_date.substring(0, 4),
                        album_cover: ["musixmatchDefaultAlbumLogo", "musixmatchDefaultAlbumLogo"]
                    });
                    return null; // We return a null array cell, that will be filled later with the data of the track not found on spotify.
                }
        });                                          

        /* This wrapper makes the API call to Spotify with the just retrieved Spotify album IDs (or null if absent). */
        const res = await spotifyAPI.getAlbums(retrievedAlbumIdsArray).then((data) => { return data.body }).catch(err => {console.error("There was a problem while retrieving album data from Spotify: " + err)});

        let i=0;
        let arrayAlbums = []; // Time to compose the array for the albums retrieved, with both data and album cover (or a placeholder if not found on Spotify).
        for (const a of res.albums) // res contains the results of the query to Spotify's album DB.
        {
            if (a !== null)
            {
                arrayAlbums.push({
                    album_spotify_id: a.id,
                    album_name: a.name,
                    album_year: a.release_date.substring(0,4),
                    album_type: a.album_type,
                    album_cover: [a.images[0].url, a.images[1].url]
                });
            }
                
            else  // If the wrapper spotifyAPI didn't find (.getAlbums() may have returned null values) the album infos on Spotify for the specified track, we'll assign the mXm album infos instead.
            {
                arrayAlbums.push(retrievedAlbumsFromMxmNotFoundOnSpotify[i]);
                i++;
            }
        }

        return arrayAlbums;

}

export const fetchAsyncSearchedTracks = createAsyncThunk('lyrics/fetchAsyncSearchedTracks',
    async ({word, page}) =>
    {
        /* SEARCHING FOR ${word} IN TRACKS' NAMES AND ARTISTS'. */

        /* We'll first make use of MusixMatch's API's search function. */
        const actualPage = page+1;
        const htmlquery = "track.search?q_track_artist=" + word + "&page_size=9&page=" + actualPage + "&s_track_rating=desc";
        const mXmapikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3";
        const response = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + '&apikey=' + mXmapikey), {
            "method" : 'GET',
            "headers" : {}    
        });

        if (!response.ok)
        {
            console.log("Call " + htmlquery.substring(0,27) + " not ok!");
            return(redirect("/notfound"));
        }

        const res = await response.json();

        /* mXm's search API should have given its response by now; we proceed to save the tracks' data
           that we need to display the TrackPreview cards. */
        const retrievedTracks = [];
        for (const t of res.message.body.track_list) // Parsing the response of the track.search function
        {
            retrievedTracks.push({
                id : t.track.commontrack_id,
                lyrics_id : t.track.track_id,
                name : t.track.track_name,
                rating : t.track.track_rating,
                favorites : t.track.num_favourite,
                artist : t.track.artist_name,
                genre : (t.track.primary_genres.music_genre_list[0] ? (t.track.primary_genres.music_genre_list[0].music_genre.music_genre_name) : ("Unknown"))
            });
        }

        /* Time to get the searched tracks' album covers from Spotify. */
        const spotifyAPIToken = await fetchSpotifyAPIToken(); // Retrieve the needed token to call the Spotify API.
        const albumsArray = await fetchChartAlbumCovers(spotifyAPIToken, retrievedTracks)
            .catch(err => console.error("Promise fetchChartAlbumCovers was rejected: " + err));  // Call the Spotify API that returns a set of albums' infos, as well as their cover arts.


        return { retrievedTracks, albumsArray, word, actualPage };
    }
)

export const fetchAsyncLyrics = createAsyncThunk('lyrics/fetchAsyncLyrics',
    async ({mxm_track_id, mxm_commontrack_id}) =>
    {
        /* Situation: given the complex URL associated to TrackLyrics due to the fact that more API calls are needed to fetch the data for the page,
           we'll assume that such page will always be generated by the user's click on a TrackPreview card. Since the TrackPreview card
           already contains most of the data needed to properly display the TrackLyrics component, we'll proceed to fetch only the 
           missing data for the page, which is the track's lyrics body and the information regarding the album's tracklist. It's
           useless to fetch them in the "parent" (in the 'routing tree') component TrackPreview, since they wouldn't be displayed there
           and thus they would be of no use. */

        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3";

        /* So, let's start: we are going to retrieve the lyrics body for the selected track from MusiXmatch. */
        let htmlquery = "track.lyrics.get?track_id=";
        const response = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + mxm_track_id + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        });

        if (!response.ok)
        {
            console.log('Call ' + htmlquery + " response not ok!");
            return(redirect("/notfound"));
        }
        
        const res = await response.json();

        let retrievedLyrics = res.message.body.lyrics.lyrics_body;  // Retrieving lyrics' body.
        if (retrievedLyrics.includes("*******"))
        {
            retrievedLyrics = retrievedLyrics.split("*******")[0];  // Let's get rid of the disclaimer for now; we'll include it manually in a different style/font.
        }
        
        /*  In order to make a quick link to the lyrics page for each single track in the track list, it's better to retrieve such tracklist from Musixmatch, 
            so we can retrieve aswell each track_id and we can link the user to the lyrics of each specific track in the list with a simple Link element. 
            We have to make two API calls to Musixmatch:
            1) track.get , getting track details by commontrack_id to retrieve the mXm album_id;
            2) album.tracks.get , getting album's tracklist by mXm album_id . */

        /* Let's start by fetching the track details and then extrapolating the album_id of mXm : */
        htmlquery = "track.get?commontrack_id=";
        const response2 = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + mxm_commontrack_id + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        });

        if (!response2.ok)
        {
            console.log('Call ' + htmlquery + " response not ok!");
            return(redirect("/notfound"));
        }

        const res2 = await response2.json(); 

        const mxm_album_id = res2.message.body.track.album_id;

        /* Now that we have the mXm album_id , we can fetch the tracklist from mXm : */
        htmlquery = "album.tracks.get?album_id=";
        const response3 = await fetch(encodeURI('https://api.musixmatch.com/ws/1.1/' + htmlquery + mxm_album_id + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        });

        if (!response3.ok)
        {
            console.log('Call ' + htmlquery + " response not ok!");
            return(redirect("/notfound"));
        }

        const res3 = await response3.json();
        const trackList = res3.message.body.track_list;  // This should be an array.

        /* Now we fill the tracklist array with the data we need: */
        const albumTrackList = [];
        for (const t of trackList)
        {
            const trackListElementObj = {
                track_name: t.track.track_name,
                track_likes: t.track.num_favourite,
                track_rating: t.track.track_rating,
                track_artist: t.track.artist_name,
                track_genre: t.track.primary_genres.music_genre_list[0].music_genre.music_genre_name,
                mxm_track_id: t.track.track_id,
                mxm_commontrack_id: t.track.commontrack_id
            };
        
            albumTrackList.push(trackListElementObj);
        }    

        return ( { trackLyrics: retrievedLyrics, trackList: albumTrackList });
    }
)


const initialState =
{
    topTenTracks: [],
    currentLyrics: {
        currentTrackLyrics: null,
        currentTrackData: {
            currentTrackName: null,
            currentTrackArtist: null,
            currentTrackGenre: null,
            currentTrackLikes: 0,
            currentTrackRating: 0
        },
        currentTrackAlbum: {
            currentAlbumName: null,
            currentAlbumType: null,
            currentAlbumYear: null,
            currentAlbumCover: null,
            currentAlbumTrackList: []
        }
    },
    searchResults: {
        tracksMatchingSearch: [],
        searchedString: "",
        pageNumber: 0,
    },
    isLoading: false
}


export const lyricsSlice = createSlice({
    name: 'lyrics',
    initialState,
    reducers: {
        turnOnSpinner: (state) => {
            state.isLoading = true;
        },
        turnOffSpinner: (state) => {
            state.isLoading = false;
        },
        setTrackDataForTrackLyricsComponent: (state, res) => {
            state.currentLyrics.currentTrackData = {
                currentTrackName: res.payload.track_name,
                currentTrackArtist: res.payload.track_artist,
                currentTrackGenre: res.payload.track_genre,
                currentTrackLikes: res.payload.track_likes,
                currentTrackRating: res.payload.track_rating,
            }
        },
        setAlbumDataForTrackLyricsComponent: (state, res) => {
            state.currentLyrics.currentTrackAlbum = {
                currentAlbumName: res.payload.album_name,
                currentAlbumType: res.payload.album_type,
                currentAlbumYear: res.payload.album_year,
                currentAlbumCover: res.payload.album_cover,
                currentAlbumTrackList: []
            }
        },
        removeTopTenTracks: (state) => {
            state.topTenTracks = [];
        },
        removeSearchedTracks: (state) => {
            state.searchResults = {
                tracksMatchingSearch: [],
                searchedString: "",
                pageNumber: 0
            };
        },
        removeLyrics: (state) => {
            state.currentLyrics = null;
        }
    },
    extraReducers: {
        [fetchAsyncTracks.pending] : () => {
            console.log("Promise fetchAsyncTracks is pending.");
        },
        [fetchAsyncTracks.rejected] : () => {
            console.log("Promise fetchAsyncTracks was rejected.");
        },
        [fetchAsyncTracks.fulfilled] : (state, res) => {
            console.log("Top 10 tracks were successfully retrieved.");

            const topTenTracksAndAlbums = [];
            for (let i=0; i<res.payload.retrievedTracks.length; i++)
            {
                let obj = {data: null, album: null};
                if (res.payload.retrievedTracks[i] === (null || undefined ))
                    break;
                if (res.payload.albumsArray[i] === (null || undefined ))
                    break;
                else
                {
                    obj.data = res.payload.retrievedTracks[i];
                    obj.album = res.payload.albumsArray[i];
                    topTenTracksAndAlbums.push(obj);
                }
            }

            return ({...state, isLoading: false, topTenTracks: topTenTracksAndAlbums});
        },
        [fetchAsyncSearchedTracks.pending] : () => {
            console.log("Promise fetchAsyncSearchedTracks is pending.");
        },
        [fetchAsyncSearchedTracks.rejected] : (_, action) => {
            console.log("Promise fetchAsyncSearchedTracks was rejected: " + action.payload);
        },
        [fetchAsyncSearchedTracks.fulfilled] : (state, res) => {
            console.log("Search results were successfully retrieved.");

            /* Setting up the new state object fields (2/3). */
            let word = res.payload.word;
            let actualPage = res.payload.actualPage;

            /* Setting up the new state object fields (3/3). */
            let tracksMatchingSearch = []
            if (actualPage > 1) 
                { tracksMatchingSearch = [...state.searchResults.tracksMatchingSearch]; }

            for (let i=0; i<res.payload.retrievedTracks.length; i++)
            {
                let obj = {data: null, album: null};
                obj.data = res.payload.retrievedTracks[i];
                obj.album = res.payload.albumsArray[i];
                tracksMatchingSearch.push(obj);
            }

            /* Creating a new state object to update with a different ref as usual in Redux. */
            const searchResults = {
                tracksMatchingSearch: tracksMatchingSearch,
                searchedString: word,
                pageNumber: actualPage
            };

            return ({...state, isLoading: false, searchResults: searchResults});
        },
        [fetchAsyncLyrics.pending] : () => {
            console.log("Promise fetchAsyncLyrics is pending.");
        },
        [fetchAsyncLyrics.rejected] : (_, action) => {
            console.error("Promise fetchAsyncLyrics was rejected: " + action.payload);
        },
        [fetchAsyncLyrics.fulfilled] : (state, res) => {
            console.log("Requested track lyrics were successfully retrieved.");

            const trackLyrics = res.payload.trackLyrics;
            const trackList = res.payload.trackList;

            /* The fields currentTrackData and currentTrackAlbum will be filled by another reducer invoked by different actions generated in the TrackPreview component, since when the user clicks on the TrackPreview that he wants to display the lyrics of,
               the card itself already contains all the track data. To spare another fetch for data that we already have got from the step before, we make the button of the TrackPreview
               card dispatch an action that inserts the trackData in the store for the TrackPreview card clicked on.
               So, we now only update the Object currentLyrics partially, with what we've just retrieved that is missing in the state,
               aka the lyrics body itself and the trackList : */
            return ({...state, isLoading: false, currentLyrics: {...state.currentLyrics, currentTrackLyrics: trackLyrics, currentTrackAlbum: {...state.currentLyrics.currentTrackAlbum, currentAlbumTrackList: trackList} }}); 
        }
    }
});

export const getTopTenTracks = (state) => state.lyrics.topTenTracks;
export const getSpinnerStatus = (state) => state.lyrics.isLoading;
export const getSearchResults = (state) => state.lyrics.searchResults;
export const getTrackLyrics = (state) => state.lyrics.currentLyrics;

export const { turnOnSpinner, turnOffSpinner, setTrackDataForTrackLyricsComponent, setAlbumDataForTrackLyricsComponent, removeTopTenTracks, removeSearchedTracks, removeLyrics } = lyricsSlice.actions;
export default lyricsSlice.reducer;