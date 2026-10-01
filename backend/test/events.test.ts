import { afterAll, describe, expect, it } from 'vitest'
import { pool } from '../db.js'
import request from 'supertest'
import { app } from '../server.js'

describe('API Test', () => {
    afterAll(async () => await pool.end())

    let createdEventId: number;

    it('Should return 200 OK and an array of events', async () => {
        const response = await request(app).get('/api/events');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    })

    it('Should create a new event (POST)', async () => {
        const newEvent = {
            title: 'Vitest POST test',
            start_time: '2026-10-01T11:23:30.723Z',
            lat: -6.179468,
            lng: 106.826935,
        }
        
        const response = await request(app)
            .post('/api/events')
            .send(newEvent);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newEvent.title);

        createdEventId = response.body.id;
    })

    it('Should delete the created event (DELETE)', async () => {
        const response = await request(app)
            .delete(`/api/events/${createdEventId}`);

        expect(response.status).toBe(200);
    })
})