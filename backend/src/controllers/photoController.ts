import type { Request, Response } from 'express';
import { idParams } from '../validation/common';
import { adminPhotosQuery, photoSchema, publicPhotosQuery } from '../validation/photo';
import * as service from '../services/photoService';

export async function listPublic(req: Request, res: Response) {
  res.json({ data: await service.listPublicPhotos(publicPhotosQuery.parse(req.query)) });
}

export async function getPublic(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await service.getPublicPhoto(id) });
}

export async function listAdmin(req: Request, res: Response) {
  res.json({ data: await service.listAdminPhotos(adminPhotosQuery.parse(req.query)) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ data: await service.createPhoto(photoSchema.parse(req.body)) });
}

export async function update(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await service.updatePhoto(id, photoSchema.parse(req.body)) });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  await service.deletePhoto(id);
  res.status(204).end();
}
