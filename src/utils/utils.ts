import { App, TAbstractFile, TFile } from "obsidian";

export async function getTemplatesFolder(app: App) {
	//@ts-expect-error
	const templatesSettings = await app.vault.readConfigJson("templates");
	return templatesSettings?.folder;
}

export const getTemplateFiles = async (app: App) => {
	const templatesFolder = await getTemplatesFolder(app);
	if (!templatesFolder) {
		return [];
	}

	const templateFiles = app.vault
		.getAllLoadedFiles()
		.filter(
			(i) =>
				i.path.startsWith(templatesFolder) &&
				i.path.endsWith(".md") &&
				i instanceof TFile
		) as TFile[];
	return templateFiles;
};
export const isMarkdown = (file: TAbstractFile) => {
	return file.path.endsWith(".md");
};

/**
 * Sets the opacity of the obsidian prompts.
 *
 * The default template trigger command triggers a prompt to chose a template.
 * By manipulating the transparent prompt, we can select a specific template automatically, without distracting the user.
 *
 */
export const setPromptOpacity = (number: 0 | 1) => {
	document.documentElement.style.setProperty(
		"--auto-template-prompt-modal-opacity",
		number.toString()
	);
};
