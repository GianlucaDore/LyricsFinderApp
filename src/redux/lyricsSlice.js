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


const initialState =
{
    topTenTracks: [],
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
                    genre : t.track.primary_genres.music_genre_list[0].music_genre.music_genre_name
                });
            }
            return ({...state, isLoading: false, topTenTracks: retrievedTracks});
        }
    }
});

export const getTopTenTracks = (state) => state.lyrics.topTenTracks;
export const getSpinnerStatus = (state) => state.lyrics.isLoading;

export const { turnOnSpinner, turnOffSpinner, removeTopTenTracks } = lyricsSlice.actions;
export default lyricsSlice.reducer;