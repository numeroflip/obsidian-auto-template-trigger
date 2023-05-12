import { Plugin, TAbstractFile, TFile } from 'obsidian';

const DELAY_IN_MILLISECONDS = 100;

export default class AutoTemplatePromptPlugin extends Plugin {
	isReady = false;

	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.isReady = true
		})

		this.registerEvent(
			this.app.vault.on("create", async (newFile) => {
				if (!this.isReady || !this.isMarkdown(newFile)) {
					return;
				}

				const templatesFolder = await this.getTemplatesFolder()

				if (!templatesFolder) {
					return
				}

				if (newFile.path.startsWith(templatesFolder)) {
					return; // Do not trigger when creating a template
				}

				this.insertTemplate();

			}))
	}

	async getTemplatesFolder() {
		//@ts-expect-error
		const templatesSettings = await this.app.vault.readConfigJson('templates')
		return templatesSettings?.folder
	}

	isMarkdown(file: TAbstractFile) {
		return file.path.endsWith('.md')
	}

	insertTemplate() {
		//@ts-expect-error
		this.app.commands.executeCommandById('insert-template');
	}
}