import { SqlError } from "mariadb";
import StatusMsgError from "../errors/StatusMsgError";
import ConnectionHelper from "../helper/ConnectionHelper";
import Collection from "../types/Collection";

export default class CollectionBusiness {
  static async addCollection(name: string, userId: number): Promise<void> {
    const sql = "INSERT INTO collections (name, user_id) VALUES (?, ?)";
    const placeholders = [name, userId.toString()];
    let sqlResults: any;

    try {
      sqlResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new StatusMsgError(409, "The collection already exists for this user.");
      }
    }

    if (sqlResults.affectedRows === 0) {
      throw new StatusMsgError(500, "The collection could not be added.");
    }
  }

  static async getCollections(authUserId: number): Promise<Collection[]> {
    const sql = "SELECT c.* FROM collections c INNER JOIN users u ON c.user_id = u.id";
    const placeholders = [authUserId.toString()];
    const queryResults: any[] = await ConnectionHelper.performQuery(sql, placeholders);

    const collections = queryResults.map((result) => {
      return {
        id: result.id,
        name: result.name,
        userId: result.user_id,
      };
    });

    return collections;
  }

  static async getCollection(collectionId: string): Promise<Collection> {
    const sql = "SELECT * FROM collections WHERE id = ?";
    const placeholders = [collectionId];
    const queryResults: any = await ConnectionHelper.performQuery(sql, placeholders);

    const collection = {
      id: queryResults[0].id,
      name: queryResults[0].name,
      userId: queryResults[0].user_id,
    };

    return collection;
  }

  static async updateCollection(collectionId: string, name: string): Promise<void> {
    const sql = "UPDATE collections SET name = ? WHERE id = ?";
    const placeholders = [name, collectionId];
    let sqlResults: any;

    try {
      sqlResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new StatusMsgError(409, "The collection already exists for this user.");
      }
    }

    if (sqlResults.affectedRows === 0) {
      throw new StatusMsgError(500, "The collection could not be updated.");
    }
  }

  static async removeCollection(collectionId: string): Promise<void> {
    const sql = "DELETE FROM collections WHERE id = ?";
    const placeholders = [collectionId];
    await ConnectionHelper.performQuery(sql, placeholders);
  }
}
