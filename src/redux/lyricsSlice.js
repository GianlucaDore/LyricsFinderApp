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
        /* We then proceed to fetch the album cover art from Spotify using such field in the mXm response payload. */

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
                        album_cover: "musixmatchDefaultAlbumLogo",
                    });
                    return null;
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
                    album_name: a.name,
                    album_year: a.release_date.substring(0,4),
                    album_cover: a.images[1].url
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
        /* SEARCHING FOR SPECIFIC TRACKS */

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
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }

        const res = await response.json();

        const retrievedTracks = [];
        for (const t of res.message.body.track_list) // Parsing the response of the track.search function
        {
            retrievedTracks.push({
                id : t.track.commontrack_id,
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
    async (url) =>
    {
        const htmlquery = "track.lyrics.get?track_id="
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"
        const response = await fetch(encodeURI('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/' + htmlquery + url + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {}
        });

        if (!response.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        else
            return response.json();
    }
)


const initialState =
{
    topTenTracks: [],
    currentLyrics: null,
    tracksMatchingSearch: [],
    searchedString: "",
    pageNumber: 0,
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
        removeTopTenTracks: (state) => {
            state.topTenTracks = [];
        },
        removeTracksMatchingSearch: (state) => {
            state.tracksMatchingSearch = [];
        },
        resetPageNumber: (state) => {
            state.pageNumber = 0;
        },
        resetSearchedString: (state) => {
            state.searchedString = "";
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

            let word = res.payload.word;
            let actualPage = res.payload.actualPage;

            let searchResults = []
            if (actualPage > 1) 
                { searchResults = [...state.tracksMatchingSearch]; }

            for (let i=0; i<res.payload.retrievedTracks.length; i++)
            {
                let obj = {data: null, album: null};
                obj.data = res.payload.retrievedTracks[i];
                obj.album = res.payload.albumsArray[i];
                searchResults.push(obj);
            }

            return ({...state, isLoading: false, searchedString: word, pageNumber: actualPage, tracksMatchingSearch: searchResults});
        },
        [fetchAsyncLyrics.pending] : () => {
            console.log("Promise fetchAsyncLyrics is pending.");
        },
        [fetchAsyncLyrics.rejected] : () => {
            console.log("Promise fetchAsyncLyrics was rejected.");
        },
        [fetchAsyncLyrics.fulfilled] : (state, res) => {
            console.log("Requested track lyrics were successfully retrieved.");
            const retrievedLyrics = {'lyrics' : null};
            /* We now explore the response */
            retrievedLyrics.lyrics = res.payload.message.body.lyrics.lyrics_body;

            return ({...state, isLoading: false, currentLyrics: retrievedLyrics});
        }
    }
});

export const getTopTenTracks = (state) => state.lyrics.topTenTracks;
export const getSpinnerStatus = (state) => state.lyrics.isLoading;
export const getSearchResults = (state) => state.lyrics.tracksMatchingSearch;
export const getSearchedString = (state) => state.lyrics.searchedString;
export const getPageNumber = (state) => state.lyrics.pageNumber;
export const getTrackLyrics = (state) => state.lyrics.currentLyrics;

export const { turnOnSpinner, turnOffSpinner, removeTopTenTracks, removeTracksMatchingSearch, resetPageNumber, resetSearchedString, removeLyrics } = lyricsSlice.actions;
export default lyricsSlice.reducer;