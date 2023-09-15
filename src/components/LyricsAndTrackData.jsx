import React from "react";
import { NavLink } from "react-router-dom";
import hearticon from "../images/heart_icon.png";
import staricon from "../images/star_icon.png";

export const LyricsAndTrackData = (props) =>
{

    return (
        <div className="lyrics_and_track_data">
            <div className="track_title_artist">
                <div className="track_info">
                    <h1 className="track_title">{props.trackData.currentTrackName}</h1>
                    <h2 className="track_artist">{props.trackData.currentTrackArtist}</h2>
                </div>
            </div>

            <div className="album_and_lyrics">
                <div className="album_info">
                    <img className="album_cover_image" src={props.albumData.currentAlbumCover} alt="Album Cover" />
                    <h3 className="album_info_name">{props.albumData.currentAlbumName}</h3>
                    <h5 className="album_info_year">[{props.albumData.currentAlbumYear}]</h5>
                    <h4 className="tracklist_header">Tracklist:</h4>
                    <ol>
                        {props.albumData.currentAlbumTrackList.map((t) => (
                            <li key={t.mxm_commontrack_id}>
                                <NavLink to={`/track?mxm_track_id=${t.mxm_track_id}&mxm_commontrack_id=${t.mxm_commontrack_id}&spfy_album_id=${t.spotify_album_id}`} 
                                    className="album_navlink"
                                    activeClassName={() => null  }>
                                    {t.track_name}
                                </NavLink>
                            </li>
                        ))}
                    </ol>
                </div>
                <div className="lyrics_body">
                    <p className="lyrics_body_text">{props.lyrics}</p>
                    <h3 className="lyrics_rules">Sorry, but we're not authorized to show the full lyrics.</h3>
                    <h4 className="lyrics_disclaimer">******* This Lyrics is NOT for Commercial use *******</h4>
                    <div className="track_likes_ratings">
                        <div>
                            <img className="heart_icon" src={hearticon} alt="Favorites" />
                                {props.trackData.currentTrackLikes}
                        </div>
                        <div>
                            <img className="star_icon" src={staricon} alt="Rating" />
                                {props.trackData.currentTrackRating}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}