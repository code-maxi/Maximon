import { Box, Typography } from "@mui/material";
import React from "react";

export let gameCanvas: GameCanvas

export class GameCanvas extends React.Component<{ editable: boolean }, { text: string }> {
    constructor(p: any) {
        super(p)
        this.state = { text: '' }
        gameCanvas = this
    }
    setText(s: string) { this.setState({ text: s }) }
    render() {
        return <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%"
        }} id="game-canvas-container">
            <Typography>{ this.state.text }</Typography>
        </Box>
    }
}