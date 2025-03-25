#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

if (process.argv.length !== 4) {
	console.log("Usage: node get_ajax_func.js input_dir output_dir");
	process.exit(1);
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

function processDirectory(dir, outDir) {
	const entries = fs.readdirSync(dir);

	for (const entry of entries) {
		const fullPath = path.join(dir, entry);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			const subOutDir = path.join(outDir, entry);
			if (!fs.existsSync(subOutDir)) {
				fs.mkdirSync(subOutDir, { recursive: true });
			}
			processDirectory(fullPath, subOutDir);
		} else if (entry.endsWith(".js") || entry.endsWith(".jsx")) {
			processFile(fullPath, path.join(outDir, entry));
		}
	}
}

function processFile(filePath, outputPath) {
	try {
		const code = fs.readFileSync(filePath, "utf-8");

		if (code.length > 5 * 1024 * 1024) {
			console.log(`Skipping large file: ${filePath}`);
			return;
		}

		let ast;
		try {
			ast = parse(code, {
				sourceType: "module", // Handle both modules and scripts
				plugins: [
					"jsx", // Enable JSX parsing
					"typescript", // Enable TypeScript parsing (even if it's not .ts)
					"decorators-legacy", // Handle decorators (legacy syntax)
					"classProperties", // Handle class properties
					"classPrivateProperties", // Handle private class properties
					"classPrivateMethods", // Handle private class methods
					"dynamicImport", // Handle dynamic import()
					"importMeta", // Handle import.meta
					"objectRestSpread", // Handle object rest/spread
					"optionalCatchBinding", // Handle optional catch binding
					"optionalChaining", // Handle optional chaining (?.)
					"nullishCoalescingOperator", // Handle nullish coalescing (??)
					"bigInt", //Handle BigInt
					"asyncGenerators",
				],
			});
		} catch (parseError) {
			console.error(`Error parsing ${filePath}: ${parseError.message}`);
			return; // Exit early if initial parse fails
		}

		const functionsWithAjax = [];

		traverse(ast, {
			//Combine all function types into one visitor
			"FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassMethod|ObjectMethod"(path) {
				let containsAjax = false;
				const functionBody = path.get("body");

				if (!functionBody.isBlockStatement()) {
					return; // Skip if not a block statement (e.g., concise arrow function)
				}

				functionBody.traverse({
					CallExpression(path) {
						const callee = path.get("callee");
						if (callee.isIdentifier({ name: "ajax" })) {
							containsAjax = true;
						} else if (
							callee.isMemberExpression() &&
							(callee.get("object").isIdentifier({ name: "$" }) || callee.get("object").isThisExpression()) &&
							callee.get("property").isIdentifier({ name: "ajax" })
						) {
							containsAjax = true;
						} else if (callee.isIdentifier({ name: "fetch" })) {
							containsAjax = true;
						} else if (callee.isNewExpression() && callee.get("callee").isIdentifier({ name: "XMLHttpRequest" })) {
							containsAjax = true;
						} else if (
							callee.isIdentifier({ name: "axios" }) ||
							(callee.isMemberExpression() && callee.get("object").isIdentifier({ name: "axios" }))
						) {
							containsAjax = true;
						}
					},
				});

				if (containsAjax) {
					functionsWithAjax.push(path.node);
				}
			},
		});

		if (functionsWithAjax.length > 0) {
			const outputCode = functionsWithAjax.map((fn) => generate(fn).code).join("\n\n");
			fs.writeFileSync(outputPath, outputCode);
			console.log(`Processed ${filePath} -> ${outputPath} (${functionsWithAjax.length} functions found)`);
		} else {
			console.log(`No AJAX functions found in ${filePath}`);
		}
	} catch (error) {
		console.error(`Error processing file ${filePath}`, error);
	}
}
try {
	processDirectory(inputDir, outputDir);
	console.log("Processing complete!");
} catch (error) {
	console.error("Error:", error.message);
	process.exit(1);
}
