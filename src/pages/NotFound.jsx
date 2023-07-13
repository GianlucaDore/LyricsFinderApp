import React from "react";
import { Footer } from "../components/Footer";

export const NotFound = () =>
{
    return (
        <div className="NotFound">
            <h1 className="notfound_header">404 Not Found!</h1>
            <p className="notfound_text">The item you requested was not found on this server. Please make a new search.</p>
            <Footer position="stay_fixed"/>
        </div>
    )
}