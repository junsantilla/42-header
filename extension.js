const vscode = require("vscode");
const os = require("os");

function calculatePadding(dynamicData, maxLength) {
	const dynamicDataLength = dynamicData.length;
	const paddingLength = Math.max(0, maxLength - dynamicDataLength);
	const padding = " ".repeat(paddingLength);
	return padding;
}

function activate(context) {
	console.log('Congratulations, your extension "42-header" is now active!');

	let disposableInsert = vscode.commands.registerCommand(
		"42-header.insertComments",
		function () {
			insertComments();
		}
	);
	context.subscriptions.push(disposableInsert);

	let disposableSave = vscode.workspace.onDidSaveTextDocument((document) => {
		if (
			vscode.window.activeTextEditor &&
			document === vscode.window.activeTextEditor.document
		) {
			updateUpdatedDate();
		}
	});
	context.subscriptions.push(disposableSave);

	let disposableChange = vscode.window.onDidChangeActiveTextEditor(
		(editor) => {
			if (editor) {
				currentEditor = editor;
			}
		}
	);
	context.subscriptions.push(disposableChange);
}

function insertComments() {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage("No active editor found.");
		return;
	}

	const position = editor.selection.active;
	const fileName = editor.document.fileName
		.split("\\")
		.pop()
		.split("/")
		.pop();
	const currentDate = new Date()
		.toISOString()
		.replace(/T/, " ")
		.replace(/\..+/, "");

	// Get the current username
	const username =   vscode.workspace.getConfiguration()
    .get('42header.username') || process.env['USER'] || 'user'

	// Get the current user's email
	const userEmail = vscode.workspace.getConfiguration()
    .get('42header.email') || `${username}@student.42.fr`

	// Calculate padding based on dynamic data
	const fileNamePadding = calculatePadding(fileName, 43);
	const usernamePadding = calculatePadding(username, 8);
	const emailPadding = calculatePadding(userEmail, 31); // Assuming maximum email length

	// Calculate padding for Created and Updated lines
	const createdPadding = calculatePadding(username, 17);
	const updatedPadding = calculatePadding(username, 16);

	editor.edit((editBuilder) => {
		editBuilder.insert(
			position,
			`/* ************************************************************************** */\n` +
				`/*                                                                            */\n` +
				`/*                                                        :::      ::::::::   */\n` +
				`/*   ${fileName}${fileNamePadding}        :+:      :+:    :+:   */\n` +
				`/*                                                    +:+ +:+         +:+     */\n` +
				`/*   By: ${username} <${userEmail}>${usernamePadding}${emailPadding} +#+  +:+       +#+        */\n` +
				`/*                                                +#+#+#+#+#+   +#+           */\n`+
				`/*   Created: ${currentDate} by ${username}${createdPadding} #+#    #+#             */\n` +
				`/*   Updated: ${currentDate} by ${username}${updatedPadding} ###   ########.fr       */\n` +
				`/*                                                                            */\n` +
				`/* ************************************************************************** */\n`
		);
	});
}

function updateUpdatedDate() {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage("No active editor found.");
		return;
	}

	const updatedLine = editor.document
		.getText()
		.split("\n")
		.find((line) => line.includes("Updated:"));

	if (updatedLine) {
		const currentDate = new Date()
			.toISOString()
			.replace(/T/, " ")
			.replace(/\..+/, "");
		const username = os.userInfo().username;
		const updatedPosition = editor.document.positionAt(
			editor.document.getText().indexOf(updatedLine)
		);

		// Calculate padding based on dynamic data
		const usernamePadding = calculatePadding(username, 16);

		editor.edit((editBuilder) => {
			editBuilder.replace(
				new vscode.Range(
					updatedPosition,
					updatedPosition.translate(0, updatedLine.length)
				),
				`/*   Updated: ${currentDate} by ${username}${usernamePadding} ###   ########.fr       */`
			);
		});
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
