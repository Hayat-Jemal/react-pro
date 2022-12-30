// //importing
import express from "express";
import mongoose from "mongoose"; 
import Messages from "./dbMessages.js"
import Pusher  from "pusher";
import cors from "cors";



//j6nLEHuitFwafjs4
//6jv4s2V7ABHHCR1u
// //app config
const app = express() 
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: "1529709",
    key: "dabc6adfdadee64fbad7",
    secret: "401632f816462b23a38f",
    cluster: "eu",
    useTLS: true
  });
  

// //middleware
app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Header", "*");
    next();
});

// //DB config      
// const connection_url = 
//"mongodb+srv://admin2:UM8lc2NLh9bathD6@cluster0.x3e9fac.mongodb.net/whatsappdb?retryWrites=true&w=majority";
const connection_url = "mongodb+srv://admin:adminadmin@cluster0.o7igqiu.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open' , () => {
console.log('DB connected');

const msgCollection = db.collection('messagecontents');
const changeStream = msgCollection.watch();
console.log(changeStream)

changeStream.on("change", (change) => {
    console.log(change)
    if(change.operationType === 'insert') {
        const messageDetails = change.fullDocument;
        pusher.trigger('messages', 'inserted',{
            name:messageDetails.user,
            message: messageDetails.message,
            timestamp: messageDetails.timestamp,
            received: messageDetails.received
        });
    } else {
        console.log('Error triggering pusher')
    }
})


})



//api routes
app.get('/', (req,res)=>res.status(200).send("hello world"));
app.get("/messages/sync", (req,res)=>{
    Messages.find((err,data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})
app.post("/messages/new", (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err){
            res.status(500).send(err) //internal server = 500
        } else {
            res.status(201).send(data)
        }
    })
})


//listen
app.listen(port, () => console.log(`Litsening on localhost:${port}`));


