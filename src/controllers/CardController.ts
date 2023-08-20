import { Request, Response } from 'express';
import CardBusiness from '../business/CardBusiness';
import Card from '../types/Card';
import CoreController from './CoreController';

export default class CardController extends CoreController {
  static async addCard(req: Request, res: Response): Promise<void> {
    try {
      await CardBusiness.addCard(req.body.label, req.body.translation, req.body.collectionId);
      const responseBody = { success: 'The card was successfully added.' };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async getCards(req: Request, res: Response): Promise<void> {
    let cards: Card[];
    try {
      cards = await CardBusiness.getCards(req.params.id);
      const responseBody = { cards: cards };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async getCard(req: Request, res: Response): Promise<void> {
    let card: Card;
    try {
      card = await CardBusiness.getCard(req.body.cardId);
      const responseBody = { card: card };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async updateCard(req: Request, res: Response): Promise<void> {
    try {
      await CardBusiness.updateCard(req.params.id, req.body.label, req.body.translation, req.body.collectionId);
      const responseBody = { success: 'The card was succesfully updated.' };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async removeCard(req: Request, res: Response): Promise<void> {
    try {
      await CardBusiness.removeCard(req.params.id);
      const responseBody = { success: 'The card was successfuly deleted.' };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }
}
