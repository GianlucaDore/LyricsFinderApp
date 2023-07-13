import React from "react";
import musiXmatchLogo from '../images/MusiXmatchLogo.svg';
import "../css/Footer.css";
import { useNavigate } from "react-router-dom";

export const Footer = (props) =>
{
    const navigate = useNavigate();

    return (
        <div className={props.position}>
            <div className="made_by">
                <h3 className="made_by_header">Made by Gianluca Dore</h3>
                <button className="github_button">
                    <image src="logo github"></image> 
                </button>
                <button className="linkedin_button">
                    <image src="logo_linkedin"></image>
                </button>
            </div>
            <div className="powered_by">
                <button className="musixmatch_button" onClick={() => navigate("www.musixmatch.com")}>
                    <h3 className="musixmatch_header">Powered by</h3>
                    <img className="musixmatch_logo" src={musiXmatchLogo} alt="MusiXmatch logo" />
                </button>
            </div> 
        </div>
    );
}