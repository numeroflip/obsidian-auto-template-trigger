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
					this.triggerTemplatePrompt();
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

		if (this.shouldPreventTriggerIfTemplaterPluginUsed(file)) {
			return false
		}

		return true
	}

	shouldPreventTriggerIfTemplaterPluginUsed(file: TFile){
		//@ts-expect-error: app.plugins.plugins is not typed globally
		const templaterPlugin = this.app.plugins?.plugins?.["templater-obsidian"] as TemplaterPlugin
		if (!templaterPlugin) {
			return false
		}

		const areTemplaterFoldersEnabled = !!templaterPlugin?.settings?.enable_folder_templates 

		if (!areTemplaterFoldersEnabled) {
			return false
		}

		const templaterFolders = templaterPlugin?.settings?.folder_templates.map(({folder}) => folder)

		if (!Array.isArray(templaterFolders)) {
			return false
		}

		const isFileInTemplaterFolder = templaterFolders.some((templaterFolder) => file.path.startsWith(templaterFolder + '/'))

		if (isFileInTemplaterFolder) {
			return true
		}

		return false
	}

	async getTemplatesFolder() {
		//@ts-expect-error
		const templatesSettings = await this.app.vault.readConfigJson('templates')
		return templatesSettings?.folder
	}

	isMarkdown(file: TAbstractFile) {
		return file.path.endsWith('.md')
	}

	triggerTemplatePrompt() {
		//@ts-expect-error
		this.app.commands.executeCommandById('insert-template');
	}
}


interface TemplaterFolder {
	folder: string,
	template: string
}

interface TemplaterPlugin {
	settings?: {
		enable_folder_templates: boolean,
		folder_templates: TemplaterFolder[]
	}
}