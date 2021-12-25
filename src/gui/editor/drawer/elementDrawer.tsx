import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Alert, Button, ButtonGroup, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Typography } from "@mui/material";
import React from "react";
import { fullElementName } from "../../../game/dec";
import { elementAddButtonTemplates, elementSettingTemplates } from '../gameEditor/objects/element-templates';
import { gameCanvas } from '../gameEditor/gameEditor';

export function ElementDrawer(p: {
    onAddSelect: (e?: string) => void,
    onESUpdate: (e: any) => void,
    onModeChange: (e: number) => void,
    selectedItem?: any,
    addSelected?: string,
    mode: number
}) {
    return <div id="drawer">
            <ButtonGroup className="p-buttons">
                <Button
                    color="success"
                    variant={ p.mode === 1 ? 'contained' : 'outlined' }
                    startIcon={ <AddCircleRoundedIcon /> }
                    onClick={() => p.onModeChange(1)}
                >Hinzufügen</Button>
                <Button
                    color="primary"
                    variant={ p.mode === 2 ? 'contained' : 'outlined' }
                    startIcon={ <EditRoundedIcon /> }
                    onClick={() => p.onModeChange(2)}
                >Bearbeiten</Button>
            </ButtonGroup>
            <Divider />
            {
                p.mode === 1 ? <ElementAddList onAddSelect={p.onAddSelect} selected={p.addSelected} />
                    : <div>
                        <Alert severity={ p.selectedItem ? 'success' : 'error' } style={ {marginTop: '10px', marginBottom: '20px'} }>{
                            p.selectedItem ? 'Es wurde \'' + fullElementName(p.selectedItem) + '\' ausgewählt.'
                                : 'Du musst etwas auswählen...'
                        }</Alert>
                        { p.selectedItem ? <ElementSettings onESUpdate={p.onESUpdate} item={p.selectedItem} /> : undefined }
                    </div>
            }
        </div>
}

export function ElementAddList(p: {
    onAddSelect: (e?: string) => void,
    selected?: string
}) {
    return <React.Fragment>{ elementAddButtonTemplates.map((t, i) => <List className="tab-1">
        { i !== 0 ? <Divider /> : undefined }
        <ListSubheader>{ t.title }</ListSubheader>
        {
            t.items.map(ea => <ListItemButton 
                selected={ p.selected === t.title + '/' + ea.buttonText }
                onClick={() => {
                    if (p.selected !== t.title + '/' + ea.buttonText) {
                        p.onAddSelect(t.title + '/' + ea.buttonText)
                    } else p.onAddSelect()
                }}>
                <ListItemText> { ea.buttonText } </ListItemText>
            </ListItemButton>)
        }
    </List>) }</React.Fragment>
}

export function ElementSettings(p: {
    onESUpdate: (e: any) => void
    item: any
}) {
    return <div className="tab-2">
        <Typography className="my-title" variant="subtitle1">Element Einstellungen</Typography>
        <List>
            <ListItem secondaryAction={
                <IconButton color="error" onClick={ () => gameCanvas.removeSelected() }><DeleteRoundedIcon /></IconButton>
            }>
                <ListItemText>Element entfernen?</ListItemText>
            </ListItem>
            
            { p.item !== undefined ? elementSettingTemplates.find(t => t.type === p.item.type)!.SettingsGUI({
                item: p.item,
                onChange: p.onESUpdate
            }) : '' }
        </List>
    </div>
}