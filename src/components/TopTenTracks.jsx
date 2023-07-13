import React from "react";
import { useSelector } from "react-redux";
import "../css/TopTenTracks.css"
import { getTopTenTracks } from "../redux/lyricsSlice";
import { TrackPreview } from "./TrackPreview";

export const TopTenTracks = () =>
{
    const topTenTracks = useSelector(getTopTenTracks);

    return (
        <div className="topTenTracks">
            { topTenTracks.map((track) => {return <TrackPreview data={track} key={track.id}/>}) }
        </div>
    );
}