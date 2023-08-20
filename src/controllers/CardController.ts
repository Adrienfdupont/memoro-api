import { Request, Response } from 'express';
import CardBusiness from '../business/CardBusiness';
import BusinessError from '../errors/BusinessError';
import Card from '../types/Card';

export default class CardController {
  static async addCard(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await CardBusiness.addCard(req.body.label, req.body.translation, req.body.collectionId);
      httpCode = 200;
      body = { success: 'The card was successfully added.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async getCards(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    let cards: Card[];
    try {
      cards = await CardBusiness.getCards(req.params.id);
      httpCode = 200;
      body = { cards: cards };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async getCard(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    let card: Card;
    try {
      httpCode = 200;
      card = await CardBusiness.getCard(req.body.cardId);
      body = { card: card };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async updateCard(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await CardBusiness.updateCard(req.params.id, req.body.label, req.body.translation, req.body.collectionId);
      httpCode = 200;
      body = { success: 'The card was succesfully updated.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async removeCard(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await CardBusiness.removeCard(req.params.id);
      httpCode = 200;
      body = { success: 'The card was successfuly deleted.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }
}
