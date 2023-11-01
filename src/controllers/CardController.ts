import { Request, Response } from 'express';
import Card from '../types/Card';
import CoreController from './CoreController';
import ConnectionHelper from '../helpers/ConnectionHelper';
import { SqlError } from 'mariadb';

export default class CardController extends CoreController {
  constructor() {
    super();
  }

  public async addCard(req: Request, res: Response): Promise<void> {
    if (req.body.label?.length === 0 || req.body.translation?.length === 0) {
      this.httpCode = 400;
    } else {
      const sql = 'INSERT INTO cards(label, translation, collection_id) VALUES(?, ?, ?)';
      const placeholders = [req.body.label, req.body.translation, req.body.collectionId];
      let queryResult: any;

      try {
        queryResult = await ConnectionHelper.performQuery(sql, placeholders);
      } catch (err) {
        if (err instanceof SqlError && err.errno === 1062) {
          this.httpCode = 409;
        }
      }
      if (queryResult.affectedRows === 1) {
        this.httpCode = 204;
      }
    }
    res.status(this.httpCode).end();
  }

  public async getCards(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT c.* FROM cards c INNER JOIN collections col ON c.collection_id = col.id WHERE col.id = ?';
    const placeholders = [req.params.id];
    const queryResults: any = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResults) {
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
    res.status(this.httpCode).end();
  }

  public async getCard(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT * FROM cards WHERE id = ?';
    const placeholder = [req.params.id];
    const queryResult: any = await ConnectionHelper.performQuery(sql, placeholder);

    if (queryResult?.length === 0) {
      this.httpCode = 404;
    } else {
      const card: Card = {
        id: queryResult[0].id,
        label: queryResult[0].label,
        translation: queryResult[0].translation,
        collectionId: queryResult[0].collection_id,
      };
      this.httpCode = 200;
      res.status(this.httpCode).json(card);
    }
    res.status(this.httpCode).end();
  }

  public async updateCard(req: Request, res: Response): Promise<void> {
    if (req.body.newLabel?.length === 0 || req.body.newTranslation?.length === 0) {
      this.httpCode = 400;
    } else {
      const sql = 'UPDATE cards SET label = ?, translation = ?, collection_id = ? WHERE id = ?';
      const placeholders = [req.body.newLabel, req.body.newTranslation, req.body.collectionId, req.body.id];
      let queryResult: any;

      try {
        queryResult = await ConnectionHelper.performQuery(sql, placeholders);
      } catch (err) {
        if (err instanceof SqlError && err.errno === 1062) {
          this.httpCode = 409;
        }
      }
      if (queryResult.affectedRows === 1) {
        this.httpCode = 204;
      }
    }
    res.status(this.httpCode).end();
  }

  public async removeCard(req: Request, res: Response): Promise<void> {
    const sql = 'DELETE FROM cards WHERE id = ?';
    const placeholders = [req.params.id];
    const queryResult: any = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResult.affectedRows === 1) {
      this.httpCode = 204;
    }
    res.status(this.httpCode).end();
  }
}
