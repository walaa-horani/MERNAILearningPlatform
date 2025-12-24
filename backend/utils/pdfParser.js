import fs from "fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<{ text: string, numPages: number }>}
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        console.log("Reading PDF file:", filePath);

        // Read the PDF file as a buffer
        const dataBuffer = await fs.readFile(filePath);
        console.log("PDF file size:", dataBuffer.length, "bytes");

        // Convert Buffer to Uint8Array
        const uint8Array = new Uint8Array(dataBuffer);

        // Load the PDF document
        const loadingTask = getDocument({
            data: uint8Array, // Pass Uint8Array instead of Buffer
            verbosity: 0,
        });

        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;

        console.log("PDF loaded successfully");
        console.log("Number of pages:", numPages);

        let fullText = "";

        // Extract text from each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Combine text items with spaces
            const pageText = textContent.items
                .map((item) => item.str)
                .join(" ");

            fullText += pageText + "\n\n";
        }

        console.log("PDF parsed successfully");
        console.log("Total text length:", fullText.length);

        return {
            text: fullText.trim(),
            numPages: numPages,
            info: {
                numPages: numPages,
            },
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};