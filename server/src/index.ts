import express from "express";
import cors from "cors"
const app = express();
app.use(express.json());
app.use(cors());
const port  = 8000;


app.listen(port,()=>{
    console.log(`......server listining on port ${port}.......`);
})
export default app;