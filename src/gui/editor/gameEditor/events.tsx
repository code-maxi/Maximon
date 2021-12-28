import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Alert, Autocomplete, Button, Divider, IconButton, Paper, TextField } from "@mui/material";
import React from 'react';
import { aviableEventsT, EDCSpeechbubleI, EventDataGenericI, EventDataI } from "../../../game/dec";

export const evtTemplates: {
    evt: aviableEventsT,
    infoText: string
}[] = [
    {
        evt: '/jumper/set-speechbuble',
        infoText: 'Mit diesem Event kannst du dem Männchen eine Sprechblase geben. Gib den Text unten ein.'
    },
    {
        evt: '/jumper/drop',
        infoText: 'Mit diesem Event kannst du das Männchen veranlassen bestimmte Gegenstände abzuwerfen (wie z.B. ein Jetpack).'
    },
    {
        evt: '/camera/zoom',
        infoText: 'Mit diesem Event kannst du die Kamera veranlassen zu zoomen.'
    },{
        evt: '/jumper/set-gravity',
        infoText: 'Mit diesem Event kannst du die Schwerkraft des Männchens verändern.'
    }
]

export function newEventTemplate(evt: aviableEventsT) {
    let res: EventDataI | undefined = undefined
    if (evt === '/camera/zoom') res = { command: evt, custom: { numberV: 15 } }
    if (evt === '/jumper/drop') res = { command: evt, custom: undefined }
    if (evt === '/jumper/set-gravity') res = { command: evt, custom: { numberV: 15 } }
    if (evt === '/jumper/set-speechbuble') res = { command: evt, custom: { text: '' } }
    return res!
}

export function EventList(p: {
    evts: EventDataI[],
    onEvtChange: (e: EventDataI[]) => void
}) {
    const template = (e: EventDataI) => evtTemplates.find(et => et.evt === e.command)!
    return <div className="evt-component-list">
        {
            p.evts.map(e => (
                <Paper className="evt-component-paper" elevation={3}>
                    <div className="evt-component-header">
                        <Autocomplete
                            disablePortal
                            value={e.command}
                            onChange={(_: any, value: string | null) => {
                                console.log(value)
                                if (value) p.onEvtChange(p.evts.map(ev => ev === e ? newEventTemplate(value as aviableEventsT) : ev))
                            }}
                            options={evtTemplates.map(e => e.evt)}
                            renderInput={(params) => <TextField {...params} label="Event" />}
                        />
                        <IconButton 
                            color="error" 
                            onClick={ () => p.onEvtChange(p.evts.filter(ev => ev !== e)) }
                        ><DeleteRoundedIcon /></IconButton>
                    </div>
                    <Alert severity='info'>
                        { template(e).infoText }
                    </Alert>
                    <Divider />
                    <EventSettings evt={e} onEvtChange={change => p.onEvtChange(p.evts.map(ev => ev === e ? change : ev))} />
                </Paper>
            ))
        }
        <Button 
            className='evt-component-add-button'
            color='primary' 
            variant='contained'
            startIcon={ <AddCircleRoundedIcon /> }
            onClick={() => p.onEvtChange([ ...p.evts, newEventTemplate('/jumper/set-speechbuble') ])}
        >Neues Event hinzufügen</Button>
    </div>
}

export function EventSettings(p: {
    evt: EventDataI,
    onEvtChange: (e: EventDataI) => void
}) {
    let res: React.ReactElement | undefined = undefined

    const customChange = (custom: any) => p.onEvtChange({ ...p.evt, custom: { ...custom } })

    if (p.evt.command === '/jumper/set-speechbuble') {
        const casted = p.evt as EventDataGenericI<EDCSpeechbubleI>
        res = <TextField
            value={ casted.custom.text }
            onChange={ t => customChange({ text: t.target.value }) }
            multiline
            maxRows={4}
        />
    }

    return res ? res : <React.Fragment />
}