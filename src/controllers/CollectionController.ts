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
      const responseBody = { success: 'The collection was successfully added.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async getCollections(req: Request, res: Response): Promise<void> {
    let collections: Collection[];
    try {
      collections = await this.collectionBusiness.getCollections(req.params.id);
      const responseBody = { collections: collections };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async getCollection(req: Request, res: Response): Promise<void> {
    let collection: Collection;
    try {
      collection = await this.collectionBusiness.getCollection(req.params.id);
      const responseBody = { collection: collection };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.updateCollection(req.params.id, req.body.name);
      const responseBody = { success: 'The collection was succesfully updated.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async removeCollection(req: Request, res: Response): Promise<void> {
    try {
      await this.collectionBusiness.removeCollection(req.params.id);
      const responseBody = { success: 'The collection was successfuly deleted.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }
}
