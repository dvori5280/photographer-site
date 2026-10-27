import type { Request, Response } from 'express';
import { idParams } from '../validation/common';
import { adminPackagesQuery, packageSchema, publicPackagesQuery } from '../validation/package';
import * as service from '../services/packageService';

export async function listPublic(req: Request, res: Response) {
  res.json({ data: await service.listPublicPackages(publicPackagesQuery.parse(req.query)) });
}

export async function getPublic(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await service.getPublicPackage(id) });
}

export async function listAdmin(req: Request, res: Response) {
  res.json({ data: await service.listAdminPackages(adminPackagesQuery.parse(req.query)) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ data: await service.createPackage(packageSchema.parse(req.body)) });
}

export async function update(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await service.updatePackage(id, packageSchema.parse(req.body)) });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  await service.deletePackage(id);
  res.status(204).end();
}
