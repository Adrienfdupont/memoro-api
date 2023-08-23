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
      this.httpCode = 200;
      this.responseBody = { success: 'The card was successfully added.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async getCards(req: Request, res: Response): Promise<void> {
    let cards: Card[];
    try {
      cards = await this.cardBusiness.getCards(req.params.id);
      this.httpCode = 200;
      this.responseBody = { cards: cards };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async getCard(req: Request, res: Response): Promise<void> {
    let card: Card;
    try {
      card = await this.cardBusiness.getCard(req.body.cardId);
      this.httpCode = 200;
      this.responseBody = { card: card };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async updateCard(req: Request, res: Response): Promise<void> {
    try {
      await this.cardBusiness.updateCard(req.params.id, req.body.label, req.body.translation, req.body.collectionId);
      this.httpCode = 200;
      this.responseBody = { success: 'The card was succesfully updated.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async removeCard(req: Request, res: Response): Promise<void> {
    try {
      await this.cardBusiness.removeCard(req.params.id);
      this.httpCode = 200;
      this.responseBody = { success: 'The card was successfuly deleted.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }
}
