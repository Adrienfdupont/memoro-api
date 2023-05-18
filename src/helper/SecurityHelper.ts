import fs from "fs";
import crypto from "crypto";
import ConnectionHelper from "./ConnectionHelper";
import StatusMsgError from "../errors/StatusMsgError";

export default class SecurityHelper {
  static async generateToken(username: string, userId: number): Promise<string> {
    // generate the header
    const header = JSON.stringify({
      alg: "RSA-SHA256",
      typ: "AWT",
    });

    // generate the payload
    const generationDate = new Date();

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const payload = JSON.stringify({
      username: username,
      userId: userId,
      generationDate: generationDate,
      expirationDate: expirationDate,
    });

    // cypher the payload
    const privateKeyContent = fs.readFileSync("keys/privatekey.pem").toString();
    const privateKey = crypto.createPrivateKey(privateKeyContent);
    const signer = crypto.createSign("RSA-SHA256");
    signer.write(payload);
    signer.end();

    // encode and concatenate
    const encodedSignature = signer.sign(privateKey, "base64");
    const encodedHeader = Buffer.from(header).toString("base64");
    const encodedPayload = Buffer.from(payload).toString("base64");
    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

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
    const now: Date = new Date();

    if (header.typ !== "AWT" || expirationDate < now) {
      throw new StatusMsgError(401, "Invalid token.");
    }

    // Get the public key
    const publicKeyContent = fs.readFileSync("keys/publickey.pem").toString();
    const publicKey = crypto.createPublicKey(publicKeyContent);

    // Verify the signature
    const verifier = crypto.createVerify(header.alg);
    verifier.write(stringPayload);
    verifier.end();

    if (!verifier.verify(publicKey, encodedSignature, "base64")) {
      throw new StatusMsgError(401, "Invalid token.");
    }

    // verify that the user still exists and didn't change the password
    const sql: string = "SELECT last_password_change FROM users WHERE id = ?";
    const placeholders: string[] = [payload.userId];
    let sqlResult: any;

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new StatusMsgError(500, "Internal server error.");
    }

    if (sqlResult.length === 1) {
      const generationDate: Date = new Date(payload.generationDate);
      const lastPasswordChange: Date = new Date(sqlResult[0].last_password_change);

      if (generationDate > lastPasswordChange) {
        return payload.userId;
      }
    }

    throw new StatusMsgError(401, "Invalid token");
  }
}
