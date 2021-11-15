import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import React from "react";
import { SettingsDrawer } from "./drawer/settings";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TabPanel } from "../adds";
import { ElementDrawer } from "./drawer/drawer";
import { elementType, GroundDataI } from '../../game/dec';
import { ReactGame } from '../../game/game';
import { gameEditor } from './gameEditor/gameEditor';
import { editorTemplates } from './gameEditor/objects/object';

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
            tab: 1,
            selectedItem: undefined
        }
    }

    setES(o: any, update?: boolean) {
        this.elementSettings = o
        if (update === true) this.setState({
            ...this.state,
            selectedItem: this.elementSettings
        })
    }

    //<ReactGame />

    render() {
        return <div id="editor">
            <div id="game-container">
                <ReactGame />
            </div>
            <div id="game-settings">
                <div className="tab-p">
                    <div className="tab-p-h">
                        <Tabs centered value={this.state.tab} onChange={(_: React.SyntheticEvent, newValue: number) => {
                            this.setState({ ...this.state, tab: newValue })
                            console.log('tab clicked!')
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
                                gameEditor.gameCanvas?.setAddingElement(editorTemplates[e](0))
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