import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import React from "react";
import { SettingsDrawer, StandartSettings } from "./drawer/settings";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TabPanel } from "../adds";
import { ElementDrawer } from "./drawer/drawer";
import { gameCanvas, GameCanvas } from "../../game/canvas";
import { elementType, GroundDataI } from '../../game/dec';
import { GameActor } from '../../game/actors/gameActor';
import { GeoActor } from '../../game/actors/geoActor';
import { ReactGame } from '../../game/game';

export class Editor extends React.Component<{}, {
    addSelectedItem?: elementType,
    mode: number,
    tab: number,
    selectedItem?: any
}> {
    elementSettings?: any

    constructor(p: any) {
        super(p)
        this.state = {
            mode: 2,
            tab: 2,
            selectedItem: {
                type: 'ground',
                pos: { x: 0, y: 0 },
                width: 1
            } as GroundDataI
        }
    }

    setES(o: any, update?: boolean) {
        this.elementSettings = o
        if (update === true) this.setState({
            ...this.state,
            selectedItem: this.elementSettings
        })
    }

    render() {
        return <div id="editor">
            <div>
                <ReactGame />
            </div>
            <div id="game-settings">
                <div className="tab-p">
                    <div className="tab-p-h">
                        <Tabs centered value={this.state.tab} onChange={(_: React.SyntheticEvent, newValue: number) => {
                            this.setState({ ...this.state, tab: newValue })
                        }} aria-label="lab API tabs example">

                            <Tab label="Einstellungen" value={1} icon={ <SettingsRoundedIcon /> } />
                            <Tab label="Elemente" value={2}  icon={ <DashboardRoundedIcon /> } />
                        </Tabs>
                    </div>
                    <TabPanel value={1} index={this.state.tab}>
                        <SettingsDrawer onSave={ () => {} } />
                    </TabPanel>
                    <TabPanel value={2} index={this.state.tab}>
                        <ElementDrawer
                            onAddSelect={ (e) => {
                                this.setState({ ...this.state, addSelectedItem: e })
                            } }
                            onESUpdate={ (e) => {
                                this.setES(e)
                            } } 
                            onModeChange={ (e) => {
                                this.setState({ ...this.state, mode: e })
                            } }
                            addSelected={this.state.addSelectedItem}
                            selectedItem={this.state.selectedItem}
                            mode={this.state.mode}
                        />
                    </TabPanel>
                </div>
            </div>
        </div>   
    }
}