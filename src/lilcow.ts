import * as vscode from 'vscode';
import * as path from 'path';


export class NoWorkspaceIsOpenError extends Error {

}

export class LilCowConfigNotFoundError extends Error {

}

/*
 * Config operations
 */

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

function getLocalConfigUri(): vscode.Uri {
    let path = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.toString() + '/.lilcow.json' : null;

    if(!path) {
        throw new NoWorkspaceIsOpenError('No workspace or folder is currently open in vscode')
    }

    return vscode.Uri.parse(path);
}

async function readLocalConfig(): Promise<Config> {
    return readConfig(getLocalConfigUri());
}

async function readConfig(from: vscode.Uri): Promise<Config> {
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

async function saveLocalConfig(config: Config) {
    return saveConfig(getLocalConfigUri(), config);
}

async function saveConfig(to: vscode.Uri, config: Config) {
    let configJson = JSON.stringify(config, null, 2);
    await vscode.workspace.fs.writeFile(to, Buffer.from(configJson, 'utf-8'));
}

export async function getTemplates(): Promise<NamedTemplates> {
    let config = await readLocalConfig();

    if(!config.templates) {
        return {};
    }

    return config.templates;
}

export async function saveAsBoilerplate(uri: vscode.Uri, name: string) {
    let config = await readLocalConfig();

    if(!config.templates) {
        config.templates = {} as NamedTemplates;
    }  

    config.templates[name] = await generateBoilerplate(uri);
    await saveLocalConfig(config);
}

async function generateBoilerplate(from: vscode.Uri): Promise<Template> {
    let stat = await vscode.workspace.fs.stat(from);

    let content;
    if(stat.type == vscode.FileType.File) {
        content = Buffer.from(await vscode.workspace.fs.readFile(from)).toString('utf-8');
    } else if(stat.type == vscode.FileType.Directory) {
        content = (await vscode.workspace.fs.readDirectory(from)).map((d) => {
            return generateBoilerplate(vscode.Uri.parse(from.path + '/' + d[0]));
        });
    }

    return {
        name: path.basename(from.path),
        content: content
    } as Template;
}

/*
 * Apply template function
 */

export type ApplyProperties = {
    to?: vscode.Uri,
    nameInputValue?: string
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
