import React, { useEffect } from "react";
// import { NavBar } from '../components/NavBar';
import { TopTenTracks } from "../components/TopTenTracks";
import { Footer } from "../components/Footer";
import { LyricsFinderSearch } from "../components/LyricsFinderSearch";
import "../css/Home.css"
import { useDispatch } from "react-redux";
import { getSpinnerStatus } from "../redux/lyricsSlice";
import { ClipLoader } from 'react-spinners';
import { useSelector } from "react-redux";
import { turnOnSpinner, fetchAsyncTracks, removeTopTenTracks } from "../redux/lyricsSlice";

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
            <ClipLoader color={"black"} loading={isLoading} size={150} />
            <TopTenTracks />
            <Footer position="stay_sticky"/>
        </div>
    );
}