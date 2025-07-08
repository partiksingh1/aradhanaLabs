import express from "express";
import cors from "cors"
const app = express();
import dotenv from 'dotenv'
import { userRouter } from "./routes/userRoute";
import { blogRouter } from "./routes/blogRoute";
dotenv.config()
const port = 8000;

app.use(express.json());
app.use(cors());
app.use("/api/v1", userRouter)
app.use("/api/v1", blogRouter)

app.listen(port, () => {
    console.log(`......server listining on port ${port}.......`);
})
export default app;