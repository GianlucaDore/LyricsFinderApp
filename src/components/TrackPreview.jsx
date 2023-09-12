import React from "react";
import hearticon from "../images/heart_icon.png";
import staricon from "../images/star_icon.png";
// import musixmatchicon from "../images/Musixmatch_icon.svg";
import musixmatchDefaultAlbumCover from '../images/MusiXmatchLogo_WhiteBck_RedM.png';

export const TrackPreview = (props) =>
{
    return (
        <div className="track_preview">
            <div className="track_preview_topline">
                <h3 className="track_preview_name">{props.data.name}</h3>
                <h5 className="track_preview_artist">{props.data.artist}</h5>
            </div>
            
            <h6 className="track_preview_genre">Genre: <span className="genre_label">{props.data.genre}</span></h6>
            <h6 className="track_preview_album">Album: {props.album.album_name} [{props.album.album_year}]</h6>
            <img className="album_icon" alt="album_cover" src={props.album.album_cover === "musixmatchDefaultAlbumLogo" ? musixmatchDefaultAlbumCover : props.album.album_cover} title={props.album.album_cover === "musixmatchDefaultAlbumLogo" ? "Album cover not found" : props.album.album_name}/>
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