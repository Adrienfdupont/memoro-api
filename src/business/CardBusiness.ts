import ConnectionHelper from '../helper/ConnectionHelper';
import Card from '../types/Card';
import BusinessError from '../errors/BusinessError';
import { SqlError } from 'mariadb';

export default class CardBusiness {
  static async getCards(collectionId: number): Promise<Card[]> {
    const sql = 'SELECT c.* FROM cards c INNER JOIN collections col ON c.collection_id = col.id WHERE col.id = ?';
    const placeholders = [collectionId.toString()];
    let cards: Card[];
    let queryResult: any[];

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    cards = queryResult.map((result) => {
      return {
        id: result.id,
        label: result.label,
        translation: result.translation,
        collectionId: result.collection_id,
      };
    });

    return cards;
  }

  static async getCard(cardId: string): Promise<Card> {
    const sql = 'SELECT * FROM cards WHERE id = ?';
    const placeholder = [cardId];
    let queryResult: any[];
    let card: Card;

    queryResult = await ConnectionHelper.performQuery(sql, placeholder);

    if (queryResult.length === 0) {
      throw new BusinessError(404, 'This card was not found.');
    }

    card = {
      id: queryResult[0].id,
      label: queryResult[0].label,
      translation: queryResult[0].translation,
      collectionId: queryResult[0].collection_id,
    };

    return card;
  }

  static async addCard(label: string, translation: string, collectionId: number): Promise<void> {
    const sql = 'INSERT INTO cards(label, translation, collection_id) VALUES(?, ?, ?)';
    const placeholders = [label, translation, collectionId.toString()];
    let queryResult: any;

    if (label.length === 0 || translation.length === 0) {
      throw new BusinessError(400, 'Please provide a label and a translation.');
    }

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, 'You already own a card with this label.');
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }

  static async updateCard(cardId: string, label: string, translation: string, collectionId: number): Promise<void> {
    const sql = 'UPDATE cards SET label = ?, translation = ?, collection_id = ? WHERE id = ?';
    const placeholders = [label, translation, collectionId.toString(), cardId];
    let queryResult: any;

    if (label.length === 0 || translation.length === 0) {
      throw new BusinessError(400, 'Please provide a label and a translation.');
    }

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, 'You already own a card with this label.');
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }

  static async removeCard(cardId: string): Promise<void> {
    const sql = 'DELETE FROM cards WHERE id = ?';
    const placeholders = [cardId];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }
}
