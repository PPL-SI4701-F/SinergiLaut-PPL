import { Project, SyntaxKind, StringLiteral } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function sanitizeFilename(name: string) {
    return name.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').substring(0, 50).replace(/_$/, '');
}

async function main() {
    const project = new Project();
    // Add all e2e test files
    project.addSourceFilesAtPaths('cypress/e2e/**/*.cy.ts');
    
    const files = project.getSourceFiles();
    console.log(`Found ${files.length} test files to process.`);

    for (const file of files) {
        const filePath = file.getFilePath();
        const dir = path.dirname(filePath);
        const baseName = path.basename(filePath, '.cy.ts');

        // Find all 'it' blocks
        const allItCalls = file.getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter(call => {
                const text = call.getExpression().getText();
                return ['it', 'it.only', 'it.skip'].includes(text);
            });

        if (allItCalls.length <= 1) {
            console.log(`Skipping ${baseName}.cy.ts (has ${allItCalls.length} tests)`);
            continue;
        }

        console.log(`Splitting ${baseName}.cy.ts (${allItCalls.length} tests)`);

        for (let i = 0; i < allItCalls.length; i++) {
            // Create a temporary file in memory from the original content
            const tempFile = project.createSourceFile(`temp_${baseName}_${i}.ts`, file.getFullText(), { overwrite: true });
            
            // Find all 'it' blocks in the new file
            const newItCalls = tempFile.getDescendantsOfKind(SyntaxKind.CallExpression)
                .filter(call => {
                    const text = call.getExpression().getText();
                    return ['it', 'it.only', 'it.skip'].includes(text);
                });

            // Delete all 'it' blocks except the i-th one
            for (let j = newItCalls.length - 1; j >= 0; j--) {
                if (j !== i) {
                    const stmt = newItCalls[j].getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
                    if (stmt) {
                        stmt.remove();
                    }
                }
            }

            // Cleanup empty describes
            const describes = tempFile.getDescendantsOfKind(SyntaxKind.CallExpression)
                .filter(call => call.getExpression().getText() === 'describe');
                
            for (let j = describes.length - 1; j >= 0; j--) {
                const describe = describes[j];
                const its = describe.getDescendantsOfKind(SyntaxKind.CallExpression)
                    .filter(c => ['it', 'it.only', 'it.skip'].includes(c.getExpression().getText()));
                if (its.length === 0) {
                    const stmt = describe.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
                    if (stmt) stmt.remove();
                }
            }

            // Format the code to clean up extra whitespace left by removal
            tempFile.formatText();

            // Extract the name of the test to use in filename
            let safeTestName = `TC_${String(i+1).padStart(2, '0')}`;
            /*
            // Optional: try to include actual test name in filename
            const testNameArg = newItCalls[i].getArguments()[0];
            if (testNameArg && testNameArg.getKind() === SyntaxKind.StringLiteral) {
                const testText = (testNameArg as StringLiteral).getLiteralValue();
                safeTestName += '_' + sanitizeFilename(testText);
            }
            */

            const newPath = path.join(dir, `${baseName}_${safeTestName}.cy.ts`);
            fs.writeFileSync(newPath, tempFile.getFullText());
        }

        // Delete the original file
        fs.unlinkSync(filePath);
        console.log(`Deleted ${baseName}.cy.ts`);
    }
}

main().catch(console.error);
