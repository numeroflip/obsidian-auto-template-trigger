import { FolderSuggest } from "./fileSuggest";
import AutoTemplatePromptPlugin from "../main";
import { App, PluginSettingTab, Setting, TAbstractFile, TFile } from "obsidian";
import { getTemplatesFolder } from "utils/utils";

export interface PluginSettings {
	folderSpecificTemplates: { folderPath: string; templateName: string }[];
	disablePrompt: boolean;
	debug: boolean
}

export const DEFAULT_SETTINGS: PluginSettings = {
	folderSpecificTemplates: [],
	disablePrompt: false,
	debug: false
};

export class Settings extends PluginSettingTab {
	plugin: AutoTemplatePromptPlugin;

	constructor(app: App, plugin: AutoTemplatePromptPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Folder specific templates")
			.setHeading()
			.setDesc(
				"Select a template, which will be automatically applied on new notes in the selected folder. The most specific folder path will be used."
			);

		this.plugin.settings.folderSpecificTemplates.map(
			({ folderPath }, index) => {
				new Setting(this.containerEl)
					.addSearch((cb) => {
						new FolderSuggest(this.app, cb.inputEl);
						cb.setValue(folderPath);
						cb.setPlaceholder("Select a folder");
						cb.onChange(() => {
							this.plugin.settings.folderSpecificTemplates[
								index
							].folderPath = cb.getValue();

							this.plugin.saveSettings();
						});
					})
					.addDropdown(async (cb) => {
						const templatesFolder = await getTemplatesFolder(
							this.app
						);
						if (!templatesFolder) {
							return [];
						}
						const templateFiles = this.app.vault
							.getAllLoadedFiles()
							.filter((i) => i.path.startsWith(templatesFolder));

						templateFiles.forEach((file: TAbstractFile) => {
							const initialValue =
								this.plugin.settings.folderSpecificTemplates[
									index
								].templateName;
							if (
								file instanceof TFile &&
								file.extension === "md"
							) {
								cb.addOption(
									file.basename,
									`Template: ${file.basename}`
								);
							}
							cb.setValue(initialValue);
						});

						cb.onChange((value) => {
							this.plugin.settings.folderSpecificTemplates[
								index
							].templateName = value;
							this.plugin.saveSettings();
						});
					})
					.addExtraButton((cb) => {
						cb.setIcon("trash").onClick(() => {
							this.plugin.settings.folderSpecificTemplates.splice(
								index,
								1
							);
							this.plugin.saveSettings();
							// Force refresh
							this.display();
						});
					});
			}
		);
		new Setting(containerEl).addButton((cb) => {
			cb.setButtonText("Add").onClick(() => {
				this.plugin.settings.folderSpecificTemplates.push({
					folderPath: "",
					templateName: "",
				});
				this.plugin.saveSettings();
				// Force refresh
				this.display();
			});
		});

		new Setting(containerEl)
			.setName("Disable prompt")
			.setDesc(
				"Do not prompt for a template when there is no folder-specific template match."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.disablePrompt).onChange(
					async (value) => {
						this.plugin.settings.disablePrompt = value;
						await this.plugin.saveSettings();
					}
				);
			});

		new Setting(containerEl)
			.setName("Debug logging")
			.setDesc(
				"Enable debug logging to the console. Should be disabled, unless you're actively debugging an problem."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.debug).onChange(
					async (value) => {
						this.plugin.settings.debug = value;
						await this.plugin.saveSettings();
					}
				);
			})
	}
}
