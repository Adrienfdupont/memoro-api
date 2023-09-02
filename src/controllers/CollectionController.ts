import { Request, Response } from 'express';
import CollectionBusiness from '../business/CollectionBusiness';
import Collection from '../types/Collection';
import CoreController from './CoreController';
import BusinessError from '../errors/BusinessError';

export default class CollectionController extends CoreController {
  private collectionBusiness: CollectionBusiness;

  constructor() {
    super();
    this.collectionBusiness = new CollectionBusiness();
  }

  public async addCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.addCollection(req.body.name, req.body.id);
      this.httpCode = 204;
      res.status(this.httpCode).end();
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
      res.status(this.httpCode).json(this.responseBody);
    }
  }

  public async getCollections(req: Request, res: Response): Promise<void> {
    let collections: Collection[];
    try {
      collections = await this.collectionBusiness.getCollections(req.params.id);
      this.httpCode = 200;
      this.responseBody = collections;
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async getCollection(req: Request, res: Response): Promise<void> {
    let collection: Collection;
    try {
      collection = await this.collectionBusiness.getCollection(req.params.id);
      this.httpCode = 200;
      this.responseBody = collection;
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.updateCollection(
        req.body.id,
        req.body.newName
      );
      this.httpCode = 204;
      res.status(this.httpCode).end();
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
      res.status(this.httpCode).json(this.responseBody);
    }
  }

  public async removeCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.removeCollection(req.params.id);
      this.httpCode = 204;
      res.status(this.httpCode).end();
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
      res.status(this.httpCode).json(this.responseBody);
    }
  }
}
