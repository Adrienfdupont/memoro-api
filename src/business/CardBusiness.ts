import ConnectionHelper from "../helper/ConnectionHelper";
import Card from "../types/Card";
import StatusMsgError from "../errors/StatusMsgError";
import { SqlError } from "mariadb";

export default class CardBusiness {
  static async getCards(userId: number): Promise<Card[]> {
    const sql: string = "SELECT * FROM cards WHERE user_id = ?";
    const placeholders: string[] = [userId.toString()];
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
        userId: result.user_id,
      };
    });

    return cards;
  }

  static async getCard(cardId: string): Promise<Card> {
    const sql: string = "SELECT * FROM cards WHERE id = ?";
    const placeholder: string[] = [cardId];
    let queryCard: any[];

    try {
      queryCard = await ConnectionHelper.performQuery(sql, placeholder);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    if (queryCard.length === 0) {
      throw new StatusMsgError(404, "This card was not found.");
    }

    const card: Card = {
      id: queryCard[0].id,
      label: queryCard[0].label,
      translation: queryCard[0].translation,
      userId: queryCard[0].user_id,
    };

    return card;
  }

  static async addCard(label: string, translation: string, userId: number): Promise<void> {
    const sql: string = "INSERT INTO cards(label, translation, user_id) VALUES(?, ?, ?)";
    const placeholders: string[] = [label, translation, userId.toString()];
    let sqlResult: any;

    if (label.length === 0 || translation.length === 0) {
      throw new StatusMsgError(400, "Please provide a username and a password.");
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

  static async updateCard(cardId: string, label: string, translation: string, authUserId: number): Promise<void> {
    const sql: string = "UPDATE cards SET label = ?, translation = ? WHERE id = ? AND user_id = ?";
    const placeholders: string[] = [label, translation, cardId, authUserId.toString()];
    let sqlResult: any;

    if (label.length === 0 || translation.length === 0) {
      throw new StatusMsgError(400, "Please provide a username and a password.");
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

  static async removeCard(cardId: string, authUserId: number): Promise<void> {
    const sql: string = "DELETE FROM cards WHERE id = ? AND user_id = ?";
    const placeholders: string[] = [cardId, authUserId.toString()];
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

  static async removeUserCards(userId: number): Promise<void> {
    const sql: string = "DELETE FROM cards WHERE user_id = ?";
    const placeholders: string[] = [userId.toString()];

    try {
      await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }
  }
}
