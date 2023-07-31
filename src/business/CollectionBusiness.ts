import { SqlError } from "mariadb";
import BusinessError from "../errors/BusinessError";
import ConnectionHelper from "../helper/ConnectionHelper";
import Collection from "../types/Collection";

export default class CollectionBusiness {
  static async addCollection(name: string, userId: number): Promise<void> {
    const sql = "INSERT INTO collections (name, user_id) VALUES (?, ?)";
    const placeholders = [name, userId.toString()];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, "The collection already exists for this user.");
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, "The request could not be processed.");
    }
  }

  static async getCollections(authUserId: number): Promise<Collection[]> {
    const sql = "SELECT c.* FROM collections c INNER JOIN users u ON c.user_id = u.id";
    const placeholders = [authUserId.toString()];
    let queryResults: any[];
    let collections: Collection[];

    queryResults = await ConnectionHelper.performQuery(sql, placeholders);

    collections = queryResults.map((result) => {
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
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    const collection = {
      id: queryResult[0].id,
      name: queryResult[0].name,
      userId: queryResult[0].user_id,
    };

    return collection;
  }

  static async updateCollection(collectionId: string, name: string): Promise<void> {
    const sql = "UPDATE collections SET name = ? WHERE id = ?";
    const placeholders = [name, collectionId];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, "The collection already exists for this user.");
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, "The request could not be processed.");
    }
  }

  static async removeCollection(collectionId: string): Promise<void> {
    const sql = "DELETE FROM collections WHERE id = ?";
    const placeholders = [collectionId];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, "The request could not be processed.");
    }
  }
}
