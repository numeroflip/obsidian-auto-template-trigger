import { Plugin, TAbstractFile, TFile } from "obsidian";
import { shouldPreventTriggerIfTemplaterPluginUsed } from "./utils/templaterPluginUtils";
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	Settings,
} from "./settings/Settings";
import {
	getTemplateFiles,
	getTemplatesFolder,
	isMarkdown,
	setPromptOpacity,
} from "utils/utils";

const TEMPLATE_SUGGESTION_CLASS = "suggestion-item";
const INSERT_TEMPLATE_COMMAND = "insert-template";

export default class AutoTemplatePromptPlugin extends Plugin {
	isReady = false;
	settings: PluginSettings;
	async onload() {
		setPromptOpacity(1);

		this.app.workspace.onLayoutReady(() => {
			this.isReady = true;
		});
		await this.loadSettings();

		this.addSettingTab(new Settings(this.app, this));

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

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async shouldTriggerTemplatePrompt(file: TFile): Promise<Boolean> {
		let isFileNew: boolean, isFileEmpty: boolean, isFileFocused: boolean;

		if (!this.isReady || !isMarkdown(file)) {
			return false;
		}

		isFileNew = file.stat.ctime === file.stat.mtime;
		isFileEmpty = file.stat.size === 0;
		isFileFocused = this.app.workspace.getActiveFile()?.path === file.path;

		if (!isFileNew || !isFileEmpty || !isFileFocused) {
			return false;
		}

		const templatesFolder = await getTemplatesFolder(app);
		const isFileInTemplatesFolder = file.path.startsWith(templatesFolder);

		if (!templatesFolder || isFileInTemplatesFolder) {
			return false;
		}

		if (shouldPreventTriggerIfTemplaterPluginUsed(this, file)) {
			return false;
		}

		return true;
	}

	async handleTemplateTrigger() {
		const templateFiles = await getTemplateFiles(app);
		if (templateFiles.length === 0) {
			console.error("No template files found");
		}

		if (templateFiles.length === 1) {
			this.applySpecificTemplate(templateFiles[0].basename);
		}

		if (templateFiles.length > 1) {
			const mightHaveAssignedTemplate =
				this.settings.folderSpecificTemplates.length >= 0;

			const assignedTemplate = mightHaveAssignedTemplate
				? this.findAssignedTemplate()
				: null;

			if (assignedTemplate) {
				this.applySpecificTemplate(assignedTemplate);
			}

			if (!assignedTemplate) {
				this.triggerTemplateSelectorPrompt();
			}
		}
	}

	findAssignedTemplate() {
		const currentFolder = this.app.workspace.getActiveFile()?.parent;

		if (!currentFolder) {
			console.error("findAssignedTemplate: No active folder");
			return;
		}

		const rootFolder = "/";
		const pathFragments = currentFolder.path.split("/");

		// get the possible paths, for which we can have assigned templates in the settings
		// eg.: "/", "/folder1", "/folder1/folder2"
		const possiblePaths = pathFragments.reduce(
			(prevPaths, pathFragment) => {
				if (!prevPaths.length) {
					return [pathFragment];
				} else {
					const prevPath = prevPaths[prevPaths.length - 1];
					const newPath = [prevPath, pathFragment].join("/");
					return [...prevPaths, newPath];
				}
			},
			[]
		);
		possiblePaths.push(rootFolder);
		possiblePaths.sort((a, b) => b.length - a.length); // longest paths first, so the first match is the most specific one

		let assignedTemplateSetting:
			| PluginSettings["folderSpecificTemplates"][0]
			| undefined;

		possiblePaths.forEach((path) => {
			if (assignedTemplateSetting) {
				return;
			}
			const foundSetting = this.settings.folderSpecificTemplates.find(
				({ folderPath }) => folderPath === path
			);
			assignedTemplateSetting = foundSetting;
		});
		return assignedTemplateSetting?.templateName;
	}

	applySpecificTemplate(templateName: string) {
		setPromptOpacity(0);
		this.triggerTemplateSelectorPrompt();

		const suggestions = Array.from(
			document.getElementsByClassName(TEMPLATE_SUGGESTION_CLASS)
		);

		const template = suggestions.find(
			(suggestion) => suggestion.textContent === templateName
		);

		if (template instanceof HTMLElement) {
			template.scrollIntoView();
			template.click();
		} else {
			console.error("Template not found: ", templateName);
		}

		setPromptOpacity(1);
	}

	triggerTemplateSelectorPrompt() {
		//@ts-expect-error
		this.app.commands.executeCommandById(INSERT_TEMPLATE_COMMAND);
	}
}
