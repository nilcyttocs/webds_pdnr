import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import PDNRComponent from "./PDNRComponent";

export class PDNRWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <PDNRComponent />
      </div>
    );
  }
}

export default PDNRWidget;
