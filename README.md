# Auto Template Prompt
This is a simple Obsidian plugin. (https://obsidian.md)  

It triggers the template prompt when creating a note. (If you have multiple templates)
If you have a single template, it get's applied every time a note is created.

## Prerequisites
It depends on the core `Templates` plugin to be enabled, and a templates folder is being assigned.

## Usage
Make sure you have one or more template.  

If the built-in template plugin serves your needs weel, this one might enhance your experience. 

## Behavior
### 1. Create a new note
![image](https://user-images.githubusercontent.com/46031874/233847364-48e0ca1e-f8cc-4aff-a582-b9c9fdd215b8.png)
### 2.a The template prompt is automatically triggered (If you have multiple templates)
![image](https://user-images.githubusercontent.com/46031874/233847405-6ad376cc-2d76-42fe-ba12-3e173d38163c.png)

### 2.b The template is automatically applied (If you have a single template)

## Why it was made
I found myself manually triggering a template, whenewer I created a note, which was a bit cumbersome, especially on mobile. 
Now, a prompt is automatically triggered, which simplifies my workflow.

It probably won't work well with other plugins eg Templater or daily notes. 

## Bugs
### The template is applied again, when you duplicate a file. 
It happens when you have a single template, which is usually automatically applied, and you duplicate a file.
You can use the Undo command if that happens. (Ctrl + Z) 
