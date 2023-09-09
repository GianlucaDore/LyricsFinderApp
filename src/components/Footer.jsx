import React from "react";
import musiXmatchLogo from '../images/MusiXmatchLogo_White.png';
import spotifyLogo from '../images/SpotifyLogo.png';
import linkedinicon from '../images/linkedin_icon.png';
import githubicon from '../images/aicon.png'
import "../css/Footer.css";
import { Link } from "react-router-dom";

export const Footer = (props) =>
{
    return (
        <div className={props.position}>
            <div className="made_by">
                <h3 className="made_by_header">Made by Gianluca Dore</h3>
                <Link to="https://www.github.com/GianlucaDore">
                    <img id="github_logo" src={githubicon} alt="GitHub Icon" />
                </Link>
                <Link to="https://www.linkedin.com/in/gianluca-dore">
                    <img id="linkedin_logo" src={linkedinicon} alt="LinkedIn icon" />
                </Link>
            </div>
            <div className="powered_by">
                <h3 className="powered_by_header">Powered by</h3>
                <div className="logos_container">
                    <div className="musixmatch_logo_container">
                        <Link to="https://www.musixmatch.com">
                            <img id="musixmatch_logo" src={musiXmatchLogo} alt="MusiXmatch logo" />
                        </Link>
                    </div>
                    <div className="spotify_logo_container">
                        <Link to="https://www.spotify.com">
                            <img id="spotify_logo" src={spotifyLogo} alt="Spotify logo" />
                        </Link>
                    </div>
                </div>
                
            </div> 
        </div>
    );
}