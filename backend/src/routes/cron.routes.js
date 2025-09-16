import { Router } from 'express';
import { jobMidnight } from '../cronojobs/taskDated.cronojob.js';

const cronRouter = Router();

cronRouter.post('/start-cron', (req, res) => {
    if (!jobMidnight.running) {
        jobMidnight.start();
        return res.status(200).json({ message: 'CronJob iniciado.' });
    } else {
        return res.status(400).json({ message: 'CronJob ya estaba en marcha.' });
    }
});

cronRouter.post('/stop-cron', (req, res) => {
    if (jobMidnight.running) {
        jobMidnight.stop();
        return res.status(200).json({ message: 'CronJob parado.' });
    } else {
        return res.status(400).json({ message: 'CronJob no estaba en marcha.' });
    }
});

export default cronRouter;