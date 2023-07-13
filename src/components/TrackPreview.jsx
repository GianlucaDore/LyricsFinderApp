import React from "react";

export const TrackPreview = (props) =>
{
    return (
        <div className="track_preview">
            <h5 className="track_preview_name">{props.data.name}</h5>
            <h5 className="track_preview_artist">{props.data.artist}</h5>
            <h6 className="track_preview_genre">{props.data.genre}</h6>
            <h6 className="track_preview_favorites">{props.data.favorites}</h6>
            <h6 className="track_preview_rating">{props.data.rating}</h6>
            <h6 className="track_preview_id">{props.data.id}</h6>
        </div>
    );
}