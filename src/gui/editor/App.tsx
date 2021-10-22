import { Box, Button } from "@mui/material";
import React from "react";
import { Editor } from "./editor";

class App extends React.Component<{}, {
  state: 'login' | 'list' | 'editor'
}> {
  render() {
    return <Editor />
  }
}

export default App;
