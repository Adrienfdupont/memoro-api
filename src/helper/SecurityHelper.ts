import fs from "fs";
import crypto from "crypto";

export default class SecurityHelper
{
  static generateToken(username: string): string
  {
    // generate the header
    const header = JSON.stringify({
      alg: "RS256",
      typ: "AWT",
    });

    // generate the payload
    const date = new Date();
    date.setDate(date.getDate() + 30);

    const payload = JSON.stringify({
      username: username,
      "expiration date": date,
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

  static verifyToken(token: string): boolean
  {
    const [header, payload, signature] = token.split(".");
    console.log(header);

    return true;
  }
}
