import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import type { File } from "formidable";
import FormData from "form-data";
import fetch from "node-fetch";
import { useState } from "react";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const caseId = req.query.caseId as string;
  const uploadDir = path.join(
    process.cwd(),
    "public/data/case-files",
    caseId,
    "documents"
  );
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });
    const file = files.file as File | File[] | undefined;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileObj = Array.isArray(file) ? file[0] : file;

    const fileName = fileObj.newFilename;
    const originalName = fileObj.originalFilename;
    const name = fields.title || originalName || fileName;
    const type = fields.type || "Document";
    const date = new Date().toISOString().split("T")[0];

    // Get the extension from the original file
    const ext = path.extname(originalName || fileName) || '';
    // Use the exact user input for the filename (case sensitive, with spaces/special chars), plus extension
    let baseName = String(name);
    let userFileName = baseName + ext;
    let userFilePath = path.join(uploadDir, userFileName);
    let counter = 1;
    while (fs.existsSync(userFilePath)) {
      userFileName = `${baseName} (${counter})${ext}`;
      userFilePath = path.join(uploadDir, userFileName);
      counter++;
    }

    // Rename the uploaded file to the exact user-provided name (or unique name)
    if (userFileName !== fileName) {
      fs.renameSync(path.join(uploadDir, fileName), userFilePath);
    }

    // Update documents.json
    const documentsJsonPath = path.join(uploadDir, "documents.json");
    let documents = [];
    if (fs.existsSync(documentsJsonPath)) {
      documents = JSON.parse(fs.readFileSync(documentsJsonPath, "utf-8"));
    }

    let nextId =
      documents.length > 0
        ? Math.max(
            0,
            ...documents
              .map((doc: any) => parseInt(doc.id, 10))
              .filter((n: number) => !isNaN(n))
          ) + 1
        : 1;

    documents.push({ id: nextId, name: userFileName, type, date });

    if (fileObj.mimetype?.startsWith("audio/")) {
      try {
        const transcript = await transcribeAudio(
          userFilePath,
          fileObj.mimetype || "audio/mpeg",
          userFileName
        );

        const baseName = path.parse(userFileName).name;
        const transcriptFilename = `${baseName} Transcript.txt`;
        const transcriptPath = path.join(uploadDir, transcriptFilename);
        fs.writeFileSync(transcriptPath, transcript, "utf-8");

        documents.push({
          id: nextId + 1,
          name: [transcriptFilename],
          type: ["Transcript"],
          date,
        });
      } catch (err) {
        console.error("Transcription failed:", err);
      }
    }

    fs.writeFileSync(
      documentsJsonPath,
      JSON.stringify(documents, null, 2),
      "utf-8"
    );

    return res.status(200).json({ success: true });
  });
}

async function transcribeAudio(
  filepath: string,
  mimetype: string,
  originalFilename: string
): Promise<string> {
  const formData = new FormData();
  const fileStream = fs.createReadStream(filepath);

  formData.append("file", fileStream, {
    filename: originalFilename || "audio.mp3",
    contentType: mimetype || "audio/mpeg",
  });

  const headers = formData.getHeaders();
  const contentLength = await new Promise<number>((resolve, reject) => {
    formData.getLength((err, length) => {
      if (err) reject(err);
      else resolve(length);
    });
  });
  headers["Content-Length"] = contentLength;

  const response = await fetch("http://localhost:8000/transcribe", {
    method: "POST",
    body: formData as any,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Transcription API error:", errorText);
    throw new Error(`Transcription failed: ${response.status}`);
  }

  const result = await response.json() as { transcript: string };
  return result.transcript;
}
