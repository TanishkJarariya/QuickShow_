import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';

const app = express();

await connectDB()

// Stripe Webhooks (must be before express.json())
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// Global Middleware
app.use(express.json())
app.use(cors({
  origin: [
    'https://quickshow-client-kappa.vercel.app',
    'https://app.inngest.com',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Routes
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))

// Clerk middleware AFTER inngest route
app.use(clerkMiddleware())
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
}

export default app;