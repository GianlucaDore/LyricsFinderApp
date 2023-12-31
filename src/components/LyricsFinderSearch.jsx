import React from "react";
import { useState } from "react";
import "../css/LyricsFinderSearch.css"
import { useNavigate } from "react-router-dom";
import { removeSearchedTracks } from "../redux/lyricsSlice";
import { useDispatch } from "react-redux";


export const LyricsFinderSearch = () =>
{
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useState("");

    const dispatch = useDispatch();

    return (
        <div className="lyricsfindersearch">
            <h1 className="lyricsfinder_header">LyricsFinder to find your favorite lyrics!</h1>
            <form className="search_lyrics_form" onSubmit={(event) => {event.preventDefault(); dispatch(removeSearchedTracks()); navigate("/search?q=" + event.target[0].value)}}>
                <input className="search_lyrics_input" name="search_params" type="text" placeholder="Search a specific track..." value={searchParams} onChange={e => setSearchParams(e.target.value)} />
                <button className="search_lyrics_button" type="submit">Go!</button>
            </form>
        </div>
    );
}