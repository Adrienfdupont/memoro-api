import fs from "fs";
import crypto from "crypto";
import ConnectionHelper from "./ConnectionHelper";

export default class SecurityHelper {
  static async generateToken(username: string, userId: number): Promise<string> {
    // generate the header
    const header = JSON.stringify({
      alg: "RSA-SHA256",
      typ: "AWT",
    });

    // generate the payload
    const date = new Date();
    date.setDate(date.getDate() + 30);

    const payload = JSON.stringify({
      username: username,
      userId: userId,
      expirationDate: date,
    });

    // cypher the payload
    const privateKeyBase64: string = process.env.PRIVATE_KEY ?? "";
    const privateKeyContent = Buffer.from(privateKeyBase64, "base64").toString("utf-8");
    const privateKey = crypto.createPrivateKey(privateKeyContent);
    const signer = crypto.createSign("RSA-SHA256");
    signer.write(payload);
    signer.end();

    // encode and concatenate
    const encodedSignature = signer.sign(privateKey, "base64");
    const encodedHeader = Buffer.from(header).toString("base64");
    const encodedPayload = Buffer.from(payload).toString("base64");
    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    // store the token in the database
    const sql: string = "INSERT INTO tokens(content, user_id) VALUES(?, ?)";
    const placeholders: string[] = [token, userId.toString()];
    const sqlResult: any = await ConnectionHelper.performQuery(sql, placeholders);

    if (sqlResult.affectedRows === 0) {
      throw new Error("Une erreur est survenue.");
    }

    return token;
  }

  static async verifyToken(token: string): Promise<number> {
    // fetch token elements
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    // verify token type and expiration date
    const header = JSON.parse(Buffer.from(encodedHeader, "base64").toString("utf-8"));
    const stringPayload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const payload = JSON.parse(stringPayload);

    const expirationDate: Date = new Date(payload.expirationDate);
    const today: Date = new Date();

    if (header.typ !== "AWT" || expirationDate < today) {
      throw new Error("Token invalide.");
    }

    // Get the public key
    const publicKeyBase64 = process.env.PUBLIC_KEY ?? "";
    const publicKeyContent = Buffer.from(publicKeyBase64, "base64").toString("utf-8");
    const publicKey = crypto.createPublicKey(publicKeyContent);

    // Verify the signature
    const verifier = crypto.createVerify(header.alg);
    verifier.write(stringPayload);
    verifier.end();

    if (!verifier.verify(publicKey, encodedSignature, "base64")) {
      throw new Error("Token invalide.");
    }
    // verify that the user didn't change password or unsubscribed
    const sql: string = "SELECT id FROM tokens WHERE content = ? AND user_id = ?";
    const placeholders: string[] = [token, payload.userId];
    let sqlResult: any[];

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new Error("Une erreur est survenue.");
    }

    if (sqlResult.length === 0) {
      throw new Error("0 token trouvé.");
    }

    return payload.userId;
  }
}
