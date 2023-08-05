import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { redirect } from 'react-router-dom';


export const fetchAsyncTracks = createAsyncThunk('lyrics/fetchAsyncTracks',
    async () =>
    {
        const htmlquery = "chart.tracks.get?chart_name=top&page=1&page_size=10&country=it&f_has_lyrics=1"
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"
        const response = await fetch(encodeURI('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/' + htmlquery + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {
                            'Cache-Control' : "no-cache",
                            'Content-Type' : "application/json"
                        }
        });

        if (!response.ok)
        {
            console.log("Call response not ok!");
            return(redirect("/notfound"));
        }
        else
            return response.json();
    }
);

/* API call to retrieve the album cover for the homepage -- ACTUALLY BUGGED ON MUSIXMATCH'S SIDE */
export const fetchChartAlbumCovers = createAsyncThunk('lyrics/fetchChartAlbumCovers',
    async (trackIDArray) =>
    {
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"
        let globalResponse = await Promise.all([
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[0] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[1] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[2] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[3] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[4] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[5] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[6] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[7] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[8] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey)),
            fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=' + trackIDArray[9] + '&apikey=' + apikey).json()
                .then((res) => fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.get?album_id=' + res.message.body.track.album_id + '&apikey=' + apikey))
        ]);

        const blobsArray = await globalResponse.then(async (res) => {

            let response = await Promise.all([
                fetch(res[0].message.body.album.album_coverart_100x100).blob(),
                fetch(res[1].message.body.album.album_coverart_100x100).blob(),
                fetch(res[2].message.body.album.album_coverart_100x100).blob(),
                fetch(res[3].message.body.album.album_coverart_100x100).blob(),
                fetch(res[4].message.body.album.album_coverart_100x100).blob(),
                fetch(res[5].message.body.album.album_coverart_100x100).blob(),
                fetch(res[6].message.body.album.album_coverart_100x100).blob(),
                fetch(res[7].message.body.album.album_coverart_100x100).blob(),
                fetch(res[8].message.body.album.album_coverart_100x100).blob(),
                fetch(res[9].message.body.album.album_coverart_100x100).blob()
            ]);

            return response;

            /* 
            const chartCovers = [];
            for (b of res)
            {
                const coverArt = await fetch(b.message.body.album.album_coverart_100x100).blob();
                chartCovers.push(coverArt);
            }  */
        });

        return blobsArray;
    }
);

export const fetchAsyncLyrics = createAsyncThunk('lyrics/fetchAsyncLyrics',
    async (url) =>
    {
        const htmlquery = "track.lyrics.get?track_id="
        const apikey = "4c1ba2ca3c12e38d88e4b8d38b05f5d3"
        const response = await fetch(encodeURI('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/' + htmlquery + url + '&apikey=' + apikey), {
            "method" : 'GET',
            "headers" : {
                            'Cache-Control' : "no-cache",
                            'Content-Type' : "application/json"
                        }
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
            const retrievedTracks = [];
            /* We now explore the response */ 
            for (const t of res.payload.message.body.track_list)
            {
                retrievedTracks.push({
                    id : t.track.track_id,
                    name : t.track.track_name,
                    rating : t.track.track_rating,
                    favorites : t.track.num_favourite,
                    artist : t.track.artist_name,
                    genre : (t.track.primary_genres.music_genre_list[0] ? (t.track.primary_genres.music_genre_list[0].music_genre.music_genre_name) : ("Unknown"))
                });
            }
            return ({...state, isLoading: false, topTenTracks: retrievedTracks});
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
export const getTrackLyrics = (state) => state.lyrics.currentLyrics;

export const { turnOnSpinner, turnOffSpinner, removeTopTenTracks } = lyricsSlice.actions;
export default lyricsSlice.reducer;