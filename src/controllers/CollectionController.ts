import { Request, Response } from 'express';
import CollectionBusiness from '../business/CollectionBusiness';
import Collection from '../types/Collection';
import CoreController from './CoreController';

export default class CollectionController extends CoreController {
  private collectionBusiness: CollectionBusiness;

  constructor() {
    super();
    this.collectionBusiness = new CollectionBusiness();
  }

  public async addCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.addCollection(req.body.name, req.body.userId);
      this.httpCode = 200;
      this.responseBody = { success: 'The collection was successfully added.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async getCollections(req: Request, res: Response): Promise<void> {
    let collections: Collection[];
    try {
      collections = await this.collectionBusiness.getCollections(req.params.id);
      this.httpCode = 200;
      this.responseBody = { collections: collections };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async getCollection(req: Request, res: Response): Promise<void> {
    let collection: Collection;
    try {
      collection = await this.collectionBusiness.getCollection(req.params.id);
      this.httpCode = 200;
      this.responseBody = { collection: collection };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.updateCollection(req.params.id, req.body.name);
      this.httpCode = 200;
      this.responseBody = { success: 'The collection was succesfully updated.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async removeCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.removeCollection(req.params.id);
      this.httpCode = 200;
      this.responseBody = { success: 'The collection was successfuly deleted.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }
}
