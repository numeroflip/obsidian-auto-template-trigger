# Auto Template Trigger

An [Obsidian](https://obsidian.md) plugin, which automates adding templates to new files.

Automatically apply or prompt for a template when creating a note. Supports assigning templates to folders.

## Behavior

If you have a single template, that will be automatically applied for new files.
If you have multiple templates, a template selector will appear for new files.

You can assign templates to folders, so the assigned template will be automatically applied, when a note is created inside the folder. (instead of the template selector)

## Settings

You can assign specific templates to a folder.
If a file is created inside a specified folder, the assigned template will be automatically applied.

The most specific folder path will take precedence.

This means, if you assign a template for the root folder ("/"), all the new files will automatically apply that template.
Still, you can assign other templates for folders to overwrite that behavior.

If you _only_ want to use folder-specific templates and do not want to be prompted to pick a template, use the `Disable prompt` option.

## Prerequisites

It depends on the core `Templates` plugin to be enabled, and that a a templates folder is assigned.
Make sure you have one or more template.

## Why it was made

I found myself manually triggering a template, whenewer I created a note, which was a bit cumbersome, especially on mobile.
Now, a prompt is automatically triggered, which simplifies my workflow.

It probably won't work well with other plugins eg Templater or daily notes.
