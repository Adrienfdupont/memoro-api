import { SqlError } from "mariadb";
import StatusMsgError from "../errors/StatusMsgError";
import ConnectionHelper from "../helper/ConnectionHelper";
import Collection from "../types/Collection";

export default class CollectionBusiness {
  static async getCollections(authUserId: number): Promise<Collection[]> {
    const sql = "SELECT collections.* FROM collections INNER JOIN users ON collections.user_id = users.id";
    const placeholders = [authUserId.toString()];
    let queryResults: any[];

    try {
      queryResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    const collections: Collection[] = queryResults.map((result) => {
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
    let queryResults: any[];

    try {
      queryResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    const collection = {
      id: queryResults[0].id,
      name: queryResults[0].name,
      userId: queryResults[0].user_id,
    };

    return collection;
  }

  static async addCollection(name: string, userId: number): Promise<void> {
    if (name.length === 0) {
      throw new StatusMsgError(400, "Please provide a name.");
    }
    const sql = "INSERT INTO collections (name, user_id) VALUES (?, ?)";
    const placeholders = [name, userId.toString()];
    let sqlResults: any;

    try {
      sqlResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new StatusMsgError(409, "You already own a collection with this name.");
      }
    }
  }

  static async updateCollection(collectionId: string, name: string): Promise<void> {
    if (name.length === 0) {
      throw new StatusMsgError(400, "Please provide a name.");
    }

    const sql = "UPDATE collections SET name = ? WHERE id = ?";
    const placeholders = [name, collectionId];
    let sqlResults: any;

    try {
      sqlResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new StatusMsgError(409, "You already own a collection with this name.");
      }
    }
  }

  static async removeCollection(collectionId: string): Promise<void> {
    const sql = "DELETE FROM collections WHERE id = ?";
    const placeholders = [collectionId];
    let sqlResults: any;

    try {
      sqlResults = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }
  }
}
