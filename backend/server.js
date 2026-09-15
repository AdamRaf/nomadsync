// const express = require('express');
// const cors = require('cors');
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors());
app.use(express.json());

// 'database' :D
const itineraryEvents = [];

app.get('/api/events', (req, res) => {
    res.json(itineraryEvents);
})

app.post('/api/events', (req, res) => {
    const newEvent = {
        id: Date.now(),
        title: req.body.title,
    };
    itineraryEvents.push(newEvent);
    res.status(201).json(newEvent);
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})