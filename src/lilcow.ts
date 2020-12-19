import * as vscode from 'vscode';

export type Config = {
    templates?: NamedTemplates
};

export type NamedTemplates = {
    [template: string]: Template
};

export type Template = {
    name: string,
    content: string | Template[]
}

export type ApplyProperties = {
    to?: vscode.Uri,
    nameInputValue?: string
}

export class NoWorkspaceIsOpenError extends Error {

}

export class LilCowConfigNotFoundError extends Error {

}

export async function readLocalConfig(): Promise<Config> {
    let path = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.toString() + '/.lilcow.json' : null;

    if(!path) {
        throw new NoWorkspaceIsOpenError('No workspace or folder is currently open in vscode')
    }

    return readConfig(vscode.Uri.parse(path));
}

export async function readConfig(from: vscode.Uri): Promise<Config> {
    let doc;

    try {
        doc = await vscode.workspace.openTextDocument(from);
    }
    catch(err) {
        if(err instanceof vscode.FileSystemError.FileNotFound) {
            throw new LilCowConfigNotFoundError('Could not find any file under ' + from);
        } else {
            throw err;
        }
    }

    return JSON.parse(doc.getText()) as Config;
}

export async function getTemplates(): Promise<NamedTemplates> {
    let config = await readLocalConfig();

    if(!config.templates) {
        return {};
    }

    return config.templates;
}

export function applyTemplate(template: Template, properties?: ApplyProperties) {
    if(!properties) {
        properties = {};
    }

    if(!properties.to) {
        // set default to current workspace root folder
        if(!vscode.workspace.workspaceFolders) {
            throw new NoWorkspaceIsOpenError('No workspace or folder is currently open in vscode')
        }
        properties.to = vscode.workspace.workspaceFolders[0].uri;
    }

    if(!properties.nameInputValue) {
        properties.nameInputValue = 'MyNewSuperCoolBoilerplateInstance';
    }

    let templateContextName = template.name.replace('{name}', properties.nameInputValue);

    if(template.content instanceof Array) {
        template.content.forEach((t) => {
            let newTemplateProperties = {...properties} as ApplyProperties;
            newTemplateProperties.to = vscode.Uri.parse(properties?.to?.toString() + '/' + templateContextName);
            applyTemplate(t, newTemplateProperties);
        });
    } else if(typeof template.content === "string") {
        let uri = vscode.Uri.parse(properties?.to?.toString() + '/' + templateContextName);
        let templateContextContent = template.content.replace('{name}', properties.nameInputValue);
        vscode.workspace.fs.writeFile(uri, Buffer.from(templateContextContent, 'utf-8'))
    } else {
        console.log('lilcow: Hold on there tiger. We currently only support string and array template content types!');
    }
}
