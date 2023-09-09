import React from 'react';
import { TrackPreview } from './TrackPreview';
import { useSelector } from 'react-redux';
import { getSearchResults, getSearchedString } from '../redux/lyricsSlice';


export const TracksMatchingSearch = () =>
{
    const searchResults = useSelector(getSearchResults);

    const searchInput = useSelector(getSearchedString);

    return (
        <>
          <h1 id="search_results_header">Search results for "{searchInput}":</h1>
            <div className="searchresults">
                {!!searchResults.length ? 
                    (searchResults.map((track) => {return <TrackPreview data={track.data} key={track.data.id} album={track.album}/> }))
                    : (<p>No results for your search.</p>) }
            </div>
        </>  
    );
}