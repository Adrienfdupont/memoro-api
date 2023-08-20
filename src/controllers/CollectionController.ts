import { Request, Response } from 'express';
import CollectionBusiness from '../business/CollectionBusiness';
import BusinessError from '../errors/BusinessError';
import Collection from '../types/Collection';

export default class CollectionController {
  static async addCollection(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await CollectionBusiness.addCollection(req.body.name, req.body.userId);
      httpCode = 200;
      body = { success: 'The collection was successfully added.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async getCollections(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    let collections: Collection[];
    try {
      collections = await CollectionBusiness.getCollections(req.params.id);
      httpCode = 200;
      body = { collections: collections };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async getCollection(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    let collection: Collection;
    try {
      collection = await CollectionBusiness.getCollection(req.params.id);
      httpCode = 200;
      body = { collection: collection };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async updateCollection(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await CollectionBusiness.updateCollection(req.params.id, req.body.name);
      httpCode = 200;
      body = { success: 'The collection was succesfully updated.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async removeCollection(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await CollectionBusiness.removeCollection(req.params.id);
      httpCode = 200;
      body = { success: 'The collection was successfuly deleted.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }
}
