import React from "react";
import { OpenInFull } from "@mui/icons-material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";

export interface IDemoCardProps
{
    title: string;
    subHeading?: string;
    chartComponent: React.ReactElement;
    onExpandClick: () => void;
}

export default function DemoCard(props: IDemoCardProps)
{
    return (
        <Card sx={{ minWidth: 250 }}>
            <CardContent>
                <CardHeader action={<IconButton onClick={props.onExpandClick}><OpenInFull/></IconButton>}
                            title={props.title}
                            subheader={props.subHeading}/>
                {props.chartComponent}
            </CardContent>
        </Card>
    );
}