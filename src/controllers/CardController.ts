import { Request, Response } from 'express';
import Card from '../types/Card';
import CoreController from './CoreController';
import ConnectionHelper from '../helpers/ConnectionHelper';
import { SqlError } from 'mariadb';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';

export default class CardController extends CoreController {
  constructor() {
    super();
  }

  public async addCard(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.label?.length === 0 || req.body.translation?.length === 0) {
        throw new BadRequestError();
      }

      const sql = 'INSERT INTO cards(label, translation, collection_id) VALUES(?, ?, ?)';
      const placeholders = [req.body.label, req.body.translation, req.body.collectionId];
  
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

  public async getCards(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT c.* FROM cards c INNER JOIN collections col ON c.collection_id = col.id WHERE col.id = ?';
    const placeholders = [req.params.id];
    const queryResults: any = await ConnectionHelper.performQuery(sql, placeholders);

    const cards: Card[] = queryResults.map((result: any) => {
      return {
        id: result.id,
        label: result.label,
        translation: result.translation,
        collectionId: result.collection_id,
      };
    });
    
    this.httpCode = 200;
    res.status(this.httpCode).json(cards);
  }

  public async getCard(req: Request, res: Response): Promise<void> {
    try {
      const sql = 'SELECT * FROM cards WHERE id = ?';
      const placeholder = [req.params.id];
      const queryResult: any = await ConnectionHelper.performQuery(sql, placeholder);
  
      if (queryResult?.length === 0) {
        throw new NotFoundError();
      }

      const card: Card = {
        id: queryResult[0].id,
        label: queryResult[0].label,
        translation: queryResult[0].translation,
        collectionId: queryResult[0].collection_id,
      };
      this.httpCode = 200;
      res.status(this.httpCode).json(card);
      
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
      res.status(this.httpCode).end();
    }
  }

  public async updateCard(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.newLabel?.length === 0 || req.body.newTranslation?.length === 0) {
        throw new BadRequestError();
      }
      
      const sql = 'UPDATE cards SET label = ?, translation = ?, collection_id = ? WHERE id = ?';
      const placeholders = [req.body.newLabel, req.body.newTranslation, req.body.collectionId, req.body.id];

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

  public async removeCard(req: Request, res: Response): Promise<void> {
    const sql = 'DELETE FROM cards WHERE id = ?';
    const placeholders = [req.params.id];
    await ConnectionHelper.performQuery(sql, placeholders);
    
    this.httpCode = 204;
    res.status(this.httpCode).end();
  }
}
