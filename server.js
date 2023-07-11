// importing 
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from 'cors';
//app config 
const app=express()
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1632520",
    key: "cb789dbf12a31fbb87f7",
    secret: "25f43eef1fb22a271946",
    cluster: "ap2",
    useTLS: true
  });

// middleware
app.use(express.json());
app.use(cors());

// app.use((req,res,next)=>{
//     res.setHeader("Access-control-allow-origin","*");
//     res.setHeader("Access-control-allow-Headers","*");
//     next();
    
// })

//db config
const connection_url = 'mongodb+srv://manithrai3:manithrao1234@cluster0.v96jhfs.mongodb.net/whatsapp-backend?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db=mongoose.connection;

db.once("open",()=>{
    console.log("db is connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream=msgCollection.watch();

    changeStream.on('change',(change)=>{
        console.log(change);

        if(change.operationType==='insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('message','inserted',
            {
                name:messageDetails.name,
                message: messageDetails.message,
                timestamp:messageDetails.timestamp,
                recieved:messageDetails.recieved

            });
        }
        else{
            console.log("error in trigering pusher")
        }
    });
});

//api routes
app.get('/messages/sync', async (req, res) => {
      try {
        const data = await Messages.find();
        res.status(200).send(data);
      } catch (err) {
        res.status(500).send(err);
      }
    });

app.post('/messages/new', async (req, res) => {
      try {
        const dbMessage = req.body;
        const data = await Messages.create(dbMessage);
        res.status(201).send(data);
      } catch (err) {
        res.status(500).send(err);
      }
    });
    
    
    
//listen
app.listen(port,()=>console.log("listening on localhost:"+port));
