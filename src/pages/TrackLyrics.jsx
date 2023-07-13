import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { turnOnSpinner } from "../redux/lyricsSlice";

export const TrackLyrics = () =>
{
    const urlParams = useParams();

    const navigate = useNavigate();

    const dispatch= useDispatch();

    useEffect(() => {
        
        dispatch(turnOnSpinner());

        // dispatch(retrieveTrackLyrics(urlParams.id));

        /* return () => {
            dispatch(removeTrackLyrics());
        } */

    }, [dispatch])

    return (
        <div className="TrackLyrics">


        </div>
    );
}