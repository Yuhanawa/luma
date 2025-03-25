/**
 * Transform decorators script - alternative approach
 *
 * This is an alternative approach for handling decorators that you can use if
 * the parser enhancements in the main script don't fully resolve the decorator issues.
 * This script can be used as a pre-processing step.
 */

const fs = require("fs");
const path = require("path");

// Check command line arguments
if (process.argv.length !== 4) {
	console.log("Usage: node transform_decorators.js input_dir output_dir");
	process.exit(1);
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Recursively process directory
function processDirectory(dir, outDir) {
	const entries = fs.readdirSync(dir);

	for (const entry of entries) {
		const fullPath = path.join(dir, entry);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			// Create corresponding output directory
			const subOutDir = path.join(outDir, entry);
			if (!fs.existsSync(subOutDir)) {
				fs.mkdirSync(subOutDir, { recursive: true });
			}

			// Process subdirectory recursively
			processDirectory(fullPath, subOutDir);
		} else if (entry.endsWith(".js")) {
			processFile(fullPath, path.join(outDir, entry));
		}
	}
}

// Process a single JavaScript file
function processFile(filePath, outputPath) {
	try {
		const code = fs.readFileSync(filePath, "utf-8");

		// Transform code to handle decorators
		const transformedCode = transformCode(code);

		fs.writeFileSync(outputPath, transformedCode);
		console.log(`Transformed ${filePath} -> ${outputPath}`);
	} catch (error) {
		console.error(`Error processing file ${filePath}: ${error.message}`);
	}
}

// Transform code to handle decorators
function transformCode(code) {
	// Remove decorators (@ annotations)
	let transformedCode = code.replace(/@[\w.]+(\([^)]*\))?/g, "");

	// Handle potential multi-line decorators
	transformedCode = transformedCode.replace(/@[\w.]+\s*\(\s*[\s\S]*?\s*\)/g, "");

	return transformedCode;
}

// Start processing
try {
	processDirectory(inputDir, outputDir);
	console.log("Transformation complete!");
} catch (error) {
	console.error("Error:", error.message);
	process.exit(1);
}
