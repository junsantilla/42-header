const vscode = require("vscode");
const os = require("os");

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
	const username = os.userInfo().username;

	// Get the current user's email (assuming it is stored in the environment variable USER_EMAIL)
	const userEmail = process.env.USER_EMAIL || "unknown@example.com";

	// Padding
	const padding = "";

	editor.edit((editBuilder) => {
		editBuilder.insert(
			position,
			`/* ************************************************************************** */\n` +
				`/*                                                                            */\n` +
				`/*                                                        :::      ::::::::   */\n` +
				`/*   ${fileName.padEnd(
					43
				)}        :+:      :+:    :+:   */\n` +
				`/*                                                    +:+ +:+         +:+     */\n` +
				`/*   By: ${username} <${userEmail}> ${padding.padEnd(
					6
				)}  +#+  +:+       +#+        */\n` +
				`/*                                                +#+#+#+#+#+   +#+           */\n` +
				`/*   Created: ${currentDate} by ${username.padEnd(
					17
				)} #+#    #+#             */\n` +
				`/*   Updated: ${currentDate} by ${username.padEnd(
					16
				)} ###   ########.fr       */\n` +
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

		editor.edit((editBuilder) => {
			editBuilder.replace(
				new vscode.Range(
					updatedPosition,
					updatedPosition.translate(0, updatedLine.length)
				),
				`/*   Updated: ${currentDate} by ${username.padEnd(
					16
				)} ###   ########.fr       */`
			);
		});
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
