import { SqlError } from "mariadb";
import ConnectionHelper from "../helper/ConnectionHelper";
import CardAddResponse from "../types/CardAddResponse";

export default class CardBusiness
{
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
            const sql = "INSERT INTO cards(label, translation, user_id) VALUES(?, ?, ?)";
            const placeholders = [inputLabel, inputValue, userId.toString()];
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