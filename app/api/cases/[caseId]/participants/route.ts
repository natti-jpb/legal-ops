import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to get the path to participants.json for a case
function getParticipantsPath(caseId: string) {
  return path.join(process.cwd(), 'public/data/case-files', caseId, 'participants.json');
}

// GET: Return all participants
export async function GET(_req: NextRequest, { params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const filePath = getParticipantsPath(caseId);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json([], { status: 200 });
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return NextResponse.json(JSON.parse(data));
}

// POST: Add a new participant (expects JSON body)
export async function POST(req: NextRequest, { params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const filePath = getParticipantsPath(caseId);
  const body = await req.json();
  let participants = [];
  if (fs.existsSync(filePath)) {
    participants = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  // Prevent duplicate names
  if (participants.some((p: any) => p.name === body.name)) {
    return NextResponse.json({ error: 'Participant with this name already exists.' }, { status: 400 });
  }
  participants.push(body);
  fs.writeFileSync(filePath, JSON.stringify(participants, null, 2), 'utf-8');
  return NextResponse.json({ success: true });
}

// DELETE: Remove a participant by name (expects JSON body: { name })
export async function DELETE(req: NextRequest, { params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const filePath = getParticipantsPath(caseId);
  const { name } = await req.json();
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'No participants file.' }, { status: 404 });
  }
  let participants = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const newParticipants = participants.filter((p: any) => p.name !== name);
  if (newParticipants.length === participants.length) {
    return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
  }
  fs.writeFileSync(filePath, JSON.stringify(newParticipants, null, 2), 'utf-8');
  return NextResponse.json({ success: true });
} 