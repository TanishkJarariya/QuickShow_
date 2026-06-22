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
const port = 3000;

await connectDB()

// Stripe Webhooks Route
app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Middleware — MUST be before all routes
app.use(express.json())
app.use(cors())

// API Routes
app.get('/', (req, res)=> res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))  // ← NO clerkMiddleware before this
app.use(clerkMiddleware())  // ← moved BELOW inngest route
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