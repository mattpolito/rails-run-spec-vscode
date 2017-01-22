'use strict';
import * as vscode from 'vscode';

let lastCommandText;
let activeTerminals = {};
const SPEC_TERMINAL_NAME = 'Running Specs';
const ZEUS_TERMINAL_NAME = 'Zeus Start';

vscode.window.onDidCloseTerminal((terminal: vscode.Terminal) => {
    if (activeTerminals[terminal.name]) {
        delete activeTerminals[terminal.name];
    }
});

export function runSpecFile(options: {lineNumber?: number; commandText?: string}){
    let editor: vscode.TextEditor = vscode.window.activeTextEditor,
        fileName: string = vscode.workspace.asRelativePath(editor.document.fileName);

    if (!editor || !isSpec(fileName)) {
        return;
    }

    if (isZeusActive() && !activeTerminals[ZEUS_TERMINAL_NAME]) {
        zeusTerminalInit();
    }

    let specTerminal: vscode.Terminal = activeTerminals[SPEC_TERMINAL_NAME];

    if (!specTerminal) {
        specTerminal = vscode.window.createTerminal(SPEC_TERMINAL_NAME);
        activeTerminals[SPEC_TERMINAL_NAME] = specTerminal;
    }

    vscode.commands.executeCommand('workbench.action.terminal.focus');
    vscode.commands.executeCommand('workbench.action.terminal.clear');
    specTerminal.show();

    let lineNumberText = options.lineNumber ? `:${options.lineNumber}` : '',
        commandText = options.commandText || `${getSpecCommand()} ${fileName}${lineNumberText}`;

    specTerminal.sendText(commandText);
    lastCommandText = commandText;
}

export function runLastSpec() {
    if (lastCommandText) {
        runSpecFile({commandText: lastCommandText});
    }
}

function getSpecCommand() {
    if (isZeusActive()) {
        return 'zeus test';
    } else {
        return 'bundle exec rspec';
    }
}

function isZeusActive() {
    return vscode.workspace.getConfiguration("ruby").get('specGem') == "zeus";
}

function zeusTerminalInit() {
    let zeusTerminal = vscode.window.createTerminal(ZEUS_TERMINAL_NAME)
    activeTerminals[ZEUS_TERMINAL_NAME] = zeusTerminal;
    zeusTerminal.sendText("zeus start")
}

function isSpec(fileName: string) {
    return fileName.indexOf('_spec.rb') > -1;
}
