// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi, WorkspaceBrowseConfiguration, SourceFileConfigurationItem} from 'vscode-cpptools';

let api: CppToolsApi|undefined;

export async function activate(context: vscode.ExtensionContext) {

    api = await getCppToolsApi(Version.v2);
    if (api) {
		const provider = new MyProvider();
        if (api.notifyReady) {
            // Inform cpptools that a custom config provider will be able to service the current workspace.
            api.registerCustomConfigurationProvider(provider);

            // Do any required setup that the provider needs.

            // Notify cpptools that the provider is ready to provide IntelliSense configurations.
            api.notifyReady(provider);
        } else {
            // Running on a version of cpptools that doesn't support v2 yet.

            // Do any required setup that the provider needs.

            // Inform cpptools that a custom config provider will be able to service the current workspace.
            api.registerCustomConfigurationProvider(provider);
            api.didChangeCustomConfiguration(provider);
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
	api?.dispose();
}

class MyProvider implements CustomConfigurationProvider {
	name = "cpptools-9435-repro";
	extensionId = "cpptools-9435-repro";

	canProvideConfiguration(uri: vscode.Uri, _token?: vscode.CancellationToken | undefined) {
		console.log(uri.fsPath);
        return Promise.resolve(true);
    }
    async provideConfigurations(uris: vscode.Uri[], token?: vscode.CancellationToken | undefined): Promise<SourceFileConfigurationItem[]> {
		console.log(uris.map(uri => uri.fsPath));
		return uris.map(uri => {
			return {
				uri,
				configuration: {
					standard: "c17",
					intelliSenseMode: "clang-arm",
					includePath: [],
					defines: ["__EDG_VERSION__=444"]
				}
			};
		});
	}

	canProvideBrowseConfiguration(_token?: vscode.CancellationToken | undefined) {
        return Promise.resolve(false);
    }
    provideBrowseConfiguration(_token?: vscode.CancellationToken | undefined) {
		return Promise.reject();
	}
	canProvideBrowseConfigurationsPerFolder(_token?: vscode.CancellationToken | undefined) {
        return Promise.resolve(false);
    }
    provideFolderBrowseConfiguration(_uri: vscode.Uri, _token?: vscode.CancellationToken | undefined) {
        return Promise.resolve(null);
    }
    dispose() {
        this.canProvideConfiguration = () => Promise.resolve(false);
    }

};