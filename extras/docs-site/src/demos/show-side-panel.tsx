import React from "react";

export function showSidePanel
(
    mainPanel: React.ReactElement,
    sidePanel: React.ReactElement,
    showSidePanel: boolean,
)
    : React.ReactElement
{
    if (showSidePanel)
    {
        return (
            <div className="row-component full-screen">{mainPanel}{sidePanel}</div>
        );
    }
    else
    {
        return (
            <div className="row-component">{mainPanel}</div>
        );
    }
}