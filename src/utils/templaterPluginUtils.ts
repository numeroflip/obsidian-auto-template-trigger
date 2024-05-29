import { Plugin, TFile } from "obsidian";

const TEMPLATER_PLUGIN_NAME = "templater-obsidian";

interface TemplaterFolder {
	folder: string;
	template: string;
}

interface TemplaterPlugin {
	settings?: {
		enable_folder_templates: boolean;
		folder_templates: TemplaterFolder[];
	};
}

export function shouldPreventTriggerIfTemplaterPluginUsed(
	plugin: Plugin,
	file: TFile
) {
	//@ts-expect-error: app.plugins.plugins is not typed globally
	const templaterPlugin = plugin.app.plugins?.plugins?.[
		TEMPLATER_PLUGIN_NAME
	] as TemplaterPlugin;
	if (!templaterPlugin) {
		return false;
	}

	const areTemplaterFoldersEnabled =
		!!templaterPlugin?.settings?.enable_folder_templates;

	if (!areTemplaterFoldersEnabled) {
		return false;
	}

	const templaterFolders = templaterPlugin?.settings?.folder_templates.map(
		({ folder }) => folder
	);

	if (!Array.isArray(templaterFolders)) {
		return false;
	}

	const isFileInTemplaterFolder = templaterFolders.some((templaterFolder) =>
		file.path.startsWith(templaterFolder + "/")
	);

	if (isFileInTemplaterFolder) {
		return true;
	}

	return false;
}
