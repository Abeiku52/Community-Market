import pool from '../config/database';
import { User, CreateUserData, UpdateUserData, UserRole } from '../models/User';

export class UserService {
  async createUser(data: CreateUserData): Promise<User> {
    const { email, passwordHash, name, schoolAffiliation, role = UserRole.STAFF } = data;
    
    const query = `
      INSERT INTO users (email, password_hash, name, school_affiliation, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [email, passwordHash, name, schoolAffiliation, role];
    const result = await pool.query(query, values);
    
    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.schoolAffiliation !== undefined) {
      fields.push(`school_affiliation = $${paramCount++}`);
      values.push(data.schoolAffiliation);
    }
    if (data.departureDate !== undefined) {
      fields.push(`departure_date = $${paramCount++}`);
      values.push(data.departureDate);
    }
    if (data.emailVerified !== undefined) {
      fields.push(`email_verified = $${paramCount++}`);
      values.push(data.emailVerified);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  async deleteUser(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      schoolAffiliation: row.school_affiliation,
      departureDate: row.departure_date,
      role: row.role as UserRole,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  
  async getUsersByDomain(domain: string): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      WHERE LOWER(SUBSTRING(email FROM POSITION('@' IN email) + 1)) = LOWER($1)
      AND email_verified = true
    `;
    const result = await pool.query(query, [domain]);
    return result.rows.map(row => this.mapRowToUser(row));
  }

  getUserDomain(email: string): string {
    return email.split('@')[1].toLowerCase();
  }
}

export default new UserService();
