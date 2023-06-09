import { Plugin, TAbstractFile, TFile } from 'obsidian';

export default class AutoTemplatePromptPlugin extends Plugin {
	isReady = false;

	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.isReady = true
		})

		this.registerEvent(
			this.app.vault.on("create", async (createdFile) => {
				
				if (!this.isReady || !this.isMarkdown(createdFile)) {
					return;
				}

				if (!(createdFile instanceof TFile)) {
					return;
				}

				const isJustCreated = createdFile.stat.ctime === createdFile.stat.mtime
				const isFileInFocus = this.app.workspace.getActiveFile()?.path === createdFile.path;

				if (!isJustCreated || !isFileInFocus) {
					return
				}

				const templatesFolder = await this.getTemplatesFolder()

			
				if (!templatesFolder) {
					return
				}

				if (createdFile.path.startsWith(templatesFolder)) {
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
