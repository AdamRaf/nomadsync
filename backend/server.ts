import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import { createServer } from 'http'
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
})

const db = new Database('nomadsync.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`)

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    })
})

app.get('/api/events', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM events ORDER BY id DESC');
        const events = stmt.all();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/events', (req, res) => {
    const {title} = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required'});
    }

    try {
        const stmt = db.prepare('INSERT INTO events (title) VALUES (?)');
        const result = stmt.run(title);

        const newEvent = { id: result.lastInsertRowid, title };

        io.emit('event_added', newEvent);
        
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.delete('/api/events/:id', (req, res) => {
    const {id} = req.params;

    try {
        const stmt = db.prepare('DELETE FROM events WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const deletedEvent = { id: Number(id) };
        io.emit('event_deleted', deletedEvent)
        
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to delete event'})
    }
})

app.put('/api/events/:id', (req, res) => {
    const {id} = req.params;
    const {title} = req.body;
 
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const stmt = db.prepare('UPDATE events SET title = ? WHERE id = ?');
        const result = stmt.run(title, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = { id: Number(id), title };
        io.emit('event_updated', updatedEvent);

        res.json({ id, title});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
