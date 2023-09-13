import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchAsyncLyrics, getSpinnerStatus, getTrackLyrics, turnOnSpinner, removeLyrics } from "../redux/lyricsSlice";
import { Footer } from "../components/Footer";
import { ClipLoader } from 'react-spinners';

export const TrackLyrics = () =>
{
    const [urlSearchParams, _] = useSearchParams();

    const dispatch= useDispatch();

    const isLoading = useSelector(getSpinnerStatus);
    const trackLyrics = useSelector(getTrackLyrics);

    useEffect(() => {
        
        dispatch(turnOnSpinner());

        dispatch(fetchAsyncLyrics({mxm_track_id: urlSearchParams.get("mxm_track_id"), mxm_commontrack_id: urlSearchParams.get("mxm_commontrack_id"), spotify_album_id: urlSearchParams.get("spfy_album_id")}));

        return () => { dispatch(removeLyrics()); } // Clean-up function.

    }, [dispatch, urlSearchParams]);

    return (
        <div className="tracklyrics">
            {!!isLoading ? null : <p className="track_lyrics">{trackLyrics.currentTrackLyrics}</p>}
            <ClipLoader color={'black'} loading={isLoading} size={150} />
            {!!isLoading ? <Footer position="stay_fixed" /> : <Footer position="stay_sticky" />}
        </div>
    );
}