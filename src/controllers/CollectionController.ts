import { Request, Response } from 'express';
import Collection from '../types/Collection';
import CoreController from './CoreController';
import ConnectionHelper from "../helpers/ConnectionHelper";
import { SqlError } from "mariadb";
import BadRequestError from '../errors/BadRequestError';
import ConflictError from '../errors/ConflictError';
import NotFoundError from '../errors/NotFoundError';

export default class CollectionController extends CoreController {
  constructor() {
    super();
  }

  public async addCollection(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.name.length === 0) {
        throw new BadRequestError();
      }
      const sql = 'INSERT INTO collections (name, user_id) VALUES (?, ?)';
      const placeholders = [req.body.name, req.body.userId];
  
      try {
        await ConnectionHelper.performQuery(sql, placeholders);
      } catch (err) {
        if (err instanceof SqlError && err.errno === 1062) {
          throw new ConflictError();
        }
      }

      this.httpCode = 204;
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
    }
    res.status(this.httpCode).end();
  }

  public async getCollections(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT c.* FROM collections c INNER JOIN users u ON c.user_id = u.id WHERE u.id = ?';
    const placeholders = [req.params.id];
    const queryResults: any = await ConnectionHelper.performQuery(sql, placeholders);

    const collections: Collection[] = queryResults.map((result: any) => {
      return {
        id: result.id,
        name: result.name,
        lastOpen: result.last_open,
        userId: result.user_id,
      };
    });
    if (queryResults) {
      this.httpCode = 200;
      res.status(200).json(collections);
    }

    res.status(this.httpCode).end();
  }

  public async getCollection(req: Request, res: Response): Promise<void> {
    try {
      const sql = 'SELECT * FROM collections WHERE id = ?';
      const placeholders = [req.params.id];
      const queryResult: any = await ConnectionHelper.performQuery(sql, placeholders);
  
      if (queryResult.length === 0) {
        throw new NotFoundError();
      }

      const collection: Collection = {
        id: queryResult[0].id,
        name: queryResult[0].name,
        lastOpen: queryResult[0].last_open,
        userId: queryResult[0].user_id,
      };
      res.status(200).json(collection);
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
      res.status(this.httpCode).end();
    }
  }

  public async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      const sql = 'UPDATE collections SET name = ?, last_open = ? WHERE id = ?';
      const placeholders = [req.body.newName, req.body.newLastOpen, req.body.id];

      try {
        await ConnectionHelper.performQuery(sql, placeholders);
      } catch (err) {
        if (err instanceof SqlError && err.errno === 1062) {
          throw new ConflictError();
        }
      }

      this.httpCode = 204;
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
    }
    res.status(this.httpCode).end();
  }

  public async removeCollection(req: Request, res: Response): Promise<void> {
    const sql = 'DELETE FROM collections WHERE id = ?';
    const placeholders = [req.params.id];
    await ConnectionHelper.performQuery(sql, placeholders);

    this.httpCode = 204;
    res.status(this.httpCode).end();
  }
}
