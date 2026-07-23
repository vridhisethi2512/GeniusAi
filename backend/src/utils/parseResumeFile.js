const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('./ApiError');
const logger = require('./logger');

const MIN_EXTRACTED_TEXT_LENGTH = 50;

const parseResumeFile = async (filePath, mimeType) => {
  try {
    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const buffer = fs.readFileSync(filePath);
      const result = await pdfParse(buffer);
      extractedText = result.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      throw new ApiError(400, 'Unsupported file type for resume parsing.');
    }

    const cleanedText = extractedText.replace(/\s+/g, ' ').trim();

    if (cleanedText.length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new ApiError(
        422,
        'Could not extract sufficient text from the resume. The file may be scanned/image-based or corrupted.'
      );
    }

    return cleanedText;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Resume parsing failed for ${path.basename(filePath)}: ${error.message}`);
    throw new ApiError(422, 'Failed to parse the uploaded resume file.');
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.warn(`Failed to delete temp resume file ${filePath}: ${err.message}`);
      }
    });
  }
};

module.exports = parseResumeFile;
