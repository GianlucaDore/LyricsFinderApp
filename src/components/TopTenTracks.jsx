import React from "react";
import { useSelector } from "react-redux";
import "../css/TopTenTracks.css"
import { getTopTenTracks } from "../redux/lyricsSlice";
import { TrackPreview } from "./TrackPreview";

export const TopTenTracks = () =>
{
    const topTenTracks = useSelector(getTopTenTracks);
    
    return (
        <>
            <h1 id="top10tracksitalyheader">Top 10 popular tracks in Italy</h1>
            <div className="toptentracks">
                { topTenTracks.map((track) => {return <TrackPreview data={track.data} key={track.data.id} album={track.album}/>}) }
            </div>
        </>  
    );
}
