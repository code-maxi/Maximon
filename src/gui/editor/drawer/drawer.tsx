import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Alert, Button, ButtonGroup, Checkbox, Collapse, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Slider, TextField, Typography } from "@mui/material";
import React from "react";
import { elementType, fullElementName, GroundDataI, GameActorI, GeoActorI, groundTypeI, textGroundType } from "../../../game/dec";
import { Arr, NumberInput, SwitchButtonGroup } from "../../adds";
import { game } from '../../../game/game';
import { gameCanvas, gameEditor } from '../gameEditor/gameEditor';
import { cellSize } from '../editor';
import { isTemplateExpression } from 'typescript';
import { editorTemplates } from '../gameEditor/objects/object-templates';

export function ElementDrawer(p: {
    onAddSelect: (e?: [string, string]) => void,
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
    onAddSelect: (e?: [string, string]) => void,
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
                    } else p.onAddSelect()
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
    const elementSettings = () => {
        let i: React.ReactElement | undefined = undefined

        console.log('type2')
        console.log(p.item.type)

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
    const [gType, setGType] = React.useState<groundTypeI>(p.item.custom.groundType)
    const [checkVertical, setCheckVertical] = React.useState(p.item.custom.vertical)
    const [elevated, setElevated] = React.useState(p.item.custom.elevated)
    
    return <React.Fragment>
        <ListItem>
            <SwitchButtonGroup 
                items={['none', 'grass', 'barrier', 'ice']}
                selectedItem={gType}
                onChange={g => {
                    setGType(g as groundTypeI)
                    p.onChange({
                        ...p.item,
                        custom: {
                            ...p.item.custom,
                            groundType: g as groundTypeI
                        }
                    })
                }}
                convertText={t => textGroundType(t as groundTypeI)}
                className="ground-type-switch"
            />
        </ListItem>
        <ListItem secondaryAction={
            <Checkbox
                checked={checkVertical}
                onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                    p.onChange({
                        ...p.item,
                        custom: {
                            ...p.item.custom,
                            vertical: e.target.checked
                        }
                    })
                    setCheckVertical(!checkVertical)
            } } />
        }>
            <ListItemText>Vertikal</ListItemText>
        </ListItem>
        <Collapse in={!checkVertical}>
            <ListItem secondaryAction={
                <SwitchButtonGroup
                    items={[undefined, 't', 'b']}
                    selectedItem={elevated}
                    onChange={ s => {
                        p.onChange({
                            ...p.item,
                            custom: {
                                ...p.item.custom,
                                elevated: s as ('t' | 'b' | undefined)
                            }
                        })
                        setElevated(s as ('t' | 'b' | undefined))
                    } }
                    convertText={s => s ? (s === 't' ? 'Oben' : 'Unten') : 'Kein'}
                    color="secondary"
                />
            }>
                <ListItemText>Hochgestellt</ListItemText>
            </ListItem>
        </Collapse>
    </React.Fragment>
}

/*

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

*/