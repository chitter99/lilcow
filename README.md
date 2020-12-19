# lilcow 🐮
Create project wide file and folder structure boilerplates in Visual Studio Code.



# Usage

# .lilcow.json

```json
{
    "templates": {
        "reactStatelessComponent": {
            "name": "{name}.component.tsx",
            "content": "import * as React from 'react';\r\n\r\nexport const {name}: React.StatelessComponent<{}> = (props) => {\r\n    return null;\r\n};"
        },
        "reactMyCoolPage": {
            "name": "src/pages/{name}",
            "content": [
                {
                    "name": "index.tsx",
                    "content": "import { {name} } from './{name}.tsx';\r\n\r\n\r\n\r\nexport default {name};"
                },
                {
                    "name": "{name}.tsx",
                    "content": "import * as React from 'react';\r\n\r\nexport const {name}: React.StatelessComponent<{}> = (props) => {\r\n    return null;\r\n};"
                },
                {
                    "name": "{name}.css",
                    "content": ""
                }
            ]
        }
    }
}
```

## Commands
### lilcow.applyBoilerplate
Applies a boilerplate to the selected folder.

### lilcow.createBoilerplate
Creates a new boilerplate from the selected folder or file. It will be safed in a .lilcow.json file in the root directory of the workspace.

### lilcow.createBoilerplateExample
Creates an example boilerplate file.

# Todo
- [] Rename template to boilerplate in whole project
- [] Replace all instances of {name}
- [] Add more variables useable inside boilerplates

# Roadmap
- [x] Apply boilerplates from config
- [x] Create boilerplates via config
- [] Create boilerplates from explorer
- [] Create boilerplates from command
- [] Implement autocomplete and encoding helper for .lilcow.json
- [] Implement autocomplete for boilerplate creation
- [] Create snippets from inside editor window (selected code)
- [] Use boilerplates inside boilerplates (boilerception!)