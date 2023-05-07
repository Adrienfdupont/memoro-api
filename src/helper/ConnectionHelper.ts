import mariadb, { Connection } from "mariadb";
import { Pool } from "mariadb";
import dotenv from "dotenv";
dotenv.config();

export default class ConnectionHelper {
  static pool: Pool;

  static createPool(): void {
    ConnectionHelper.pool = mariadb.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  static async performQuery(
    sql: string,
    placeholders: Array<string>
  ): Promise<any> {
    const connection: Connection = await ConnectionHelper.pool.getConnection();

    const result = await connection.query(sql, placeholders);
    connection?.end();
    return result;
  }
}
