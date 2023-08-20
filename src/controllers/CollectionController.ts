import { Request, Response } from 'express';
import CollectionBusiness from '../business/CollectionBusiness';
import Collection from '../types/Collection';
import CoreController from './CoreController';

export default class CollectionController extends CoreController {
  static async addCollection(req: Request, res: Response): Promise<void> {
    try {
      await CollectionBusiness.addCollection(req.body.name, req.body.userId);
      const responseBody = { success: 'The collection was successfully added.' };
      res.status(CoreController.httpCode).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async getCollections(req: Request, res: Response): Promise<void> {
    let collections: Collection[];
    try {
      collections = await CollectionBusiness.getCollections(req.params.id);
      const responseBody = { collections: collections };
      res.status(CoreController.httpCode).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async getCollection(req: Request, res: Response): Promise<void> {
    let collection: Collection;
    try {
      collection = await CollectionBusiness.getCollection(req.params.id);
      const responseBody = { collection: collection };
      res.status(CoreController.httpCode).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      await CollectionBusiness.updateCollection(req.params.id, req.body.name);
      const responseBody = { success: 'The collection was succesfully updated.' };
      res.status(CoreController.httpCode).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async removeCollection(req: Request, res: Response): Promise<void> {
    try {
      await CollectionBusiness.removeCollection(req.params.id);
      const responseBody = { success: 'The collection was successfuly deleted.' };
      res.status(CoreController.httpCode).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }
}
