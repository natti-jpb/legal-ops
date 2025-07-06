import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const caseId = req.query.caseId as string;
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing document id" });

  const documentsDir = path.join(process.cwd(), "public/data/case-files", caseId, "documents");
  const documentsJsonPath = path.join(documentsDir, "documents.json");
  const filePath = path.join(documentsDir, id);

  try {
    // Remove from documents.json
    let documents = [];
    if (fs.existsSync(documentsJsonPath)) {
      documents = JSON.parse(fs.readFileSync(documentsJsonPath, "utf-8"));
    }
    const newDocuments = documents.filter((doc: any) => doc.id !== id);
    fs.writeFileSync(documentsJsonPath, JSON.stringify(newDocuments, null, 2), "utf-8");

    // Delete the file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: "Failed to delete document", details: message });
  }
} 