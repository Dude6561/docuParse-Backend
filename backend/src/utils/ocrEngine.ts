import Tesseract from "tesseract.js";
import path from "path";

export const extractText = async (filePath: string): Promise<string> => {
  const absolutePath = path.resolve(filePath);

  const {
    data: { text },
  } = await Tesseract.recognize(absolutePath, "eng+nep", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
      }
    },
  });

  return text;
};
