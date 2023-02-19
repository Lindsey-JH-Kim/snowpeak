//express연결
const express = require('express');
const app = express();



//body-parser연결
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended : true})); 

//mongodb 연결
const MongoClient = require('mongodb').MongoClient;

//connect-mongo연결
const MongoStore = require('connect-mongo');


//로그인기능 session방식 회원인증기능 구현하기
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({
  secret : '비밀코드',
  resave : false,
  saveUninitialized : false,
  store: MongoStore.create({mongoUrl:'mongodb+srv://admin:qwer1234@cluster0.o48depr.mongodb.net/?retryWrites=true&w=majority'}),
  cookie:{maxAge:(3.6e+6)*24} // 24시간 유효
}));
app.use(passport.initialize());
app.use(passport.session());

//method-override 라이브러리 설치
const methodOverride = require('method-override')
app.use(methodOverride('_method'))



//ejs연결
app.set('view engine','ejs')

//public 위치에 있는 폴더를 쓰겠다
app.use('/public', express.static('public'));

//js 위치에 있는 폴더를 쓰겠다
app.use('/js', express.static('js'));

//ObjectID _id값가져올때
const ObjectId = require('mongodb').ObjectId; 
//ObjectId()안에 담고싶을때 const {ObjectId} = require('mongodb');

//.env파일 사용해서 환경변수 사용하기
require('dotenv').config()

var db;
MongoClient.connect(process.env.DB_URL, function(err, client){
  if(err){return console.log(err)}

  db = client.db('snowpeak');

  app.listen(process.env.PORT, function(){
    console.log('listening on 8080')
  })
})

// .env파일 사용사지 않고 바로 연결하기
// var db;
// MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.o48depr.mongodb.net/?retryWrites=true&w=majority',{useUnifiedTopology:true},function(err,client){
//   if(err) return console.log(err)

//   db = client.db('snowpeak');
  
//   app.listen(8080,function(){
//     console.log('listining on 8080')
//   })
// })


//로그인 구현하기
// 1.login경로로 GET요청 들어오면 login.ejs파일 렌더링하기
// 2.로그인 POST요청시 아이디랑 패스워드가 검사 검증미들웨어실행 인증세부코드 작성
// 3.아이디와 패스워드 db와 비교 검사결과가 맞으면 세션을 하나 생성 쿠키로 보내주고 성공페이지로이동
// 4. 실패하면 실패페이지로 이동
//passport셋팅하는 부분이 /register Post요청 회원db저장 위에 있어야함
app.get('/login',function(req,res){
res.render('login.ejs')
})

app.post('/login',passport.authenticate('local',{failureRedirect : '/login'}),function(req,res){
  res.redirect('/');
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function(입력한아이디, 입력한비번, done){
  db.collection('login').findOne({id: 입력한아이디}, function(err, result){
    if(err) return done(err)

    if(!result) return done(null, false, {message:'존재하지 않는 아이디입니다.'})
    if(입력한비번 == result.pw){
      return done(null,result)
    } else{
      return done(null, false, {message:'비번이 틀렸습니다.'})
    }
  })
}));




//db에서 위에있는 user.id로 유저를 찾은뒤에 유저 정보를 아래에 넣고 로그인한 유저의 세션아이디를 바탕으로 개인정보를 db에서 찾는 역할
passport.serializeUser(function (user, done){
  done(null, user.id)
});

passport.deserializeUser(function (아이디, done){
  db.collection('login').findOne({id:아이디}, function(err, result){
    done(null, result)
  })
});

//login컬렉션에 db저장하기 (id/pw) 
//(login.ejs)에서 /register로 post요청
app.post('/register', function(req,res){
  db.collection('login').insertOne({id:req.body.id, pw:req.body.pw}, function(err,result){
    res.redirect('/login')
  })
})

//logout경로로 GET요청 시 req.logout()코드 실행
app.get('/logout', function(req,res){
  req.logout(function(err){
    if(err) {return next(err)}
    console.log('로그아웃');
  })
  res.redirect('/');
  res.clearCookie('connect.sid')
});


//index경로로 GET요청 + blogpost 콜렉션 db연결
app.get('/',function(req,res){
  db.collection('blogpost').find().toArray(function(err, result){
    res.render('index.ejs', {blogpost:result})
  })
})


//products경로로 GET요청 + itemlist콜렉션 db연결
app.get('/products',function(req,res){
  db.collection('itemlist').find().toArray(function(err,result){
    res.render('products.ejs',{itemlist:result})
  })
})
app.get('/products-detail/:id', function(req,res){
  db.collection('itemlist').findOne({_id: parseInt(req.params.id)},function(err,result){
    res.render('products-detail.ejs',{itemlist:result})
  })
})

//search
app.get('/search', function(req,res){
  console.log(req.query.value)
  var searchRequired = [
    {
      $search:{
        index: 'itemnameSearch', //만든 인덱스명
        text: {
          query: req.query.value,
          path: ['itemname'] //콜렉션안에있던것 중에 찾고싶은거 ['','']어레이로 여러개 검색도 가능
        }
      }
    }
  ]

  db.collection('itemlist').aggregate(searchRequired).toArray(function(err,result){
    console.log(result)
    res.render('search.ejs', {itemlist:result})

  })
})



//apparel경로로 GET요청 + itemlist콜렉션 db연결
app.get('/apparel',function(req,res){
  db.collection('itemlist').find({itemselect:'Apparel'}).toArray(function(err,result){
    res.render('p-apparel.ejs',{apparel:result})
  });
})

//gear경로로 GET요청 + itemlist콜렉션 db연결
app.get('/gear',function(req,res){
  db.collection('itemlist').find({itemselect:'Gear'}).toArray(function(err,result){
    res.render('p-gear.ejs',{gear:result})
  });
})

//newitems경로로 GET요청 + itemlist콜렉션 db연결
app.get('/newitems',function(req,res){
  db.collection('itemlist').find({itemselect:'New Items'}).toArray(function(err,result){
    res.render('p-newitems.ejs',{newitems:result})
  });
})

//장바구니 클릭 시 shopping콜렉션 db저장 + 데이터 /shopping경로로 연결
app.post('/addcart',loginConfirmed, function(req,res){
  db.collection('shopping').insertOne({category:'cart', itemname: req.body.itemname, totalprice:req.body.totalprice, userid: req.user.id}, function(err,result){
    res.send('장바구니에 상품을 담았습니다')
  })
})

//구매버튼 클릭 시 shopping콜렉션 db저장 + 데이터 /shopping경로로 연결
app.post('/addshop',loginConfirmed, function(req,res){
  db.collection('shopping').insertOne({category:'shop', itemname: req.body.itemname, totalprice:req.body.totalprice, userid: req.user.id}, function(err,result){
    res.send('상품을 구매합니다.')
  })
})

//My Page클릭시 /shopping경로로 GET요청 + 로그인한사람만 들어감
app.get('/cart',loginConfirmed, function(req,res){
  db.collection('shopping').find({userid:req.user.id, category:'cart'}).toArray(function(err,result){
    res.render('mypage-cart.ejs',{shopping:result})

  })
})

//shopping list 클릭 시 + mypage/shop경로로 GET요청 + shopping 콜렉션 db연결
app.get('/shop',loginConfirmed, function(req,res){
  db.collection('shopping').find({userid:req.user.id, category:'shop'}).toArray(function(err,result){
    res.render('mypage-shop.ejs',{shopping:result})

  })
})

//shopping cart에서 delete버튼 누르면 그 누른 데이터 삭제
app.delete('/cartdelete/:id',function(req,res){
  db.collection('shopping').deleteOne({_id:ObjectId(req.params.id)}, function(err, result){
    res.status(200).send('장바구니목록 삭제했습니다.');
  })
})

//shopping cart에서 buy버튼 누르면 데이터 카테고리수정
app.put('/cartedit',function(req,res){
  db.collection('shopping').updateOne({_id:ObjectId(req.body.id)},{$set:{category:'shop'}}, function(err, result){
    res.status(200).send('상품을 구매합니다.');
  })
})
//shopping list에서 delete버튼 누르면 그 누른 데이터 삭제
app.delete('/shopdelete/:id',function(req,res){
  db.collection('shopping').deleteOne({_id:ObjectId(req.params.id)}, function(err, result){
    res.status(200).send('주문목록 삭제했습니다.');
  })
})

// 로그인했니 미들웨어 쓸 function 만들기
function loginConfirmed (req, res, next){
  if(req.user){
    next()
  }else{
    res.send('로그인이 필요합니다.<br><br> 테스트아이디:test1 테스트비밀번호:test1 <br>어드민아이디:admin 어드민비밀번호:admin<br>우측하단에 고정되어있는 채팅하기버튼 클릭 시 어드민과의 채팅이 생성됩니다.')
  }
}


//community 경로로 GET요청 + blogpost 콜렉션 db연결
app.get('/community',function(req,res){
  db.collection('blogpost').find().toArray(function(err,result){
    res.render('community.ejs',{blogpost:result})
  })
})

//community에서 blog post 버튼 누르면 /post경로로 GET요청하고 파일 렌더링
app.get('/post',loginConfirmed, function(req,res){
  res.render('community-post.ejs')
})

//community에서 게시물 클릭하면 게시물아이디의 번호를 넣은 /detail:id 경로로 GET요청
//blogpost collection에서 게시물아이디가 있는 데이터를 꺼내서 detail.ejs파일렌더링하면서 같이 보내주기
app.get('/detail/:id', function(req,res){
  db.collection('blogpost').findOne({_id: parseInt(req.params.id)},function(err,result){
    res.render('community-detail.ejs',{blogpost:result})
  })
})


//post에서 /blogpost경로로 post요청시 blogpost collection에 데이터 저장하기
//collection counter 0에서 시작 포트스요청올때마다 게시물갯수 숫자 늘리면서 각 게시물_id 넘버링하기
//upload GET요청 upload.ejs렌더링하고 사진이미지 multer이용해서 컴퓨터스토리지에(public안에 image폴더) 저장하고 파일이름을 게시물아이디로 저장
//
var filename;
app.post('/blogpost', function(req,res){
  db.collection('counter').findOne({name:'게시물갯수'},function(err,result){
    var 총게시물갯수 = result.totalPost

    db.collection('blogpost').insertOne({_id:(총게시물갯수+1), title:req.body.title, details:req.body.details, date:new Date(), postingid:req.user.id}, function(err,result){
      res.redirect('/upload')
      db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:1}},function(err,result){
      })
    })

    filename = (총게시물갯수+1);
  })
})

let multer = require('multer');
const { json } = require('body-parser');
const { ChangeStream } = require('mongodb');
var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, './public/image')
    },
    filename : function(req, file, cb){
        cb(null, filename + '.jpg')
    }    
});

var upload = multer({storage : storage});

app.get('/upload', function(req,res){
    res.render('upload.ejs')
});

app.post('/blogimage', upload.single('input-upload'), function(req,res){
  res.redirect('/community')
})

// app.get('/image/:imageName', function(req,res){
//   res.sendFile(__dirname + '/public/image/' + req.params.imageName)
// })


//community-detail경로에서 delete요청 들어오면 삭제하기
app.delete('/delete/:id', function(req,res){
  
  db.collection('blogpost').deleteOne({_id:parseInt(req.params.id), postingid: req.user.id}, function(err,result){
    res.status(200).send({message:'성공했어요'});
  })
})

//community-edit:id경로로 GET요청 들어오면 edit.ejs파일 render하고 blogpost데이터 연결하기
app.get('/edit/:id', function(req,res){
  db.collection('blogpost').findOne({_id: parseInt(req.params.id)}, function(err,result){
    res.render('community-edit.ejs',{blogpost:result})
  })
})

//community-edit요청 들어오면 수정하기
app.post('/edit', function(req,res){
  db.collection('blogpost').updateOne({_id:parseInt(req.body.id), postingid: req.user.id}, {$set:{title:req.body.title, details:req.body.details}}, function(err, result){
    res.redirect('/community')
  })
})














//admin페이지 연결
app.get('/admin', function(req,res){
  db.collection('itemlist').find().toArray(function(err,result){
    res.render('admin.ejs',{itemlist:result})

  })
})

app.get('/add', function(req,res){
  res.render('add.ejs')
})

var itemNum;
app.post('/itemlist', function(req,res){
  db.collection('itemcounter').findOne({name:'게시물갯수'},function(err,result){
    var 총게시물갯수 = result.totalPost

    db.collection('itemlist').insertOne({_id:(총게시물갯수+1), itemname:req.body.itemname, itemprice:req.body.itemprice, itemselect:req.body.itemselect},function(err,result){
      res.redirect('/itemupload')
      db.collection('itemcounter').updateOne({name:'게시물갯수'},{$inc:{totalPost:1}},function(err,result){
      })
    })

    itemNum = (총게시물갯수+1);
  })
})

var storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, './public/itemImage')
  },
  filename : function(req, file, cb){
    cb(null, itemNum + '.jpg')
  }    
});

var upload = multer({storage : storage})
app.get('/itemupload',function(req,res){
  res.render('itemupload.ejs')
})

app.post('/itemimage', upload.single('input-itemupload'),function(req,res){
  res.redirect('/detailupload')
})


var storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, './public/detailImage')
  },
  filename : function(req, file, cb){
    cb(null, itemNum + '.jpg')
  }    
});

var upload = multer({storage : storage})
app.get('/detailupload',function(req,res){
  res.render('detailupload.ejs')
})
app.post('/detailimage', upload.single('input-detailupload'),function(req,res){
  res.redirect('/admin')
})

//admin itemlist delete하기
//delete요청 들어오면 삭제하기
app.delete('/itemdelete/:id', function(req,res){

  db.collection('itemlist').deleteOne({_id:parseInt(req.params.id)}, function(err,result){
    res.status(200).send({message:'성공했어요'});
  })
})

//admin itemlist edit하기
//itemedit/:id 경로로 GET,EdIT 요청 들어오면 ejs파일연결 데이터연결하고 수정하기
app.get('/itemedit/:id', function(req,res){
  db.collection('itemlist').findOne({_id: parseInt(req.params.id)}, function(err,result){
    res.render('itemedit.ejs',{itemlist:result})
  })
})

app.post('/itemedit', function(req,res){
  db.collection('itemlist').updateOne({_id:parseInt(req.body.id)}, {$set:{itemname:req.body.itemname, itemprice:req.body.itemprice, itemselect:req.body.itemselect}}, function(err, result){
    res.redirect('/admin')
  })
})




//chat연결
// var cors = require('cors')
// app.use(cors());

//채팅방 버튼을 클릭 시 /chatroom의 경로로 Get요청하고 chatroom콜렉션연결하기
app.get('/chatroom',loginConfirmed, function(req,res){
  db.collection('chatroom').find({member:req.user.id}).toArray(function(err,result){
    res.render('chat.ejs', {chatroom:result})
  })
})

//채팅방버튼 클릭 시 /chatroom경로로 post요청하고 chatroom 콜렉션에 data저장하기
//저장할 때 이미 멤버로 만든 채팅방이 존재하지 않을 때만 콜렉션에 데이터 저장하기
app.post('/chatroom',function(req,res){
  var savedata = {
    member: ['admin', req.user.id],
    date: new Date()
  }
  db.collection('chatroom').findOne({member:req.user.id}, function(err,result){
    if(result == null){
      db.collection('chatroom').insertOne(savedata, function(err, result){
        res.send('채팅방 정보 전송완료')
      })
    } else{
      res.send('채팅방입니다')
    }
  })
})

//send버튼 누르면 /message경로로 post요청하고 저장할 데이터 message콜렉션에 data저장하기

app.post('/message',function(req,res){
  var contentData = {
    chatroomId:req.body.chatroomId,
    userId:req.user.id,
    content:req.body.content,
    date: new Date()
  }
  db.collection('message').insertOne(contentData).then(()=>{
    console.log('메세지 디비에 저장성공')
    res.send('성공함')
  })
})
 
//지속적 소통채털개설하기 (서버에서 유저로 전달되는 헤더를 바꾸면 실시간 채널개설됨)
//채팅방 클릭 시 chatroomid가 지금 선택한 게시물id인거 다 찾고 데이터 보내기
app.get('/message/:parentid', loginConfirmed, function(req,res){
  res.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    'X-Accel-Buffering': 'no'
  });

  db.collection('message').find({chatroomId:req.params.parentid}).toArray(function(err,result){
    res.write('event: chatting\n')
    res.write(`data: ${JSON.stringify(result)}\n\n`)
  })

  //ChageStream 설정방법
  const pipeline = [
    { $match: {'fullDocument.chatroomId' : req.params.parentid}}  
  ];
  const collection = db.collection('message');
  const ChangeStream = collection.watch(pipeline);

  ChangeStream.on('change', (result)=>{
    console.log(result.fullDocument)
    res.write('event: chatting\n');
    res.write(`data: ${JSON.stringify([result.fullDocument])}\n\n`);
  });
})
