import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// In a real application, this would come from a database
// Sample case data
const casesData = [
  {
    id: "CR-2023-45678",
    title: "State v. Johnson",
    type: "Criminal",
    status: "Active",
    court: "Superior Court",
    judge: "Hon. Maria Garcia",
    lastUpdated: "May 15, 2023",
    transcriptCount: 3,
    description: "Felony assault and battery charges. Defendant pleaded not guilty.",
    filingDate: "April 30, 2023",
    userId: "1",
    participants: [
      { name: "Maria Rodriguez", role: "Prosecutor", firm: "District Attorney's Office" },
      { name: "Raj Patel", role: "Defense Attorney", firm: "Patel & Associates" },
      { name: "Michael Johnson", role: "Defendant" },
      { name: "Hon. Maria Garcia", role: "Judge", firm: "Superior Court" },
    ],
    courtDates: [
      {
        date: "May 14, 2023",
        time: "9:30 AM",
        type: "Initial Hearing",
        location: "Courtroom 302",
        notes: "Defendant arraigned, pleaded not guilty",
      },
      {
        date: "May 15, 2023",
        time: "9:30 AM",
        type: "Evidentiary Hearing",
        location: "Courtroom 302",
        notes: "Officer testimony, motion to suppress denied",
      },
    ],
    documents: [
      {
        id: "transcript-1",
        name: "Day 1 - May 14, 2023",
        type: "Transcript",
        date: "May 14, 2023",
        pages: 42,
        fileUrl: "/api/files/transcript-1",
      },
      {
        id: "transcript-2",
        name: "Day 2 - May 15, 2023",
        type: "Transcript",
        date: "May 15, 2023",
        pages: 68,
        fileUrl: "/api/files/transcript-2",
      },
    ],
  },
  {
    id: "CV-2023-12345",
    title: "Smith v. Acme Corp",
    type: "Civil",
    status: "Active",
    court: "District Court",
    judge: "Hon. Robert Chen",
    lastUpdated: "June 2, 2023",
    transcriptCount: 5,
    description: "Product liability claim for defective manufacturing equipment.",
    filingDate: "March 15, 2023",
    userId: "2",
  },
];

// Find case by ID
function findCaseById(caseId: string) {
  return casesData.find(c => c.id === caseId);
}

// GET specific case by ID
export async function GET(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;
  
  try {
    const caseData = findCaseById(caseId);
    
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(caseData);
  } catch (error) {
    console.error(`Error fetching case ${caseId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - update existing case
export async function PUT(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;
  
  try {
    const body = await request.json();
    const caseIndex = casesData.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    // Update case fields, preserving the id and userId
    const updatedCase = {
      ...casesData[caseIndex],
      ...body,
      id: caseId, // Ensure ID doesn't change
      userId: casesData[caseIndex].userId, // Ensure userId doesn't change
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      }),
    };
    
    // In a real app, update database
    casesData[caseIndex] = updatedCase;
    
    // Revalidate pages that depend on this data
    revalidatePath(`/cases/${caseId}`);
    revalidatePath('/cases');
    
    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error(`Error updating case ${caseId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - delete a case
export async function DELETE(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;
  
  try {
    const caseIndex = casesData.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    // In a real app, delete from database and associated files
    casesData.splice(caseIndex, 1);
    
    // Revalidate the cases page
    revalidatePath('/cases');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting case ${caseId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 