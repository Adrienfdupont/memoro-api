import crypto from 'crypto';
import ConnectionHelper from './ConnectionHelper';
import { NextFunction, Request, Response } from 'express';
import SecurityError from '../errors/SecurityError';

export default class SecurityHelper {
  static async generateToken(username: string, userId: number): Promise<string> {
    // generate the header
    const header = JSON.stringify({
      alg: 'RSA-SHA256',
      typ: 'AWT',
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
    const privateKeyContent = Buffer.from(process.env.PRIVATE_KEY ?? '', 'base64').toString(
      'utf-8',
    );
    const privateKey = crypto.createPrivateKey(privateKeyContent);
    const signer = crypto.createSign('RSA-SHA256');
    signer.write(payload);
    signer.end();

    // encode and concatenate
    const encodedSignature = signer.sign(privateKey, 'base64');
    const encodedHeader = Buffer.from(header).toString('base64');
    const encodedPayload = Buffer.from(payload).toString('base64');
    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    return token;
  }

  static async verifyToken(token: string): Promise<void> {
    // fetch token elements
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

    // verify token type and expiration date
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64').toString('utf-8'));
    const stringPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    const payload = JSON.parse(stringPayload);

    const expirationDate = new Date(payload.expirationDate);
    const now = new Date();

    if (header.typ !== 'AWT' || expirationDate < now) {
      throw new SecurityError();
    }

    // Get the public key
    const publicKeyContent = Buffer.from(process.env.PUBLIC_KEY ?? '', 'base64').toString('utf-8');
    const publicKey = crypto.createPublicKey(publicKeyContent);

    // Verify the signature
    const verifier = crypto.createVerify(header.alg);
    verifier.write(stringPayload);
    verifier.end();

    if (!verifier.verify(publicKey, encodedSignature, 'base64')) {
      throw new SecurityError();
    }

    // verify that the user still exists and didn't change the password
    const sql = 'SELECT last_password_change FROM users WHERE id = ?';
    const placeholders = [payload.userId];
    let sqlResult: any;

    sqlResult = await ConnectionHelper.performQuery(sql, placeholders);

    if (sqlResult.length === 1) {
      const generationDate = new Date(payload.generationDate);
      const lastPasswordChange = new Date(sqlResult[0].last_password_change);

      if (generationDate > lastPasswordChange) {
        return payload.userId;
      }
    }

    throw new SecurityError();
  }

  static async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    const bearer = req.headers.authorization;

    if (bearer !== undefined) {
      const token = bearer.split(' ')[1];
      try {
        await SecurityHelper.verifyToken(token);
        next();
      } catch (err) {
        httpCode = 401;
        if (err instanceof SecurityError) {
          body = { error: err.message };
        }
        res.status(httpCode).json(body);
      }
    } else {
      httpCode = 401;
      body = { error: 'Invalid token.' };
      res.status(httpCode).json(body);
    }
  }
}
