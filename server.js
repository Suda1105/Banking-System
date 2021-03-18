const express=require('express');
const path=require('path');
const bodyParser=require('body-parser');
const ejs=require('ejs');
var app=express();
var mongoose=require('mongoose');

mongoose.connect('mongodb+srv://Suda1105:Sudarshan@123@cluster0.qywhd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
{
        useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex:true
}).then(()=>console.log("DB Connected!"))
.catch(err=>console.error(err));

app.use(bodyParser.urlencoded({ extended: true }));

var customerSchema=new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	email:{
		type:String,
		required:true,
        unique:true
	},
	Amount:{
		type:Number,
		required:true
	}

});

var Customer=mongoose.model('Customer',customerSchema);

const transactionSchema = mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    receiver:{
        type:String,
        required:true
    }
});
const Transaction = mongoose.model("Transaction",transactionSchema);

app.set('view engine','ejs');
app.use(express.static('public'));


app.get("/", (req,res) => {
    res.sendFile(__dirname+"/homePage.html");
});

app.get("/about",(req,res)=>{
    res.render('about',{

    });
})

app.get("/contact",(req,res)=>{
    res.render('contact',{

    })
})

app.get("/transactions",(req,res) => {
  Transaction.find({}, (err,transactions) => {
          res.render('transactions',{
            transactionList:transactions
          });
  });
	
});


app.get("/customers", (req,res)=>{
	Customer.find({},(err,customers)=>{
		res.render('customers',{
			customersList:customers
		}); 
	});
       	
});

app.get("/customers/:customerId", (req,res) => {
	const id=req.params.customerId;
	Customer.findOne({_id:id},(err,doc)=>{
		res.render('profile',{
            customer:doc
        });
	});
});

app.get("/payment", (req,res) => {
	Customer.find({},(err,docs)=>{
           res.render('payment');
	});
	
});

app.post('/payment',async (req , res) =>{
    try{
      sender = req.body.senderName;
      receiver = req.body.receiverName;
      amount = req.body.amount;
      const Amount = parseInt(amount);
      const user1 = await Customer.findOne({name: sender});
      const user2 = await Customer.findOne({name: receiver});
      const update1 =  parseInt(user2.Amount) + Amount; 
      const update2 = parseInt(user1.Amount) - Amount;
      if(update2 < 0){
          res.sendFile(__dirname+'/failure.html');
      }else{
      await Customer.findOneAndUpdate( {name : receiver} , {Amount : update1});
      await Customer.findOneAndUpdate( {name : sender} , {Amount : update2});
      await Transaction.create({sender:user1.name,amount:Amount,receiver:user2.name});
      console.log("Transaction Successful!")
      res.sendFile(__dirname+'/success.html');
      }
    }
    catch (error) {
        res.sendFile(__dirname+'/failure.html')
     }  
});

const PORT = process.env.PORT || 4040;

app.listen(PORT, () =>{
    console.log("Server is running on port no. "+PORT);
})