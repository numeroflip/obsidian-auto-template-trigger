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

				const templateFiles = this.getFilesInFolder(templatesFolder)
				const templateFileCount = templateFiles?.length

				if (!templateFileCount) {
					return
				}

				/**
				 * For some reason, if there is a single template, 
				 * immediately calling the 'insert-template' command does not work. 
				 * BUT, if it's called a bit later, it does. Hence the minor timeout.
				 */
				if (templateFileCount === 1) {
					setTimeout(this.insertTemplate, DELAY_IN_MILLISECONDS)
				}

				if (templateFileCount > 1) {
					this.insertTemplate();
				}
			}))
	}

	async getTemplatesFolder() {
		//@ts-expect-error
		const templatesSettings = await this.app.vault.readConfigJson('templates')
		return templatesSettings?.folder

	}

	getFilesInFolder(folderPath: string) {
		const files = this.app.vault.getAllLoadedFiles().filter(file => file.path.startsWith(`${folderPath}/`))
		return files
	}

	isMarkdown(file: TAbstractFile) {
		return file.path.endsWith('.md')
	}

	insertTemplate() {
		//@ts-expect-error
		this.app.commands.executeCommandById('insert-template');
	}
}