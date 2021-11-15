import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Alert, Button, ButtonGroup, Checkbox, Collapse, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Slider, TextField, Typography } from "@mui/material";
import React from "react";
import { elementType, fullElementName, GroundDataI, GameActorI, GeoActorI } from "../../../game/dec";
import { NumberInput } from "../../adds";

export const listData: {
    title: string,
    items: {
        n: string,
        e: elementType
    }[]
}[] = [
    {
        title: 'Start und Ziel',
        items:  [ {n: 'Start', e: 'start'}, {n: 'Ziel', e: 'target'} ]
    },
    {
        title: 'Böden',
        items:  [ {n: 'Normaler Boden', e: 'ground'} ]
    },
    {
        title: 'Einstammelbare Objekte',
        items:  [ {n: 'Stern', e: 'score'}, {n: 'Münze', e: 'score'} ]
    }
]

export function ElementDrawer(p: {
    onAddSelect: (e: elementType) => void,
    onESUpdate: (e: any) => void,
    onModeChange: (e: number) => void,
    selectedItem?: any,
    addSelected?: elementType,
    mode: number
}) {
    React.useEffect(() => {
        if (!p.selectedItem && p.mode === 2) p.onModeChange(1)
    })
    return <div id="drawer">
            <ButtonGroup className="p-buttons">
                <Button
                    color="success"
                    variant={ p.mode === 1 ? 'contained' : 'outlined' }
                    startIcon={ <EditRoundedIcon /> }
                    onClick={() => p.onModeChange(1)}
                >Hinzufügen</Button>
                <Button
                    color="primary"
                    variant={ p.mode === 2 ? 'contained' : 'outlined' }
                    startIcon={ <AddCircleRoundedIcon /> }
                    disabled={ p.selectedItem === undefined }
                    onClick={() => p.onModeChange(2)}
                >Bearbeiten</Button>
            </ButtonGroup>
            <Divider />
            {
                p.mode === 1 ? <ElementAddList onAddSelect={p.onAddSelect} selected={p.addSelected} />
                    : <div>
                        <Alert severity={ p.selectedItem ? 'success' : 'info' } style={ {marginTop: '10px'} }>{
                            p.selectedItem ? 'Es wurde \'' + fullElementName(p.selectedItem) + '\' ausgewählt.'
                                : 'Du musst etwas auswählen...'
                        }</Alert>
                        { p.selectedItem ? <ElementSettings onESUpdate={p.onESUpdate} item={p.selectedItem} /> : undefined }
                    </div>
            }
        </div>
}

export function ElementAddList(p: {
    onAddSelect: (e: elementType) => void,
    selected?: elementType
}) {
    return <React.Fragment>{ listData.map((l, i) => <List className="tab-1">
        { i !== 0 ? <Divider /> : undefined }
        <ListSubheader>{ l.title }</ListSubheader>
        {
            l.items.map(i => <ListItemButton 
                selected={ p.selected === i.e }
                onClick={() => { p.onAddSelect(i.e) }}>
                <ListItemText> { i.n } </ListItemText>
            </ListItemButton>) 
        }
    </List>) }</React.Fragment>
}

export function ElementSettings(p: {
    onESUpdate: (e: any) => void
    item: any
}) {
    const [sCollapse, setSCollapse] = React.useState(p.item.speechbuble !== undefined)

    const elementSettings = () => {
        let i: React.ReactElement | undefined = undefined

        const speechBuble = () => <React.Fragment>
            <ListItem secondaryAction={
                <Checkbox
                    checked={sCollapse}
                    onClick={ () => {
                        p.onESUpdate({
                            ...p.item,
                            speechbuble: p.item.speechbuble === undefined ? {
                                text: '',
                                distance: 4
                            } : undefined
                        })
                        setSCollapse(!sCollapse)
                } } />
            }>
                <ListItemText>Sprechblase</ListItemText>
            </ListItem>
            <Collapse in={ sCollapse } sx={{ width: '100%' }}>
                <ListItem>
                    <TextField
                        label="Eine Sprechblase für das Objekt..."
                        multiline
                        maxRows={6}
                        value={ p.item.speechbuble?.text }
                        sx={{ width: '100%' }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { p.onESUpdate({
                            ...p.item,
                            speechbuble: {
                                ...p.item.speechbuble!,
                                text: e.target.value
                            }
                        }) } }
                        />
                </ListItem>
                <ListItem sx={{ pl: '45px' }}>
                    <ListItemText>Entfernung</ListItemText>
                    <Slider 
                        className="s-li"
                        min={1} 
                        max={10}
                        step={1}
                        value={ p.item.speechbuble?.distance } 
                        valueLabelDisplay="auto"
                        onChange={(e, n) => { p.onESUpdate({
                            ...p.item,
                            speechbuble: {
                                ...p.item.speechbuble!,
                                distance: n as number
                            }
                        }) }}
                    />
                </ListItem>
            </Collapse>
        </React.Fragment>

        if (p.item.type === 'ground') {
            const c = p.item as GeoActorI<GroundDataI>
             i = <React.Fragment>
                { speechBuble() }
                <ListItem>
                    <ListItemText>Breite</ListItemText>
                    <NumberInput value={ c.geo.width } onChange={ v => p.onESUpdate({
                        ...p.item,
                        width: v
                    } as GroundDataI) } />
                </ListItem>
                <ListItem>
                   <ListItemText>Höhe</ListItemText>
                    <NumberInput value={ c.geo.height } onChange={ v => p.onESUpdate({
                        ...p.item,
                        height: v
                    } as GroundDataI) } />
                </ListItem>
                <ListSubheader>Rote Dreiecke</ListSubheader>
                <ListItem>
                   
                </ListItem>
             </React.Fragment>
        }

        return i
    }

    return <div className="tab-2">
        <Typography variant="subtitle1">Element Einstellungen</Typography>
        <List>
            <ListItem secondaryAction={
                <IconButton color="error"><DeleteRoundedIcon /></IconButton>
            }>
                <ListItemText>Element entfernen?</ListItemText>
            </ListItem>
            
            { p.item !== undefined ? elementSettings() : '' }
        </List>
    </div>
}