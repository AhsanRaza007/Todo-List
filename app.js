const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static('public'));



mongoose.connect('mongodb+srv://admin-ahsan:test123@cluster0-ponjz.mongodb.net/todolistDB',{ useNewUrlParser : true ,useUnifiedTopology: true});

const itemSchema = {
  name : String
};

const Item = mongoose.model('Item',itemSchema);

const item1=new Item({
  name : 'Welcome ti your to-do-list'
});
const item2=new Item({
  name : 'Hit the + button to add an item'
});
const item3=new Item({
  name : 'Hit check Box to delete an item'
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name : String,
  items : [itemSchema]
}
const List = mongoose.model('List', listSchema);


app.get('/',function (req, res) {

  Item.find({}, function (err, foundItems) {
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log('error'+err);
        }else {
          console.log('Added default Items');
        }
      });
      res.redirect('/');
    }
    res.render('list',{
      ListTitle : 'Today',
      newListItems : foundItems
    });
  });
})



app.post('/',function (req,res) {
  let itemName = req.body.newItem;
  let ListName = req.body.list;
  const item = new Item({
    name:itemName
  });

  if (ListName === 'Today') {
      item.save();
      res.redirect('/');
  }else {
    List.findOne({name : ListName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+ListName);
    });
  }
});


app.get('/:customListName',function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function (err, foundList) {
    if(!err){
      if (!foundList) {
        //Create new List
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect('/'+customListName);
      }else {
        //show existing List
        res.render('list', {ListTitle : foundList.name, newListItems : foundList.items});
      }
    }
  })
})



app.post('/delete',function (req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === 'Today') {
      Item.findByIdAndRemove(checkItemId, function (err) {
        if (err) {
          console.log(err);
        }else{
          console.log('successfully deleted');
        }
      });
      res.redirect('/');
    }else{
        List.findOneAndUpdate(
          {
            name : listName
          },
          {
            $pull : {items: {_id:checkItemId}}
          },
          function (err, foundList) {
            if(!err){
              res.redirect('/'+listName)
            }
          }
        )
    }
});


app.get('/about', function (req, res) {
  res.render('about');
})


app.listen(process.env.PORT || 3000, function () {
  console.log('Server running');
})
