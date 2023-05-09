import ConnectionHelper from "../helper/ConnectionHelper";
import Card from "../types/Card";
import BusinessError from "../errors/BusinessError";

export default class CardBusiness {
  static async getCards(userId: number): Promise<Card[]> {
    const sql: string = "SELECT * FROM cards WHERE user_id = ?";
    const placeholders: string[] = [userId.toString()];
    const results: any[] = await ConnectionHelper.performQuery(sql, placeholders);

    const cards: Card[] = results.map((result) => {
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
    const result: any[] = await ConnectionHelper.performQuery(sql, placeholder);

    if (result.length === 0) {
      throw new BusinessError(404, "Aucune carte trouvée");
    }
    const card: Card = {
      id: result[0].id,
      label: result[0].label,
      translation: result[0].translation,
      userId: result[0].user_id,
    };

    return card;
  }

  static async addCard(label: string, translation: string, userId: number): Promise<void> {
    if (label.length === 0 || translation.length === 0) {
      throw new BusinessError(400, "Veuillez fournir un label et sa traduction.");
    }
    const sql: string = "INSERT INTO cards(label, translation, user_id) VALUES(?, ?, ?)";
    const placeholders: string[] = [label, translation, userId.toString()];
    await ConnectionHelper.performQuery(sql, placeholders);
  }

  static async updateCard(cardId: string, label: string, translation: string, authUserId: number): Promise<void> {
    if (label.length === 0 || translation.length === 0) {
      throw new BusinessError(400, "Veuillez fournir un label et sa traduction.");
    }
    // verify that the user has the rights
    const card: Card = await CardBusiness.getCard(cardId);
    if (card.userId !== authUserId) {
      throw new BusinessError(403, "Vous n'avez pas les droits sur cette carte");
    }
    const sql: string = "UPDATE cards SET label = ?, translation=? WHERE id = ?";
    const placeholders: string[] = [label, translation, cardId];
    await ConnectionHelper.performQuery(sql, placeholders);
  }

  static async removeCard(cardId: string, authUserId: number): Promise<void> {
    const card: Card = await CardBusiness.getCard(cardId);
    // verify that the user has the rights
    if (card.userId !== authUserId) {
      throw new BusinessError(403, "Vous n'avez pas les droits sur cette carte");
    }
    const sql: string = "DELETE FROM cards WHERE id = ?";
    const placeholders: string[] = [cardId];
    await ConnectionHelper.performQuery(sql, placeholders);
  }

  static async removeUserCards(userId: number): Promise<void> {
    const sql: string = "DELETE FROM cards WHERE user_id = ?";
    const placeholders: string[] = [userId.toString()];
    await ConnectionHelper.performQuery(sql, placeholders);
  }
}
