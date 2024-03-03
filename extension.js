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

	// Prompt user for username, email, and custom domain after extension activation
	vscode.window
		.showInputBox({
			prompt: "Enter your username (optional)",
			placeHolder: "user",
		})
		.then((username) => {
			if (username !== undefined) {
				vscode.workspace
					.getConfiguration()
					.update("42header.username", username, true);
			}
		});

	vscode.window
		.showInputBox({
			prompt: "Enter your email address (optional)",
			placeHolder: "user@student.42.fr",
		})
		.then((email) => {
			if (email !== undefined) {
				vscode.workspace
					.getConfiguration()
					.update("42header.email", email, true);
			}
		});

	vscode.window
		.showInputBox({
			prompt: "Enter the custom domain (optional)",
			placeHolder: ".fr",
		})
		.then((customDomain) => {
			if (customDomain !== undefined) {
				vscode.workspace
					.getConfiguration()
					.update("42header.customDomain", customDomain, true);
			}
		});

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
	const username =
		vscode.workspace.getConfiguration().get("42header.username") ||
		process.env["USER"] ||
		"user";

	// Get the current user's email
	const userEmail =
		vscode.workspace.getConfiguration().get("42header.email") ||
		`${username}@student.42.fr`;

	// Calculate padding for the username and email based on the maximum possible lengths
	const usernamePadding = calculatePadding(username, 8);
	const emailPadding = calculatePadding(userEmail, 28);

	// Combine username and email for padding calculation
	const combinedUsernameEmail = `${username} <${userEmail}>`;

	// Calculate padding for the combined username and email
	const combinedPadding = calculatePadding(combinedUsernameEmail, 28);

	// Get the custom domain or use ".fr" as default
	let customDomain =
		vscode.workspace.getConfiguration().get("42header.customDomain") ||
		".fr";

	// Enforce a maximum of 8 characters for the custom domain extension
	if (customDomain.length > 8) {
		customDomain = customDomain.slice(0, 8);
	}

	// Calculate additional spaces based on the length of the custom domain
	const customDomainSpaces = " ".repeat(8 - customDomain.length);

	// Calculate padding for the following line
	const followingLinePadding = calculatePadding(combinedUsernameEmail, 41);

	editor.edit((editBuilder) => {
		editBuilder.insert(
			position,
			`/* ************************************************************************** */\n` +
				`/*                                                                            */\n` +
				`/*                                                        :::      ::::::::   */\n` +
				`/*   ${fileName}${calculatePadding(
					fileName,
					43
				)}        :+:      :+:    :+:   */\n` +
				`/*                                                    +:+ +:+         +:+     */\n` +
				`/*   By: ${username} <${userEmail}> ${followingLinePadding} #+#  +:+       +#+        */\n` +
				`/*                                                +#+#+#+#+#+   +#+           */\n` +
				`/*   Created: ${currentDate} by ${username}${calculatePadding(
					username,
					17
				)} #+#    #+#             */\n` +
				`/*   Updated: ${currentDate} by ${username}${calculatePadding(
					username,
					16
				)} ###   ########${customDomain}${customDomainSpaces}  */\n` +
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
				`/*   Updated: ${currentDate} by ${username}${usernamePadding} ###   ########${customDomain}       */`
			);
		});
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
