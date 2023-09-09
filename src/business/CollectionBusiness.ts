import { SqlError } from 'mariadb';
import BusinessError from '../errors/BusinessError';
import ConnectionHelper from '../helpers/ConnectionHelper';
import Collection from '../types/Collection';

export default class CollectionBusiness {
  public async addCollection(
    name: string,
    lastOPen: string,
    userId: string
  ): Promise<void> {
    const sql =
      'INSERT INTO collections (name, last_open, user_id) VALUES (?, ?, ?)';
    const placeholders = [name, lastOPen, userId];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(
          409,
          'The collection already exists for this user.'
        );
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }

  public async getCollections(userId: string): Promise<Collection[]> {
    const sql =
      'SELECT c.* FROM collections c INNER JOIN users u ON c.user_id = u.id \
      WHERE u.id = ?';
    const placeholders = [userId];
    let queryResults: any[];
    let collections: Collection[];

    queryResults = await ConnectionHelper.performQuery(sql, placeholders);

    collections = queryResults.map((result) => {
      return {
        id: result.id,
        name: result.name,
        lastOpen: result.last_open,
        userId: result.user_id,
      };
    });

    return collections;
  }

  public async getCollection(collectionId: string): Promise<Collection> {
    const sql = 'SELECT * FROM collections WHERE id = ?';
    const placeholders = [collectionId];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    const collection = {
      id: queryResult[0].id,
      name: queryResult[0].name,
      lastOpen: queryResult[0].last_open,
      userId: queryResult[0].user_id,
    };

    return collection;
  }

  public async updateCollection(
    collectionId: string,
    newName: string,
    newLastOpen: string
  ): Promise<void> {
    const sql = 'UPDATE collections SET name = ?, last_open = ? WHERE id = ?';
    const placeholders = [newName, newLastOpen, collectionId];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(
          409,
          'The collection already exists for this user.'
        );
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }

  public async removeCollection(collectionId: string): Promise<void> {
    const sql = 'DELETE FROM collections WHERE id = ?';
    const placeholders = [collectionId];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }
}
