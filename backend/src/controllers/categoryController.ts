import type { Request, Response } from 'express';
import * as service from '../services/categoryService';
import { categorySchema } from '../validation/category';
import { idParams } from '../validation/common';

export async function list(_req: Request, res: Response) {
  res.json({ data: await service.listCategories() });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ data: await service.createCategory(categorySchema.parse(req.body)) });
}

export async function update(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await service.updateCategory(id, categorySchema.parse(req.body)) });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  await service.deleteCategory(id);
  res.status(204).end();
}
