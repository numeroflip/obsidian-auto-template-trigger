import { TAbstractFile, TFile, TFolder } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { getTemplatesFolder } from "../utils/utils";

export class TemplateSuggest extends TextInputSuggest<TFile> {
	async getSuggestions(inputStr: string): Promise<TFile[]> {
		const templatesFolder = await getTemplatesFolder(this.app);
		if (!templatesFolder) {
			return [];
		}
		const templateFiles = this.app.vault
			.getAllLoadedFiles()
			.filter((i) => i.path.startsWith(templatesFolder));
		const files: TFile[] = [];
		const lowerCaseInputStr = inputStr.toLowerCase();

		templateFiles.forEach((file: TAbstractFile) => {
			if (
				file instanceof TFile &&
				file.extension === "md" &&
				file.path.toLowerCase().contains(lowerCaseInputStr)
			) {
				files.push(file);
			}
		});

		return files;
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.basename);
	}

	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.basename;
		this.inputEl.trigger("input");
		this.close();
	}
}

export class FolderSuggest extends TextInputSuggest<TFolder> {
	async getSuggestions(inputStr: string): Promise<TFolder[]> {
		const templatesFolder = await getTemplatesFolder(this.app);

		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const folders: TFolder[] = [];
		const lowerCaseInputStr = inputStr.toLowerCase();
		abstractFiles.forEach((folder: TAbstractFile) => {
			if (
				folder instanceof TFolder &&
				folder.path.toLowerCase().contains(lowerCaseInputStr) &&
				folder.path &&
				folder.path !== templatesFolder
			) {
				folders.push(folder);
			}
		});

		return folders;
	}

	renderSuggestion(file: TFolder, el: HTMLElement): void {
		el.setText(file.path);
	}

	selectSuggestion(file: TFolder): void {
		this.inputEl.value = file.path;
		this.inputEl.trigger("input");
		this.close();
	}
}
