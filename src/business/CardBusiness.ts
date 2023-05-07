import ConnectionHelper from "../helper/ConnectionHelper";
import Card from "../types/Card";

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

  static async addCard(inputLabel: string, inputValue: string, userId: number): Promise<void> {
    const sql: string = "INSERT INTO cards(label, translation, user_id) VALUES(?, ?, ?)";
    const placeholders: string[] = [inputLabel, inputValue, userId.toString()];
    await ConnectionHelper.performQuery(sql, placeholders);
  }
}
