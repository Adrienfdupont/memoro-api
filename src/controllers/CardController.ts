import { Request, Response } from 'express';
import CardBusiness from '../business/CardBusiness';
import Card from '../types/Card';
import CoreController from './CoreController';

export default class CardController extends CoreController {
  private cardBusiness: CardBusiness;

  constructor() {
    super();
    this.cardBusiness = new CardBusiness();
  }

  public async addCard(req: Request, res: Response): Promise<void> {
    try {
      await this.cardBusiness.addCard(req.body.label, req.body.translation, req.body.collectionId);
      const responseBody = { success: 'The card was successfully added.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async getCards(req: Request, res: Response): Promise<void> {
    let cards: Card[];
    try {
      cards = await this.cardBusiness.getCards(req.params.id);
      const responseBody = { cards: cards };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async getCard(req: Request, res: Response): Promise<void> {
    let card: Card;
    try {
      card = await this.cardBusiness.getCard(req.body.cardId);
      const responseBody = { card: card };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async updateCard(req: Request, res: Response): Promise<void> {
    try {
      await this.cardBusiness.updateCard(req.params.id, req.body.label, req.body.translation, req.body.collectionId);
      const responseBody = { success: 'The card was succesfully updated.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async removeCard(req: Request, res: Response): Promise<void> {
    try {
      await this.cardBusiness.removeCard(req.params.id);
      const responseBody = { success: 'The card was successfuly deleted.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }
}
