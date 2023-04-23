import { Plugin } from 'obsidian';


export default class AutoTemplatePromptPlugin extends Plugin {
	isReady = false;
	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.isReady = true
		})

		this.registerEvent(
			this.app.vault.on("create", () => {
				if (!this.isReady) {
					return;
				}
				// @ts-expect-error
				this.app.commands.executeCommandById('insert-template');
			}
			))
	}
}