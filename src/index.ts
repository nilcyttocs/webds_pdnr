import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService, WebDSWidget } from "@webds/service";

import { pdnrIcon } from "./icons";

import PDNRWidget from "./widget/PDNRWidget";

namespace Attributes {
  export const command = "webds_pdnr:open";
  export const id = "webds_pdnr_widget";
  export const label = "PDNR";
  export const caption = "PDNR";
  export const category = "Device - Config Library";
  export const rank = 80;
}

export let webdsService: WebDSService;

/**
 * Initialization data for the @webds/pdnr extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/pdnr:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/pdnr is activated!");

    webdsService = service;

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? pdnrIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new PDNRWidget(Attributes.id);
          widget = new WebDSWidget<PDNRWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = pdnrIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, {
      command,
      name: () => Attributes.id
    });
  }
};

export default plugin;
