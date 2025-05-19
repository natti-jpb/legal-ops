import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// In a real application, this would be a database model
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
    userId: "1", // Associated with lawyer1
    participants: [
      { name: "Maria Rodriguez", role: "Prosecutor", firm: "District Attorney's Office" },
      { name: "Raj Patel", role: "Defense Attorney", firm: "Patel & Associates" },
      { name: "Michael Johnson", role: "Defendant" },
      { name: "Hon. Maria Garcia", role: "Judge", firm: "Superior Court" },
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
    userId: "2", // Associated with lawyer2
  },
];

// GET all cases or filter by userId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  try {
    // Filter cases by userId if provided
    const filteredCases = userId 
      ? casesData.filter(c => c.userId === userId)
      : casesData;
    
    return NextResponse.json(filteredCases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - create new case
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.type || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate case ID (in a real app, this would be handled by the database)
    const casePrefix = body.type === 'Criminal' ? 'CR' : 
                      body.type === 'Civil' ? 'CV' : 
                      body.type === 'Family' ? 'FA' : 
                      body.type === 'Probate' ? 'PR' : 'CA';
                      
    const newId = `${casePrefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create new case object
    const newCase = {
      id: newId,
      title: body.title,
      type: body.type,
      status: body.status || 'Active',
      court: body.court,
      judge: body.judge,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      }),
      transcriptCount: 0,
      description: body.description || '',
      filingDate: body.filingDate || new Date().toLocaleDateString('en-US', {
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      }),
      userId: body.userId,
      participants: body.participants || [],
    };
    
    // In a real app, save to database
    casesData.push(newCase);
    
    // Revalidate the cases page to update cache
    revalidatePath('/cases');
    
    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 