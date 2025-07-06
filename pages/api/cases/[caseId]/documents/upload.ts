import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import type { File } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const caseId = req.query.caseId as string;
  const uploadDir = path.join(process.cwd(), "public/data/case-files", caseId, "documents");
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });
    const file = files.file as File | File[] | undefined;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let fileObj: File;
    if (Array.isArray(file)) {
      fileObj = file[0];
    } else {
      fileObj = file;
    }

    const fileName = fileObj.newFilename;
    const originalName = fileObj.originalFilename;
    const name = fields.title || originalName || fileName;
    const type = fields.type || "Document";
    const date = new Date().toISOString().split("T")[0];

    // Rename file to match original name if needed
    const finalFileName = originalName || fileName;
    const finalPath = path.join(uploadDir, finalFileName);
    if (finalFileName !== fileName) {
      fs.renameSync(path.join(uploadDir, fileName), finalPath);
    }

    // Update documents.json
    const documentsJsonPath = path.join(uploadDir, "documents.json");
    let documents = [];
    if (fs.existsSync(documentsJsonPath)) {
      documents = JSON.parse(fs.readFileSync(documentsJsonPath, "utf-8"));
    }
    documents.push({
      id: finalFileName,
      name,
      type,
      date,
    });
    fs.writeFileSync(documentsJsonPath, JSON.stringify(documents, null, 2), "utf-8");

    return res.status(200).json({ success: true });
  });
} 