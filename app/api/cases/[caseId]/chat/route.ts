import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const caseId = params.caseId
    const chatFilePath = path.join(process.cwd(), 'public', 'data', 'case-files', caseId, 'chat.json')
    
    // Check if chat file exists
    try {
      const chatData = await fs.readFile(chatFilePath, 'utf-8')
      const messages = JSON.parse(chatData)
      return NextResponse.json(messages)
    } catch (error) {
      // If file doesn't exist, return empty array
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error loading chat messages:', error)
    return NextResponse.json({ error: 'Failed to load chat messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const caseId = params.caseId
    const { messages } = await request.json()
    
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 })
    }
    
    const caseDir = path.join(process.cwd(), 'public', 'data', 'case-files', caseId)
    const chatFilePath = path.join(caseDir, 'chat.json')
    
    // Ensure case directory exists
    try {
      await fs.access(caseDir)
    } catch {
      await fs.mkdir(caseDir, { recursive: true })
    }
    
    // Save messages to chat.json
    await fs.writeFile(chatFilePath, JSON.stringify(messages, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving chat messages:', error)
    return NextResponse.json({ error: 'Failed to save chat messages' }, { status: 500 })
  }
} 