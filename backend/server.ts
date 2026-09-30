import express, { Request, Response } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io';
import z from 'zod';
import { pool } from './db.js';

const app = express();
const PORT = 3000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
})

const eventBodySchema = z.object({
    title: z.string().min(1),
    start_time: z.iso.datetime(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
})

const eventIdSchema = z.object({
    id: z.coerce.number().int().positive()
})

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                start_time TEXT NOT NULL,
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('PostgreSQL event table initialized');
    } catch (err) {
        console.error('Failed to initialize PostgreSQL table', err);
    }
}

initDB();

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    })
})

app.get('/api/events', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    }
})

app.post('/api/events', async (req: Request, res: Response) => {
    const validationResult = eventBodySchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
            error: "Zod validation failed",
            details: z.treeifyError(validationResult.error),
        });
    }
    
    const {title, start_time, lat, lng} = validationResult.data;

    try {
        const stmt = `
            INSERT INTO events (title, start_time, lat, lng)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(stmt, [
            title,
            start_time,
            lat ?? null,
            lng ?? null,
        ]);

        const newEvent = result.rows[0];

        io.emit('event_added', newEvent);
        
        res.status(201).json(newEvent);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to create event' });
        }
    }
})

app.delete('/api/events/:id', async (req: Request, res: Response) => {
    const paramValidation = eventIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const { id } = paramValidation.data;

    try {
        const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const deletedEvent = { id: Number(id) };
        io.emit('event_deleted', deletedEvent)
        
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Database error:', err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to delete event'})
        }
    }
})

app.put('/api/events/:id', async (req: Request, res: Response) => {
    const paramValidation = eventIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
        return res.status(400).json({ error: 'Invalid ID format'});
    }
    const { id } = paramValidation.data;

    const bodyValidation = eventBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({
            error: "Zod validation error",
            details: z.treeifyError(bodyValidation.error),
        });
    }

    const { title, start_time } = bodyValidation.data;

    try {
        const result = await pool.query(
            'UPDATE events SET title = $1 WHERE id = $2', [
                title, id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = { id: Number(id), title, start_time };
        io.emit('event_updated', updatedEvent);

        res.json({ id, title});
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to update event' });
        }
    }
})

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
