require('dotenv').config({path: './.env'})

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../api');
const should = chai.should()
chai.use(chaiHttp);

const Post = require('../api/models/Post');

before((done) => {
    mongoose.connect(process.env.MONGO_TEST_URI);

    mongoose.connection.once('open', ()=>{
        console.log('Database connected')
        done();
    }).on('error', (error) => {
        console.log('Error in connecting DB: ', error);
    })
})

beforeEach((done) => {
    Post.deleteMany({}, (err) => {
        done();
    })
})

describe('Posts', () => {
    describe('/POST new post', () => { 
        it('Create a new post', (done) => {
            const newPost = {
                "title": "Title 1",
                "caption": "Caption 1",
                // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc0NzFlZjZhZDQwYzI4YTkzMzdkMWQiLCJpYXQiOjE2Njg1ODM5NjZ9.QT-m1m5z9KLhAZHu6GUD0To2UQme2D7yoUMqEs2wA6Q"
            }
            chai.request(server)
                .post('/api/posts')
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc0OTVkYTg4MWVlODdjMTgwNGQ3NDEiLCJpYXQiOjE2Njg1ODQ5MjJ9.Ogg2Ap_oMFlRmjOXSwCbS4Lim3zbFeZpR9X7cMucfIc')
                .send(newPost)
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.have.property('postData')
                    done();
                })
        })
        it('Not create a new post without title', (done) => {
            const newPost = {
                "title": "",
                "caption": "Caption 1",
                // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc0NzFlZjZhZDQwYzI4YTkzMzdkMWQiLCJpYXQiOjE2Njg1ODM5NjZ9.QT-m1m5z9KLhAZHu6GUD0To2UQme2D7yoUMqEs2wA6Q"
            }
            chai.request(server)
                .post('/api/posts')
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc0OTVkYTg4MWVlODdjMTgwNGQ3NDEiLCJpYXQiOjE2Njg1ODQ5MjJ9.Ogg2Ap_oMFlRmjOXSwCbS4Lim3zbFeZpR9X7cMucfIc')
                .send(newPost)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('message')
                    done();
                })
        })
     })
})