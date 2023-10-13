const express = require("express"); 
const app = express();
const port = 5000
const dotenv = require('dotenv');


let db;
let sample;


const url = `mongodb+srv://${process.env.MOGODB_ID}:${process.env.MOGODB_PW}@beomseok.brllotx.mongodb.net/`


app.use(express.static(__dirname +'/public'))
const {MongoClient, ObjectId} = require('mongodb');


new MongoClient(url).connect().then((client)=>{
    db = client.db('board');
    sample = client.db('sample_restaurants')
    console.log('DB 연결 완료')
    app.listen(process.env.SERVER_PORT, ()=>{
        console.log(`${port}번호에서 서버 실행 중`)
        // console.log("5000번 포트 서버 실행") 
    })
}).catch((error)=>{
    console.log(error)
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
app.get('/list',async (req,res)=>{

    const result = await db.collection('notice').find().toArray()
    // find 는 전체 문서 find(1) 은 하나만 들고 온다는 뜻이다.
    // 데이터가 로딩 되기전에 완료가 되면 아래 코드를 실행해 주세요 라는 뜻.(같은 뜻 인 then 도 있다.)

    // result()
    console.log(result[0])
    res.render("list.ejs", {
       data : result
    })

    // ejs 파일은 렌더링 이 필요하다. 파일을 사용하지 않아도 됨
})
app.get('/view/:id', async (req,res)=>{
    const result = await db.collection("notice").findOne({

        _id :new ObjectId(req.params.id)
    })
    console.log(result)
    res.render("view.ejs", {
        data : result
     })
   
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