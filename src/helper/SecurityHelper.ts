import fs from "fs";
import crypto from "crypto";

export default class SecurityHelper {
  static generateToken(username: string, userId: number): string {
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

  static verifyToken(token: string): number | null {
    // fetch token elements
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    // verify token type and expiration date
    const header = JSON.parse(Buffer.from(encodedHeader, "base64").toString("utf-8"));
    const stringPayload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const payload = JSON.parse(stringPayload);

    const expirationDate: Date = new Date(payload.expirationDate);
    const today: Date = new Date();

    if (header.typ !== "AWT" || expirationDate < today) {
      return null;
    }

    // Get the public key
    const publicKeyContent = fs.readFileSync("keys/publickey.pem").toString();
    const publicKey = crypto.createPublicKey(publicKeyContent);

    // Verify the signature
    const verifier = crypto.createVerify(header.alg);
    verifier.write(stringPayload);
    verifier.end();

    if (verifier.verify(publicKey, encodedSignature, "base64")) {
      return payload.userId;
    } else {
      return null;
    }
  }
}
