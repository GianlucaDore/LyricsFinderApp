import React, { useEffect } from "react";
// import { NavBar } from '../components/NavBar';
import { TopTenTracks } from "../components/TopTenTracks";
import { Footer } from "../components/Footer";
import { LyricsFinderSearch } from "../components/LyricsFinderSearch";
import "../css/Home.css"
import { useDispatch } from "react-redux";
import { ClipLoader } from 'react-spinners';
import { useSelector } from "react-redux";
import { getSpinnerStatus, turnOnSpinner, fetchAsyncTracks, removeTopTenTracks } from "../redux/lyricsSlice";

export const Home = () =>
{
    const isLoading = useSelector(getSpinnerStatus);

    const dispatch = useDispatch();
    
    useEffect(() => {

        dispatch(turnOnSpinner());
        
        dispatch(fetchAsyncTracks());

        return () =>
        {
            dispatch(removeTopTenTracks());
        }

    }, [dispatch]);


    return (
        <div id="Home">
            <LyricsFinderSearch />
            {!!isLoading ? null : <TopTenTracks />}
            <ClipLoader color={"black"} loading={isLoading} size={150} />
            {!!isLoading ? <Footer position="stay_fixed" /> : <Footer position="stay_sticky" />}
        </div>
    );
}