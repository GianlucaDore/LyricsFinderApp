import React from "react";
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'
import { getSpinnerStatus, turnOnSpinner, getSearchResults, fetchAsyncSearchedTracks, removeSearchedTracks } from "../redux/lyricsSlice";
import { useDispatch, useSelector } from "react-redux";
import { TracksMatchingSearch } from "../components/TracksMatchingSearch";
import { LyricsFinderSearch } from "../components/LyricsFinderSearch";
import { ClipLoader } from 'react-spinners';
import { Footer } from "../components/Footer";

export const SearchResults = () =>
{
    const [searchParams, setSearchParams] = useSearchParams(); // Returns the current URL's search params and a function to update the query string in the URL.

    const isLoading = useSelector(getSpinnerStatus);
    const searchResults = useSelector(getSearchResults);

    const dispatch = useDispatch();

    useEffect(() => {

        dispatch(turnOnSpinner());

        const q = searchParams.get('q'); // Words to search for are written in the URL search query.

        dispatch(fetchAsyncSearchedTracks({word: q, page: searchResults.pageNumber})); 

        return () => { dispatch(removeSearchedTracks()); } // Clean up search results.

    }, [dispatch, searchParams]);


    return (
        <div id="Home">
            <LyricsFinderSearch />
            {!!isLoading ? null : <TracksMatchingSearch />}
            {!!isLoading ? null: <button className="load_more_results_button" onClick={(event) => {event.preventDefault(); dispatch(fetchAsyncSearchedTracks({ word: searchParams.get('q'), page: searchResults.pageNumber+1 }))}}>Load more results</button>}
            <ClipLoader color={"black"} loading={isLoading} size={150} />
            {!!isLoading ? <Footer position="stay_fixed" /> : <Footer position="stay_sticky" />}
        </div>
    )
}