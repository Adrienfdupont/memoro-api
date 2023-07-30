import ConnectionHelper from "../helper/ConnectionHelper";
import Card from "../types/Card";
import StatusMsgError from "../errors/StatusMsgError";
import { SqlError } from "mariadb";

export default class CardBusiness {
  static async getCards(collectionId: number): Promise<Card[]> {
    const sql = "SELECT c.* FROM cards c INNER JOIN collections col ON c.collection_id = col.id WHERE col.id = ?";
    const placeholders = [collectionId.toString()];
    let cards: Card[];
    let queryCards: any[];

    try {
      queryCards = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    cards = queryCards.map((result) => {
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
    const sql = "SELECT * FROM cards WHERE id = ?";
    const placeholder = [cardId];
    let queryCard: any[];
    let card: Card;

    try {
      queryCard = await ConnectionHelper.performQuery(sql, placeholder);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    if (queryCard.length === 0) {
      throw new StatusMsgError(404, "This card was not found.");
    }

    card = {
      id: queryCard[0].id,
      label: queryCard[0].label,
      translation: queryCard[0].translation,
      collectionId: queryCard[0].collection_id,
    };

    return card;
  }

  static async addCard(label: string, translation: string, collectionId: number): Promise<void> {
    const sql = "INSERT INTO cards(label, translation, collection_id) VALUES(?, ?, ?)";
    const placeholders = [label, translation, collectionId.toString()];
    let sqlResult: any;

    if (label.length === 0 || translation.length === 0) {
      throw new StatusMsgError(400, "Please provide a label and a translation.");
    }

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new StatusMsgError(409, "You already own a card with this label.");
      }
    }

    if (sqlResult.affectedRows === 0) {
      throw new StatusMsgError(500, "Internal server error.");
    }
  }

  static async updateCard(cardId: string, label: string, translation: string, collectionId: number): Promise<void> {
    const sql = "UPDATE cards SET label = ?, translation = ?, collection_id = ? WHERE id = ?";
    const placeholders = [label, translation, collectionId.toString(), cardId];
    let sqlResult: any;

    if (label.length === 0 || translation.length === 0) {
      throw new StatusMsgError(400, "Please provide a label and a translation.");
    }

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new StatusMsgError(409, "You already own a card with this label.");
      }
    }

    if (sqlResult.affectedRows === 0) {
      throw new StatusMsgError(404, "This card was not found.");
    }
  }

  static async removeCard(cardId: string): Promise<void> {
    const sql = "DELETE FROM cards WHERE id = ?";
    const placeholders = [cardId];
    let sqlResult: any;

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    if (sqlResult.affectedRows === 0) {
      throw new StatusMsgError(404, "This card was not found.");
    }
  }
}
