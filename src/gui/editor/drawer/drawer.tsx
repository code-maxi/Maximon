import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Alert, Button, ButtonGroup, Checkbox, Collapse, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Slider, TextField, Typography } from "@mui/material";
import React from "react";
import { elementType, fullElementName, GroundDataI, GameActorI, GeoActorI, groundTypeI, textGroundType } from "../../../game/dec";
import { Arr, NumberInput } from "../../adds";
import { editorTemplates } from '../gameEditor/objects/object';
import { game } from '../../../game/game';
import { gameCanvas, gameEditor } from '../gameEditor/gameEditor';
import { cellSize } from '../editor';
import { isTemplateExpression } from 'typescript';

export function ElementDrawer(p: {
    onAddSelect: (e: [string, string]) => void,
    onESUpdate: (e: any) => void,
    onModeChange: (e: number) => void,
    selectedItem?: any,
    addSelected?: [string, string],
    mode: number
}) {
    /*React.useEffect(() => {
        if (!p.selectedItem && p.mode === 2) p.onModeChange(1)
    })*/
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
    onAddSelect: (e: [string, string]) => void,
    selected?: [string, string]
}) {
    return <React.Fragment>{ editorTemplates.map((l, i) => <List className="tab-1">
        { i !== 0 ? <Divider /> : undefined }
        <ListSubheader>{ l.title }</ListSubheader>
        {
            l.items.map(i => <ListItemButton 
                selected={ Arr.equal([l.title, i.name], p.selected) }
                onClick={() => {
                    if (!Arr.equal([l.title, i.name], p.selected)) {
                        p.onAddSelect([l.title, i.name])
                    }
                }}>
                <ListItemText> { i.name } </ListItemText>
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
            i = <GroundDataModify item={c} onChange={s => p.onESUpdate(s)} />
        }

        return i
    }

    return <div className="tab-2">
        <Typography className="my-title" variant="subtitle1">Element Einstellungen</Typography>
        <List>
            <ListItem secondaryAction={
                <IconButton color="error" onClick={ () => gameCanvas.removeSelected() }><DeleteRoundedIcon /></IconButton>
            }>
                <ListItemText>Element entfernen?</ListItemText>
            </ListItem>
            
            { p.item !== undefined ? elementSettings() : '' }
        </List>
    </div>
}

function GroundDataModify(p: {
    item: GeoActorI<GroundDataI>,
    onChange: (v: GeoActorI<GroundDataI>) => void
}) {
    const [gType, setGType] = React.useState(p.item.custom.groundType)
    const [checkVertical, setCheckVertical] = React.useState(p.item.custom.vertical)
    const [checkElevated, setCheckElevated] = React.useState(p.item.custom.elevated ? p.item.custom.elevated : false)
    return <React.Fragment>
        <ListItem>
            <ButtonGroup>
                {
                    ([ 'none', 'grass', 'barrier', 'ice' ] as groundTypeI[]).map(m => 
                            <Button 
                                variant={ m === gType ? 'contained' : 'outlined' }
                                onClick={ () => {
                                    p.onChange({
                                        ...p.item,
                                        custom: {
                                            ...p.item.custom,
                                            groundType: m
                                        }
                                    })
                                    setGType(m)
                                } }
                            >{textGroundType(m)}</Button>
                        )
                }
            </ButtonGroup>
        </ListItem>
        <ListItem secondaryAction={
            <Checkbox
                checked={checkVertical}
                onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                    p.onChange({
                        ...p.item,
                        custom: {
                            ...p.item.custom,
                            vertical: e.target.checked,
                        }
                    })
                    setCheckVertical(!checkVertical)
            } } />
        }>
            <ListItemText>Vertikal</ListItemText>
        </ListItem>
        <Collapse in={!checkVertical}>
            <ListItem secondaryAction={
                <Checkbox
                    checked={checkElevated}
                    onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                        p.onChange({
                            ...p.item,
                            custom: {
                                ...p.item.custom,
                                elevated: e.target.checked,
                                vertical: false
                            }
                        })
                        setCheckElevated(!checkElevated)
                    } } />
            }>
                <ListItemText>Hochgestellt</ListItemText>
            </ListItem>
        </Collapse>
    </React.Fragment>
}