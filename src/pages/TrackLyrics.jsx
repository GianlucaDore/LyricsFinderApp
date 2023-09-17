import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchAsyncLyrics, getSpinnerStatus, getTrackLyrics, turnOnSpinner } from "../redux/lyricsSlice";
import { Footer } from "../components/Footer";
import { ClipLoader } from 'react-spinners';
import { LyricsAndTrackData } from "../components/LyricsAndTrackData";
import { LyricsFinderSearch } from "../components/LyricsFinderSearch";
import '../css/TrackLyrics.css';

export const TrackLyrics = () =>
{
    const [urlSearchParams, ] = useSearchParams();

    const dispatch= useDispatch();

    const isLoading = useSelector(getSpinnerStatus);
    const trackLyrics = useSelector(getTrackLyrics);

    useEffect(() => {
        
        dispatch(turnOnSpinner());

        dispatch(fetchAsyncLyrics({mxm_track_id: urlSearchParams.get("mxm_track_id"), mxm_commontrack_id: urlSearchParams.get("mxm_commontrack_id")}));

    }, [dispatch, urlSearchParams]);

    return (
        <div className="tracklyrics">
            <LyricsFinderSearch />
            <ClipLoader color={'black'} loading={isLoading} size={150} />
            {!!isLoading ? null : <LyricsAndTrackData lyrics={trackLyrics.currentTrackLyrics} trackData={trackLyrics.currentTrackData} albumData={trackLyrics.currentTrackAlbum} />}
            {!!isLoading ? <Footer position="stay_fixed" /> : <Footer position="stay_sticky" />}
        </div>
    );
}