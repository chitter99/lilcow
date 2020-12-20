module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const lil = __webpack_require__(2);
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('lilcow.applyBoilerplate', (root) => __awaiter(this, void 0, void 0, function* () {
        const templates = yield lil.getTemplates();
        if (templates == {}) {
            vscode.window.showErrorMessage('🐮 You have no boilerplate created yet! Create some via the explorer context menu or the lilcow.createBoilerplate command.');
            return;
        }
        const userSelectedTemplateValue = yield vscode.window.showQuickPick(Object.keys(templates), { placeHolder: 'Select Boilerplate to use' });
        if (!userSelectedTemplateValue) {
            vscode.window.showInformationMessage('🐮 Never mind then :(');
            return;
        }
        let userSelectedNameValue = yield vscode.window.showInputBox({ placeHolder: 'MyNewSuperCoolBoilerplateInstance' });
        const userSelectedTemplate = templates[userSelectedTemplateValue];
        lil.applyTemplate(userSelectedTemplate, { to: root, nameInputValue: userSelectedNameValue });
        vscode.window.showInformationMessage('🐮 Here you go, my jung boy!');
    })));
    context.subscriptions.push(vscode.commands.registerCommand('lilcow.createBoilerplate', (from) => __awaiter(this, void 0, void 0, function* () {
        const templates = yield lil.getTemplates();
        if (from.path == vscode.workspace.workspaceFolders[0].uri.path) {
            vscode.window.showWarningMessage('🐮 We cannot create a template from this directory!');
            return;
        }
        let userSelectedNameValue = yield vscode.window.showInputBox({ placeHolder: 'MyNewSuperCoolBoilerplate' });
        if (userSelectedNameValue == '') {
            vscode.window.showWarningMessage('🐮 You need a name for your boilerplate!');
            return;
        }
        const userSelectedTemplate = templates[userSelectedNameValue];
        if (userSelectedTemplate) {
            const userSelected = yield vscode.window.showQuickPick(['overwrite', 'go back'], { placeHolder: 'There is already a boilerplate with that name' });
            if (userSelected == 'go back') {
                return vscode.commands.executeCommand('lilcow.createBoilerplate', from);
            }
        }
        yield lil.saveAsBoilerplate(from, userSelectedNameValue);
        vscode.window.showInformationMessage('🐮 Here you go, my jung boy!');
    })));
}
exports.activate = activate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.applyTemplate = exports.saveAsBoilerplate = exports.getTemplates = exports.LilCowConfigNotFoundError = exports.NoWorkspaceIsOpenError = void 0;
const vscode = __webpack_require__(1);
const path = __webpack_require__(3);
class NoWorkspaceIsOpenError extends Error {
}
exports.NoWorkspaceIsOpenError = NoWorkspaceIsOpenError;
class LilCowConfigNotFoundError extends Error {
}
exports.LilCowConfigNotFoundError = LilCowConfigNotFoundError;
function getLocalConfigUri() {
    let path = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.toString() + '/.lilcow.json' : null;
    if (!path) {
        throw new NoWorkspaceIsOpenError('No workspace or folder is currently open in vscode');
    }
    return vscode.Uri.parse(path);
}
function readLocalConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        return readConfig(getLocalConfigUri());
    });
}
function readConfig(from) {
    return __awaiter(this, void 0, void 0, function* () {
        let doc;
        try {
            doc = yield vscode.workspace.openTextDocument(from);
        }
        catch (err) {
            if (err instanceof vscode.FileSystemError.FileNotFound) {
                throw new LilCowConfigNotFoundError('Could not find any file under ' + from);
            }
            else {
                throw err;
            }
        }
        return JSON.parse(doc.getText());
    });
}
function saveLocalConfig(config) {
    return __awaiter(this, void 0, void 0, function* () {
        return saveConfig(getLocalConfigUri(), config);
    });
}
function saveConfig(to, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let configJson = JSON.stringify(config, null, 2);
        yield vscode.workspace.fs.writeFile(to, Buffer.from(configJson, 'utf-8'));
    });
}
function getTemplates() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = yield readLocalConfig();
        if (!config.templates) {
            return {};
        }
        return config.templates;
    });
}
exports.getTemplates = getTemplates;
function saveAsBoilerplate(uri, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = yield readLocalConfig();
        if (!config.templates) {
            config.templates = {};
        }
        config.templates[name] = yield generateBoilerplate(uri);
        yield saveLocalConfig(config);
    });
}
exports.saveAsBoilerplate = saveAsBoilerplate;
function generateBoilerplate(from) {
    return __awaiter(this, void 0, void 0, function* () {
        let stat = yield vscode.workspace.fs.stat(from);
        let content;
        if (stat.type == vscode.FileType.File) {
            content = Buffer.from(yield vscode.workspace.fs.readFile(from)).toString('utf-8');
        }
        else if (stat.type == vscode.FileType.Directory) {
            content = (yield vscode.workspace.fs.readDirectory(from)).map((d) => {
                return generateBoilerplate(vscode.Uri.parse(from.path + '/' + d[0]));
            });
        }
        return {
            name: path.basename(from.path),
            content: content
        };
    });
}
function applyTemplate(template, properties) {
    var _a;
    if (!properties) {
        properties = {};
    }
    if (!properties.to) {
        // set default to current workspace root folder
        if (!vscode.workspace.workspaceFolders) {
            throw new NoWorkspaceIsOpenError('No workspace or folder is currently open in vscode');
        }
        properties.to = vscode.workspace.workspaceFolders[0].uri;
    }
    if (!properties.nameInputValue) {
        properties.nameInputValue = 'MyNewSuperCoolBoilerplateInstance';
    }
    let templateContextName = template.name.replace('{name}', properties.nameInputValue);
    if (template.content instanceof Array) {
        template.content.forEach((t) => {
            var _a;
            let newTemplateProperties = Object.assign({}, properties);
            newTemplateProperties.to = vscode.Uri.parse(((_a = properties === null || properties === void 0 ? void 0 : properties.to) === null || _a === void 0 ? void 0 : _a.toString()) + '/' + templateContextName);
            applyTemplate(t, newTemplateProperties);
        });
    }
    else if (typeof template.content === "string") {
        let uri = vscode.Uri.parse(((_a = properties === null || properties === void 0 ? void 0 : properties.to) === null || _a === void 0 ? void 0 : _a.toString()) + '/' + templateContextName);
        let templateContextContent = template.content.replace('{name}', properties.nameInputValue);
        vscode.workspace.fs.writeFile(uri, Buffer.from(templateContextContent, 'utf-8'));
    }
    else {
        console.log('lilcow: Hold on there tiger. We currently only support string and array template content types!');
    }
}
exports.applyTemplate = applyTemplate;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })()
;
//# sourceMappingURL=extension.js.map