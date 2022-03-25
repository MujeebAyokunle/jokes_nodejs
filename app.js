const express = require('express');
const db = require('./database');
const bodyParser = require('body-parser');
const requestApiCall = require('./request');
const cors = require('cors');

// const { stringify } = require('querystring');
//express app
const app = express();

app.use(cors());

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    // res.sendFile('./views/index.html', {root : __dirname})
    // res.render('index', {title : ""});
    
})

app.post('/post', async (req, res) => {
    
    const _url = 'https://api.chucknorris.io/jokes/search?query=all';
    
    requestApiCall.callApi(_url, (response) => {
        
        let result = response['result'];            
        result.forEach((element, index) => {
            let category = '';

            

            if (!element['categories'][0]) {
                category = 'Uncategorized';                
            } else {
                category = element['categories'][0];
            }
            
            // let tempArray = [element];
            db.promise().query('INSERT INTO JOKES (id, joke, categories, likes, dislikes) VALUES (?, ?, ?, ?, ?)', [index, element['value'], category, 0, 0]); 
        }); 
        
        res.json({'status' : 'success', 'message': 'Jokes uploaded successfully', jokes: result[0]['id']});
    })    
    
})

app.post('/homepage', async (req, res) => {        
    
    let {pagenumber, category} = req.body;

    if (!pagenumber) {
        res.json({'status' : 'error', 'message' : 'Page number is empty'})
        res.end()
    }

    let page_size = 6 * parseInt(pagenumber);    
    let defaultlist

    if (category != '') {
        defaultlist = await db.promise().query("SELECT * FROM jokes WHERE categories = ? LIMIT ?", [category, page_size]);
    } else {
        defaultlist = await db.promise().query("SELECT * FROM jokes LIMIT ?", [page_size]);
    }
        
    let categories = await db.promise().query("SELECT DISTINCT categories as category FROM jokes");
    
    res.json({'status' : 'success', 'categories': categories, 'historylist': defaultlist, page: pagenumber});        
})

app.post('/search', async (req, res) => {        
    
    let {searchtext, pagenumber} = req.body;

    if (!searchtext) {        
        res.json({'status' : 'error', 'message' : 'Search text is empty'})
        res.end()
    }

    let page_size = 6 * parseInt(pagenumber);    
                    
    let defaultlist = await db.promise().query("SELECT * FROM jokes WHERE categories LIKE ? OR joke LIKE ? LIMIT ?", [searchtext, searchtext, page_size]);
    
    res.json({'status' : 'success', 'historylist': defaultlist, page: pagenumber});        
})

app.post('/alterlike', async (req, res) => {        
    
    let {id, task, pagenumber} = req.body;

    if (!id) {
        res.json({'status' : 'error', 'message' : 'Something went wrong. Please try again'});
        res.end();
    }
                    
    let joke = await db.promise().query("SELECT * FROM jokes WHERE id = ?", [id]);

    let val = Number(joke[0][0]['likes']);   
    let dbDislike = Number(joke[0][0]['dislikes']);    

    if (task == 'like') {

        let newValue = val + 1;
        
        let sql = await db.promise().query("UPDATE jokes SET likes = '?' WHERE id = ?", [newValue, id])    
        if (sql[1] == null) {

            let page_size = 6 * parseInt(pagenumber);                    
            let defaultlist = await db.promise().query("SELECT * FROM jokes WHERE categories = 'Uncategorized' LIMIT ?", [page_size]);

            let joke = await db.promise().query("SELECT * FROM jokes WHERE id = ?", [id]);

            res.json({'status' : 'success', 'defaultList': defaultlist, 'selectedJoke' : joke});
            
            res.end();
        }   
        
    } else {
        let newValue = dbDislike + 1;
        
        let sql = await db.promise().query("UPDATE jokes SET dislikes = '?' WHERE id = ?", [newValue, id])    
        if (sql[1] == null) {

            let page_size = 6 * parseInt(pagenumber);                    
            let defaultlist = await db.promise().query("SELECT * FROM jokes WHERE categories = 'Uncategorized' LIMIT ?", [page_size]);

            let joke = await db.promise().query("SELECT * FROM jokes WHERE id = ?", [id]);
            res.json({'status' : 'success', 'defaultList': defaultlist, 'selectedJoke' : joke});
            
            res.end();
        }
    }
    
})

app.use((req, res) => {
    // res.sendFile('./views/404.html', {root : __dirname})
    // res.render('404', {title : "404 page"});
    res.send("404 page");
})

app.listen(2000);