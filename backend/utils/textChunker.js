/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{ content: string, chunkIndex: number, pageNumber: number }>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    console.log("chunkText received text length:", text?.length);

    if (!text || text.trim().length === 0) {
        return [];
    }

    const cleanedText = text
        .replace(/\r\n/g, "\n")
        .replace(/\s+/g, " ")
        .replace(/\n\s+/g, "\n")
        .replace(/\s+\n/g, "\n")
        .trim();

    const paragraphs = cleanedText
        .split(/\n+/)
        .filter((p) => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // If paragraph is too large, split by words
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join("\n\n"),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0,
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);

                chunks.push({
                    content: chunkWords.join(" "),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0,
                });

                if (i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        // If adding paragraph exceeds chunk size
        if (
            currentWordCount + paragraphWordCount > chunkSize &&
            currentChunk.length > 0
        ) {
            chunks.push({
                content: currentChunk.join("\n\n"),
                chunkIndex: chunkIndex++,
                pageNumber: 0,
            });

            const prevWords = currentChunk.join(" ").split(/\s+/);
            const overlapText = prevWords
                .slice(-Math.min(overlap, prevWords.length))
                .join(" ");

            currentChunk = overlapText
                ? [overlapText, paragraph.trim()]
                : [paragraph.trim()];

            currentWordCount =
                overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join("\n\n"),
            chunkIndex: chunkIndex++,
            pageNumber: 0,
        });
    }

    return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    const stopWords = new Set([
        "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
        "in", "with", "to", "for", "of", "as", "by", "this", "that", "it",
    ]);

    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word && !stopWords.has(word));

    const scoredChunks = chunks.map((chunk) => {
        const text = chunk.content.toLowerCase();
        let score = 0;

        for (const word of queryWords) {
            if (text.includes(word)) {
                score += 1;
            }
        }

        return { ...chunk, score };
    });

    return scoredChunks
        .filter((chunk) => chunk.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxChunks);
};
