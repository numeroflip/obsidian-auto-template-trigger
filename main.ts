import { Plugin, TAbstractFile, TFile } from 'obsidian';

export default class AutoTemplatePromptPlugin extends Plugin {
	isReady = false;

	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.isReady = true
		})

		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {

				if (!file) {
					return
				}

				const shouldTriggerPrompt = await this.shouldTriggerTemplatePrompt(file)

				if (shouldTriggerPrompt) {
					this.insertTemplate();
				}
			}))
	}

	async shouldTriggerTemplatePrompt(file: TFile): Promise<Boolean> {
		if (!this.isReady || !this.isMarkdown(file)) {
			return false;
		}

		const isFileNew = file.stat.ctime === file.stat.mtime;
		const isFileEmpty = file.stat.size === 0;
		

		if (!isFileNew || !isFileEmpty) {
			return false;
		}

		const isFileFocused = this.app.workspace.getActiveFile()?.path === file.path

		if (!isFileFocused) {
			return false
		}

		const templatesFolder = await this.getTemplatesFolder();
		if (!templatesFolder) {
			return false;
		}

		const isFileInTemplatesFolder = file.path.startsWith(templatesFolder)
		if (isFileInTemplatesFolder) {
			return false;
		}

		return true
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
