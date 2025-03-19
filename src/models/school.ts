import { pool } from "../config/db";

export interface School {
  id?: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Add School
export const addSchool = async (school: School) => {
  const query = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
  try {
    const [result] = await pool.execute(query, [
      school.name,
      school.address,
      school.latitude,
      school.longitude,
    ]);
    return result;
  } catch (error) {
    console.error("❌ Error inserting school:", error);
    throw error;
  }
};

// Get all Schools
export const getAllSchools = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM schools");
    return rows as School[];
  } catch (error) {
    console.error("❌ Error fetching schools:", error);
    throw error;
  }
};

// ✅ Update School
export const updateSchool = async (id: number, updateData: Partial<School>) => {
  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");

  const values = Object.values(updateData);
  values.push(id);

  const query = `UPDATE schools SET ${fields} WHERE id = ?`;
  
  try {
    const [result] = await pool.execute(query, values);
    return result as any as { affectedRows: number }; // ✅ Proper type assertion
  } catch (error) {
    console.error("❌ Error updating school:", error);
    throw error;
  }
};

// ✅ Delete School
export const deleteSchool = async (id: number) => {
  const query = `DELETE FROM schools WHERE id = ?`;
  
  try {
    const [result] = await pool.execute(query, [id]);
    return result as any as { affectedRows: number }; // ✅ Proper type assertion
  } catch (error) {
    console.error("❌ Error deleting school:", error);
    throw error;
  }
};
