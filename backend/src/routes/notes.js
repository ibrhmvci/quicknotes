import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  content: z.string().max(10000, 'Content must be 10,000 characters or less').default(''),
});

const updateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  content: z.string().max(10000).optional(),
});

async function resolveNote(noteId, userId, res) {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return null;
  }
  if (note.userId !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return note;
}

// GET /api/notes
router.get('/', async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const note = await resolveNote(req.params.id, req.userId, res);
    if (!note) return;
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes
router.post('/', async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ error: parsed.error.errors[0].message });
    }
    const note = await prisma.note.create({
      data: { ...parsed.data, userId: req.userId },
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await resolveNote(req.params.id, req.userId, res);
    if (!existing) return;

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ error: parsed.error.errors[0].message });
    }
    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await resolveNote(req.params.id, req.userId, res);
    if (!existing) return;

    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
