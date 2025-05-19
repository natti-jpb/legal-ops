import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Simulated user database - in production, this would be a real database
// This is just for demonstration purposes
const users = [
  {
    id: '1',
    username: 'lawyer1',
    password: '$2a$12$Q7wgH2PHmWD5E12izMAG7OQJ8HNdiOXukUTFVr.MKkIeEsa3FGi1m', // hashed "password123"
    name: 'Maria Rodriguez',
    role: 'attorney',
    firm: 'Rodriguez & Associates'
  },
  {
    id: '2',
    username: 'lawyer2',
    password: '$2a$12$Q7wgH2PHmWD5E12izMAG7OQJ8HNdiOXukUTFVr.MKkIeEsa3FGi1m', // hashed "password123"
    name: 'Raj Patel',
    role: 'attorney',
    firm: 'Patel Law Firm'
  }
];

// JWT secret - in production, store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Check if user exists
    const user = users.find(u => u.username === username);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Return user info and token
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        firm: user.firm
      },
      token
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Route to verify if a token is valid
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    // In a real implementation, verify the token
    // For now we just return success
    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
} 