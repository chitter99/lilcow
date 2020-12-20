import * as vscode from 'vscode';
import * as lil from './lilcow';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('lilcow.applyBoilerplate', async (root?: vscode.Uri) => {
		const templates = await lil.getTemplates();

		if(templates == {}) {
			vscode.window.showErrorMessage('🐮 You have no boilerplate created yet! Create some via the explorer context menu or the lilcow.createBoilerplate command.');
			return;
		}

		const userSelectedTemplateValue = await vscode.window.showQuickPick(Object.keys(templates), { placeHolder: 'Select Boilerplate to use' });

		if(!userSelectedTemplateValue) {
			vscode.window.showInformationMessage('🐮 Never mind then :(');
			return;
		}

		let userSelectedNameValue = await vscode.window.showInputBox({ placeHolder: 'MyNewSuperCoolBoilerplateInstance' });

		const userSelectedTemplate = templates[userSelectedTemplateValue] as lil.Template;
		lil.applyTemplate(userSelectedTemplate, { to: root, nameInputValue: userSelectedNameValue });

		vscode.window.showInformationMessage('🐮 Here you go, my jung boy!');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('lilcow.createBoilerplate', async (from: vscode.Uri) => {
		const templates = await lil.getTemplates();

		if(from.path == vscode.workspace.workspaceFolders[0].uri.path) {
			vscode.window.showWarningMessage('🐮 We cannot create a template from this directory!');
			return;
		}

		let userSelectedNameValue = await vscode.window.showInputBox({ placeHolder: 'MyNewSuperCoolBoilerplate' });

		if(userSelectedNameValue == '') {
			vscode.window.showWarningMessage('🐮 You need a name for your boilerplate!');
			return;
		}

		const userSelectedTemplate = templates[userSelectedNameValue] as lil.Template;
		if(userSelectedTemplate) {
			const userSelected = await vscode.window.showQuickPick(['overwrite', 'go back'], {  placeHolder: 'There is already a boilerplate with that name' });
			if(userSelected == 'go back') {
				return vscode.commands.executeCommand('lilcow.createBoilerplate', from);
			}
		}

		await lil.saveAsBoilerplate(from, userSelectedNameValue);

		vscode.window.showInformationMessage('🐮 Here you go, my jung boy!');
	}));
}