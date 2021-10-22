import { Button, ButtonGroup, Checkbox, Divider, FormControlLabel, List, ListItem, ListItemText, ListSubheader, Slider, TextField, Typography } from "@mui/material";
import React from "react";

export interface StandartSettings {
    name: string,
    schwierigkeit: number,
    creator: string
}
export interface GameSettings {
    gravity: number
}

let ss: StandartSettings = {
    name: "",
    schwierigkeit: 5,
    creator: ""
}
let gs: GameSettings = {
    gravity: 3
}

export function SettingsDrawer(p: {
    onSave: (s?: StandartSettings) => void
}) {
    return <div id="settings">
            <ButtonGroup className="p-buttons">
                <Button color="error" variant="outlined" onClick={() => { p.onSave() }}>Abbrechen</Button>
                <Button color="success" onClick={() => { p.onSave(ss) }}>Speichern</Button>
            </ButtonGroup>
            <Divider />
            <List>
                <ListSubheader>Globale Einstellungen</ListSubheader>
                <ListItem>
                    <ListItemText>Level Name</ListItemText>
                    <TextField className="s-li" variant="standard" onChange={(t) => {
                        ss.name = t.target.value
                    }} label="Name des Levels..."/>
                </ListItem>
                <ListItem>
                    <ListItemText>Schwierigkeisstufe</ListItemText>
                    <Slider
                        className="s-li"
                        min={1} 
                        max={10} 
                        defaultValue={ss.schwierigkeit} 
                        step={1} 
                        valueLabelDisplay="auto" 
                        onChange={(t, e) => { ss.schwierigkeit = e as number }} />
                </ListItem>
                <ListItem>
                    <ListItemText>Ersteller</ListItemText>
                    <TextField className="s-li" variant="standard" onChange={(t) => {
                        ss.creator = t.target.value
                    }} label="Dein Name..."/>
                </ListItem>
                <ListItem>
                    <ListItemText>Passwort</ListItemText>
                    <TextField className="s-li" variant="standard" onChange={(t) => {
                        ss.creator = t.target.value
                    }} label="Passwort..."/>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListSubheader>Spiel-Einstellungen</ListSubheader>
                <ListItem>
                    <ListItemText>Schwerekraft</ListItemText>
                    <Slider
                        className="s-li"
                        min={1}
                        max={10}
                        defaultValue={gs.gravity}
                        step={null}
                        onChange={(t, e) => { gs.gravity = e as number }} />
                </ListItem>
            </List>

            <Divider />
            <List>
                <ListItem>
                    <ListItemText>Debug-Modus</ListItemText>
                    <Checkbox />
                </ListItem>
            </List>
        </div>
}