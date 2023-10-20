const express = require("express"); 
const app = express();
const port = 5000
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();

const session = require('express-session');
const passport =require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');

app.use(passport.initialize());
app.use(session({
    secret : "암호화에 사용할 비밀번호", //.세션 문서의 암호화
    resave: false, //유저가 서버로 요청 할 때마다 갱신할건지
    saveUninitialized: false, //로그인 안해도 세션 만들건지
    cookie : {maxAge: 60 * 60 * 1000}, //쿠키가 한시간 뒤에 자동으로 삭제가가됨
     store : MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@beomseok.brllotx.mongodb.net/` ,
        dbName: "board"
     })
}))

// 데이터 해싱 yarn add bcrypt
// yarn add express-session passport passport-local
// 로그인 기능 순서가 중요

// yarn add connect-mongo
// 몽고 커넥트 설치

const methodOverride = require('method-override');
app.use(methodOverride('_method'));



app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(express.static(__dirname +'/public'))



const url = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@beomseok.brllotx.mongodb.net/`

const {MongoClient, ObjectId, serialize} = require('mongodb');
let db;
let sample;

new MongoClient(url).connect().then((client)=>{
    db = client.db('board');
    sample = client.db('sample_restaurants')
    // console.log('DB 연결 완료')
    app.listen(process.env.SERVER_PORT, ()=>{
        // console.log(`${port}번호에서 서버 실행 중`)
        // console.log("5000번 포트 서버 실행") 
    })
}).catch((error)=>{
    // console.log(error)
})


app.set('view engine', 'ejs');
// ejs 실행



app.get('/', (req,res)=>{
    // res.send("hell world");
    res.sendFile(__dirname + '/page/index.html');
    // sendfile 어떤 파일을 내보내겠다
})
app.get('/about', (req,res)=>{
    res.send('어바웃 페이지');
        // db.collection('notice').insertOne({
        //     title : '첫번째 글',
        //     content : '두번째 글'
        // })
        // 어바웃에 접속 했을시 데이터를 출력
})
app.get ('/list',async(req,res)=>{
    
    const result = await db.collection('notice') .find().limit(5).toArray()
    // console.log(result[0])
    res.render("list.ejs", {
        data : result
    })
})
app.get('/list/:id',async (req,res)=>{

    const result = await db.collection('notice').find().skip(((req.params.id - 1) * 6)).limit(5).toArray()
    // find 는 전체 문서 find(1) 은 하나만 들고 온다는 뜻이다.
    // 데이터가 로딩 되기전에 완료가 되면 아래 코드를 실행해 주세요 라는 뜻.(같은 뜻 인 then 도 있다.)

    // result()
    // console.log(result[0])
    res.render("list.ejs", {
       data : result
    })

    // ejs 파일은 렌더링 이 필요하다. 파일을 사용하지 않아도 됨
})
app.get('/view/:id', async (req,res)=>{
    const result = await db.collection("notice").findOne({

        _id :new ObjectId(req.params.id)
    })
    // console.log(result)
    res.render("view.ejs", {
        data : result
     })
   
})
app.get('/write', (req,res)=>{
    res.render('write.ejs')
})

app.post('/add', async (req,res)=>{
    // console.log(req.body)
    await db.collection("notice").insertOne({
        title : req.body.title,
        content : req.body.content
    })
        res.redirect("/list")

        // res.send("성공")
})


app.put('/edit', async (req,res)=>{
    // updateOne({문서},{
        //$set : {원하는 키: 변경값}
        // 수정하는 값
    // })
    // console.log(req.body)
    await db.collection("notice").updateOne({
        _id : new ObjectId(req.body._id)
    }, {
        $set :{
            title: req.body.title,
            content: req.body.content
        }
    })
    const result = "";
    res.send(result)
})
// app.put('/delete', async (req,res)=>{
  
//     console.log(req.body)
//     await db.collection("notice").updateOne({
//         _id : new ObjectId("652750b3c66a692c8086e53d")
//     }, {
//         $set :{
//             title: req.body.title,
//             content: req.body.content
//         }
//     })
//     const result = await"";
//     res.send(result)
// })


app.get('/edit/:id', async(req,res)=>{
    const result = await db.collection("notice").findOne({

        _id :new ObjectId(req.params.id)
    })
    res.render('edit.ejs', { 
        data : result
    })
       
    
   
})
app.get('/delete/:id', async(req,res)=>{
    const result = await db.collection("notice").deleteOne({

        _id :new ObjectId(req.params.id)
    })
    res.redirect('/list',)    
})

passport.use(new LocalStrategy({
    usernameField: 'userid',
    passwordField: 'password'
},async(userid,password,cb)=>{
    // 도중에 무엇인가 실행하는 코드
    let result = await db.collection('users').findOne({
        userid: userid //id 값이 데이터와 같은지 체크
    })
    if(!result){
        // id를 찾지 못했을때
        return cb(null, false, {message: '아이디나 비밀번호가 일치 하지 않습니다.'})
    }
    const passChk = await bcrypt.compare(password, result.password)
    console.log(passChk, password, result.password)
    if(passChk){
        return cb(null, result);
    }else{
        return cb(null, false, {message: '아이디나 비밀번호가 일치 하지 않습니다.'})
    }
}))

passport.serializeUser((user,done)=>{

        process.nextTick(()=>{
            // done(null, 세션에 기록할 내용)
            done(null, {id : user._id, userid: user.userid})
            // nextTick 비동기 실행
        })
})

passport.deserializeUser(async (user,done)=>{
    let result = await db.collection ('user').findOne({
        _id : new ObjectId(user.id)
    })
    delete result.password

    process.nextTick(()=>{
        done(null, result);
    })
    
})

app.get ('/login', (req,res)=>{
    res.render('login.ejs')
})
app.post ('/login', async(req,res,next)=>{
    console.log(req.body)
    passport.authenticate('local', (error, user, info)=>{
        if(error) return res.status(500).json(error);
        if(!user) return res.status(401).json(info.message)
        // user 가 성공 했을때의 데이터 info 가 실패했을때 데이터 이다. 페이지 에러 코드는 몇가지는 알아두면 좋다.
        req.logIn(user, (error)=>{
            if(error) return next(error);
            res.redirect('/')
        })
    })(req,res,next)
})
app.get ('/register', (req,res)=>{
        res.render("register.ejs")
})

app.post('/register' , async(req,res)=>{

    let hashPass = await bcrypt.hash(req.body.password, 10);
    // 해쉬 (숫자) 는 보통 10 (코드를 몇번 꼬아서 보여줄거냐?)
    // 해킹 방어 중 하나 bcrypt.
    
    console.log(hashPass)

    try{
    await db.collection("users").insertOne({
        userid : req.body.userid,
        password: hashPass
    })
    // 데이터를 정확하게 넣기위해 (보안적인 요소)
    }catch(error){
        console.log(error)
    }
        res.redirect('/')


        // res.send("성공")
})

    





// 1.Uniform Interface
// 여러 URL 과 METHOD 는 일관성이 있어야 하며, 하나의 URL 에서는 하나의 데이터만 가져오게 디자인하며, 간결하고 예측 가능한 URL 과 METHOD를 만들어야 한다.

// 동사보다는 명사 위주로
// 띄어쓰기는 언더바 대신 대시 기호 
// 파일 확장자는 사용금지
// 하위 문서를 뜻할 땐 / (슬러쉬)기호를 사용

// 2. 클라이언트와 서버역활 구분 
// 유저에게 서버 역활을 맡기거나 직접 입출력을 시키면 안된다.

// 3. stateless 
// 요청들은 서로 의존성이 있으면 안되고, 각각 독립적으로 처리되어야 한다.

// 4. Cacheable 
// 서버가 보내는 자료는 캐싱이 가능해야 한다. 대부분 컴퓨터가 동작

// 5. Layered System
// 서버 기능을 만들 때 레이어를 걸쳐서 코드가 실행되어야 한다.

// 6. Code on Demeand
// 서버는 실행 가능한 코드를 보낼 수 있다.