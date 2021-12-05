import { Button, ButtonGroup, Checkbox, Divider, FormControlLabel, List, ListItem, ListItemText, ListSubheader, Slider, TextField, Typography } from "@mui/material";
import React from "react";
import { SzeneDataOptI } from "../../../game/dec";

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

export function SettingsDrawer(p: {
    onSave: (s?: StandartSettings) => void,
    onGameSettingsChange: (gs: SzeneDataOptI) => void,
    gameSettings: SzeneDataOptI
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
                    <ListItemText>Höhe des Spiels</ListItemText>
                    <Slider
                        className="s-li"
                        min={15} 
                        max={100} 
                        defaultValue={ss.schwierigkeit} 
                        step={1} 
                        valueLabelDisplay="auto" 
                        onChange={(t, e) => p.onGameSettingsChange({
                            ...p.gameSettings,
                            height: e as number
                        })} />
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