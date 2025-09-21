import express from "express";
import cors from "cors";
import { SpeedInsights } from "@vercel/speed-insights/next"
const app = express();
app.use(cors());
app.use(express.json());