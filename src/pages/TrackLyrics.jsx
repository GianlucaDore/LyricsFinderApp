import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAsyncLyrics, getSpinnerStatus, getTrackLyrics, turnOnSpinner } from "../redux/lyricsSlice";
import { Footer } from "../components/Footer";
import { ClipLoader } from 'react-spinners';

export const TrackLyrics = () =>
{
    const urlParams = useParams();

    const navigate = useNavigate();

    const dispatch= useDispatch();

    const isLoading = useSelector(getSpinnerStatus);
    const trackLyrics = useSelector(getTrackLyrics);

    useEffect(() => {
        
        dispatch(turnOnSpinner());

        dispatch(fetchAsyncLyrics(urlParams.id));

        /* return () => {
            dispatch(removeTrackLyrics());
        } */

    }, [dispatch])

    return (
        <div className="tracklyrics">
            {!!isLoading} ? {<ClipLoader color={'black'} loader={isLoading} size={150} />} : {<p className="track_lyrics">{trackLyrics.lyrics}</p>}
            <Footer position="stay_sticky" />
        </div>
    );
}