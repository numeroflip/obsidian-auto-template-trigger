import { Plugin, TAbstractFile, TFile } from "obsidian";
import { shouldPreventTriggerIfTemplaterPluginUsed } from "./utils/templaterPluginUtils";
const TEMPLATE_SUGGESTION_CLASS = "suggestion-item";

export default class AutoTemplatePromptPlugin extends Plugin {
	isReady = false;

	async onload() {
		this.app.workspace.onLayoutReady(() => {
			this.isReady = true;
		});

		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				if (!file) {
					return;
				}

				const shouldTriggerPrompt =
					await this.shouldTriggerTemplatePrompt(file);

				if (shouldTriggerPrompt) {
					this.handleTemplateTrigger();
				}
			})
		);
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

		const isFileFocused =
			this.app.workspace.getActiveFile()?.path === file.path;

		if (!isFileFocused) {
			return false;
		}

		const templatesFolder = await this.getTemplatesFolder();
		if (!templatesFolder) {
			return false;
		}

		const isFileInTemplatesFolder = file.path.startsWith(templatesFolder);
		if (isFileInTemplatesFolder) {
			return false;
		}

		if (shouldPreventTriggerIfTemplaterPluginUsed(this, file)) {
			return false;
		}

		return true;
	}

	async getTemplatesFolder() {
		//@ts-expect-error
		const templatesSettings = await this.app.vault.readConfigJson(
			"templates"
		);
		return templatesSettings?.folder;
	}

	isMarkdown(file: TAbstractFile) {
		return file.path.endsWith(".md");
	}

	triggerTemplatePrompt() {
		//@ts-expect-error
		this.app.commands.executeCommandById("insert-template");
	}

	handleTemplateTrigger() {
		this.setModalOpacity(0);

		this.triggerTemplatePrompt();
		const suggestions = document.getElementsByClassName(
			TEMPLATE_SUGGESTION_CLASS
		);

		if (suggestions.length === 1) {
			const suggestion = suggestions[0] as HTMLElement;
			suggestion.click();
		}

		this.setModalOpacity(1);
	}

	setModalOpacity(number: 0 | 1) {
		document.documentElement.style.setProperty(
			"--auto-template-prompt-modal-opacity",
			number.toString()
		);
	}
}
