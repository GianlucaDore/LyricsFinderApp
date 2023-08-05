import React from "react";
import hearticon from "../images/heart_icon.png";
import staricon from "../images/star_icon.png";
import musixmatchicon from "../images/Musixmatch_icon.svg";

export const TrackPreview = (props) =>
{
    return (
        <div className="track_preview">
            <div className="track_preview_topline">
                <h3 className="track_preview_name">{props.data.name}</h3>
                <h5 className="track_preview_artist">{props.data.artist}</h5>
            </div>
            
            <p className="track_preview_genre">Genre: <span className="genre_label">{props.data.genre}</span></p>
            <h6 className="track_preview_album">Album: </h6>
            <img className="album_icon" alt="album_cover" src={musixmatchicon} />
            <div className="track_preview_bottomline">
                <div>
                    <img className="heart_icon" src={hearticon} alt="Favorites" />
                    {props.data.favorites}
                </div>
                <div>
                    <img className="star_icon" src={staricon} alt="Rating" />
                        {props.data.rating}
                </div>
                <div className="track_id">
                    <h6>#{props.data.id}</h6>
                </div>
            </div>
        </div>
    );
}