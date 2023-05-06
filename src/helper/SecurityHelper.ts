import fs from "fs";
import crypto from "crypto";

export default class SecurityHelper
{
  static generateToken(username: string): string {
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

  static verifyToken(token: string): boolean {
    if (token.split(".").length !== 3) {
      return false;
    }
    // fetch token elements
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    // verify token type and expiration date
    const header = JSON.parse(
      Buffer.from(encodedHeader, "base64").toString("utf-8")
    );
    const stringPayload = Buffer.from(encodedPayload, "base64").toString(
      "utf-8"
    );
    const payload = JSON.parse(stringPayload);
    
    if (header.typ !== "AWT" || new Date(payload["expiration date"]) < new Date()) {
      return false;
    }

    // Get the public key
    const publicKeyContent = fs.readFileSync("keys/publickey.pem").toString();
    const publicKey = crypto.createPublicKey(publicKeyContent);

    // Verify the signature
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.write(stringPayload);
    verifier.end();

    const verified = verifier.verify(publicKey, encodedSignature, "base64");
    return verified;
  }
}
