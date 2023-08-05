import React from "react";
import "../css/LyricsFinderSearch.css"

export const LyricsFinderSearch = () =>
{
    return (
        <div className="lyricsfindersearch">
            <h1 className="lyricsfinder_header">LyricsFinder to find your favorite lyrics!</h1>
            <form className="search_lyrics_form">
                <input className="search_lyrics_input" type="text" placeholder="Search a specific track..." />
                <button className="search_lyrics_button" type="submit">Go!</button>
            </form>
        </div>
    );
}