import { SqlError } from "mariadb";
import ConnectionHelper from "../helper/ConnectionHelper";
import CardAddResponse from "../types/CardAddResponse";
import Card from "../types/Card";

export default class CardBusiness
{
  static async getCards(userId: number): Promise<Card[]>
  {
    let cards: Card[] = [];
    
    try {
      const sql: string = "SELECT * FROM cards WHERE user_id = ?";
      const placeholders: string[] = [userId.toString()];
      const results: any[] = await ConnectionHelper.performQuery(sql, placeholders);

      cards = results.map((result) => {
        return {
          id: result.id,
          label: result.label,
          translation: result.translation,
          userId: result.user_id,
        };
      });
    } catch (err) {
      console.log(err);
    }
    return cards;
  }

  static async addCard(inputLabel: string, inputValue: string, userId: number): Promise<CardAddResponse>
  {
    const CardAddResponse: CardAddResponse = {
      status: 500,
      body: {
        success: "",
        error: "",
      }
    }

    try {
      // perform the query
      const sql: string = "INSERT INTO cards(label, translation, user_id) VALUES(?, ?, ?)";
      const placeholders: string[] = [inputLabel, inputValue, userId.toString()];
      await ConnectionHelper.performQuery(sql, placeholders);

      // query successful
      CardAddResponse.status = 200;
      CardAddResponse.body.success = "La carte a bien été ajoutée";
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        CardAddResponse.status = 409;
        CardAddResponse.body.error = "Vous possédez déjà une carte avec ce label.";
      } else {
        CardAddResponse.body.error = "Une erreur est survenue";
      }
    }
    return CardAddResponse;
  }
}